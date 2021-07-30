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

import { AkairoClient, CommandHandler, ListenerHandler } from "discord-akairo";
import Dokdo from "dokdo";
import path from "path";
import { Logger as WinstonLogger } from "winston";
import { owners } from "../config";
import connect from "../lib/database/connect";
import Logger from "./Logger";

declare module "discord-akairo" {
  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    inhibitorHandler: InhibitorHandler;
    logger: WinstonLogger;
    dokdo: Dokdo;
  }
}

export default class KRBSClient extends AkairoClient {
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: path.join(__dirname, "..", "listeners"),
    automateCategories: true
  });

  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: path.join(__dirname, "..", "commands"),
    prefix: JSON.parse(process.env.PREFIX),
    automateCategories: true,
    handleEdits: true,
    commandUtil: true,
    argumentDefaults: {
      prompt: {
        modifyStart: (_, str) =>
          `${str}\n\n\`취소\`를 입력해서 명령어를 취소할 수 있습니다.`,
        modifyRetry: (_, str) =>
          `${str}\n\n\`취소\`를 입력해서 명령어를 취소할 수 있습니다.`,
        timeout: "입력 시간이 초과되었습니다.",
        ended: "입력 최대 시도 횟수를 초과하였습니다.",
        cancel: "취소되었습니다.",
        retries: 3,
        cancelWord: "취소"
      },
      otherwise: ""
    },
    ignorePermissions: owners
  });

  public logger = Logger("BOT");

  public dokdo = new Dokdo(this, {
    prefix: JSON.parse(process.env.PREFIX)[0],
    aliases: [
      "dokdo",
      "dok",
      "독도",
      "evaluate",
      "eval",
      "이발",
      "execute",
      "exec",
      "실행"
    ],
    owners: owners,
    noPerm: (message) => message.channel.send("봇 관리자 전용 명령어입니다.")
  });

  constructor() {
    super({ ownerID: owners });
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

    connect()
      .then((m) => this.logger.info(`Database ${m.connection.host} connected.`))
      .catch((e) => this.logger.error(`Database connect error: ${e}`));
  }

  public async start(token?: string) {
    await this._init();
    return this.login(token);
  }
}