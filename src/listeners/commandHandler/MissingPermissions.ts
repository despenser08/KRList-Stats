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

import { Command, Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class extends Listener {
  public constructor() {
    super("missingPermissions", {
      emitter: "commandHandler",
      event: "missingPermissions"
    });
  }

  public async exec(
    message: Message,
    command: Command,
    type: string,
    missing: unknown
  ) {
    return message.channel.send(
      `${
        type === "user"
          ? `${message.author}님은 \`${missing}\` 권한이 없어`
          : `현재 봇이 \`${missing}\` 권한이 없어`
      } \`${command}\` 명령어를 사용하실 수 없습니다.`
    );
  }
}
