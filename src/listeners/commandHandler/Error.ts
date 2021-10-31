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

import * as Sentry from "@sentry/node";
import { Command, Listener } from "discord-akairo";
import type { Message } from "discord.js";

export default class extends Listener {
  constructor() {
    super("error", {
      emitter: "commandHandler",
      event: "error"
    });
  }

  public async exec(error: Error, message: Message, command: Command) {
    this.client.logger.error(`CommandError: Command - ${command} | Request - "${message.content}"\n${error.stack}`);
    Sentry.captureException(error);

    const transaction = this.client.transactions.get(message.id);
    if (transaction) {
      transaction.setStatus("error");
      transaction.setData("error", error);
      transaction.finish();
      this.client.transactions.delete(message.id);
    }

    return message.reply(`\`${command}\` 명령어를 처리하는 와중에 오류가 발생하였습니다.\n\`\`\`\n${error.stack}\n\`\`\``);
  }
}
