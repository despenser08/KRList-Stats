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

import { Event, Events } from "@sapphire/framework";
import type { Message } from "discord.js";
import { PREFIX } from "../config";

export class UserEvent extends Event<Events.MentionPrefixOnly> {
  public async run(message: Message) {
    return message.channel.send(`${this.context.client.user}의 접두사는 \`${PREFIX[0]}\`입니다.`);
  }
}
