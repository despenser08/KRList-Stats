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

import { Args, CommandErrorPayload, Event, Events } from "@sapphire/framework";

export default class extends Event<Events.CommandError> {
  public async run(err: Error, piece: CommandErrorPayload<Args>) {
    this.context.logger.fatal(`Requested: "${piece.message.content}"\nError on "${piece.command.name}" command: ${err.message}\n${err.stack}`);

    return piece.message.reply(`\`${piece.command.name}\` 명령어를 처리하는 와중에 오류가 발생하였습니다.\n\`\`\`${err}\`\`\``);
  }
}
