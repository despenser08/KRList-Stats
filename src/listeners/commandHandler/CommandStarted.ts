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
import { Message } from "discord.js";

export default class extends Listener {
  constructor() {
    super("commandStarted", {
      emitter: "commandHandler",
      event: "commandStarted"
    });
  }

  public async exec(message: Message, command: Command) {
    return this.client.transactions.set(
      message.id,
      Sentry.startTransaction({
        op: `command_${command.id}`,
        name: `명령어 - ${command.id}`,
        data: {
          message: message.content,
          author: message.author.id
        }
      })
    );
  }
}
