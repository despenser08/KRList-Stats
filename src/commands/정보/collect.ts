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

import { Command } from "discord-akairo";
import type { Message } from "discord.js";

export default class extends Command {
  constructor() {
    super("수집", {
      aliases: ["수집", "collect", "track", "추적"],
      description: {
        content: "해당 봇이나 서버의 정보를 수집합니다.",
        usage: '<"봇" | "서버"> <봇 | 서버>'
      },
      args: [
        {
          id: "action",
          type: [
            ["bot", "봇"],
            ["server", "서버"]
          ],
          prompt: {
            start: '"봇" | "서버"를 입력해 주세요.',
            retry: '"봇" | "서버"를 입력해 주세요.'
          }
        },
        {
          id: "rest",
          match: "rest",
          prompt: { start: "봇 | 서버를 입력해 주세요." }
        }
      ]
    });
  }

  public async exec(message: Message, { action, rest }: { action: "bot" | "server"; rest: string }) {
    message.content = `${message.util?.parsed?.prefix}${action}collect ${rest}`;
    return this.handler.handle(message);
  }
}
