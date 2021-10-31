/**
 * Copyright (C) 2021 despenser08
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as Tracing from "@sentry/tracing";
import * as Sentry from "@sentry/node";
import type { Transaction } from "@sentry/types";
import { AkairoClient, CommandHandler, ListenerHandler } from "discord-akairo";
import { Collection, Intents } from "discord.js";
import Dokdo from "dokdo";
import { connect } from "mongoose";
import path from "path";
import { CommandBlocked } from "../lib/constants";
import createLogger from "../lib/utils/createLogger";
import moment from "moment-timezone";
import { envParseArray, envParseInteger, envParseString } from "../lib/env";
import type { Logger } from "winston";

class CustomDokdo extends Dokdo {
  owners!: string[];
}

declare module "discord-akairo" {
  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    inhibitorHandler: InhibitorHandler;
    logger: Logger;
    dokdo: CustomDokdo;
    cachedGuildCount: number;
    transactions: Collection<string, Transaction>;
  }
}

export default class KRLSClient extends AkairoClient {
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: path.join(__dirname, "..", "listeners"),
    automateCategories: true
  });

  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: path.join(__dirname, "..", "commands"),
    prefix: envParseArray("PREFIX"),
    automateCategories: true,
    handleEdits: true,
    commandUtil: true,
    argumentDefaults: {
      prompt: {
        modifyStart: (_, str) => `${str}\n\n\`취소\`를 입력해서 명령어를 취소할 수 있습니다.`,
        modifyRetry: (_, str) => `${str}\n\n\`취소\`를 입력해서 명령어를 취소할 수 있습니다.`,
        timeout: "입력 시간이 초과되었습니다.",
        ended: "입력 최대 시도 횟수를 초과하였습니다.",
        cancel: "취소되었습니다.",
        retries: 3,
        cancelWord: "취소"
      },
      otherwise: ""
    },
    ignorePermissions: envParseArray("OWNERS")
  });

  public logger = createLogger("BOT");

  public dokdo = new CustomDokdo(this, {
    prefix: envParseArray("PREFIX")[0],
    aliases: ["dokdo", "dok", "독도", "evaluate", "eval", "이발", "execute", "exec", "실행"],
    owners: envParseArray("OWNERS"),
    secrets: [
      envParseString("DISCORD_TOKEN"),
      envParseString("KOREANLIST_TOKEN"),
      envParseString("SENTRY_DSN"),
      envParseString("DB_HOST"),
      envParseString("DB_USERNAME"),
      envParseString("DB_PASSWORD"),
      envParseInteger("DB_PORT")
    ],
    noPerm: (message) => message.reply(CommandBlocked.owner)
  });

  public cachedGuildCount = 0;

  public transactions = new Collection<string, Transaction>();

  constructor() {
    super({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
      ownerID: envParseArray("OWNERS")
    });
  }

  private async _init() {
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      process
    });

    this.listenerHandler.loadAll();
    this.commandHandler.loadAll();

    connect(
      `mongodb://${envParseString("DB_USERNAME")}:${envParseString("DB_PASSWORD")}@${envParseString("DB_HOST")}/${envParseString(
        "DB_NAME"
      )}?authSource=admin`
    )
      .then((m) => this.logger.info(`Success: Connect database - ${m.connection.host}`))
      .catch((e) => this.logger.error(`Error: Connect database\n${e.stack}`));

    Sentry.init({
      integrations: [new Tracing.Integrations.Mongo({ useMongoose: true })],
      tracesSampleRate: 1
    });

    moment.tz.setDefault("Asia/Seoul").locale("ko");
  }

  public async start(token?: string) {
    await this._init();
    return this.login(token);
  }
}
