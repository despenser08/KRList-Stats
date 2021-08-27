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

import { Argument, Command, Category } from "discord-akairo";
import { Message, Util } from "discord.js";
import KRBSEmbed from "../../lib/utils/KRBSEmbed";
import KRBSPaginator from "../../lib/utils/KRBSPaginator";

export default class extends Command {
  public constructor() {
    super("도움말", {
      aliases: [
        "도움말",
        "help",
        "도움",
        "헬프",
        "command",
        "cmd",
        "commands",
        "cmds",
        "명령어",
        "커맨드"
      ],
      channel: "guild",
      fullDescription: {
        content: "도움말을 보여줍니다.",
        usage: "[명령어 | 카테고리]"
      },
      args: [
        {
          id: "cmdOrCtgry",
          type: Argument.union(
            "commandAlias",
            (_, str) => this.handler.categories.get(str) || null
          ),
          prompt: {
            optional: true,
            retry: `명령어 | 카테고리를 입력해 주세요.`
          }
        }
      ]
    });
  }

  public async exec(
    message: Message,
    { cmdOrCtgry }: { cmdOrCtgry?: Command | Category<string, Command> }
  ) {
    if (cmdOrCtgry instanceof Command) {
      return message.reply({
        embeds: [
          new KRBSEmbed()
            .setTitle(`명령어 자세히보기 | ${cmdOrCtgry}`)
            .setDescription(
              `**별칭**: ${
                cmdOrCtgry.aliases
                  ? cmdOrCtgry.aliases
                      .map((v) => `\`${Util.escapeInlineCode(v)}\``)
                      .join(", ")
                  : "별칭 없음"
              }\n**설명**: ${
                cmdOrCtgry.fullDescription.content || "설명 없음"
              }\n**사용법**: ${
                `${message.util.parsed.prefix}${cmdOrCtgry} ${
                  cmdOrCtgry.fullDescription.usage || ""
                }` || "사용법 없음"
              }`
            )
        ]
      });
    } else if (cmdOrCtgry instanceof Category) {
      return message.reply({
        embeds: [
          new KRBSEmbed()
            .setTitle(`카테고리 자세히보기 | ${cmdOrCtgry}`)
            .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
              cmdOrCtgry
                .filter((cmd) => cmd.aliases.length > 0)
                .map((cmd) => `• **${Util.escapeBold(cmd.id)}**`)
                .join("\n") || "이 카테고리에는 명령어가 없습니다."
            )
        ]
      });
    }

    const paginator = new KRBSPaginator();

    for (const category of this.handler.categories.values())
      paginator.addPage({
        embeds: [
          new KRBSEmbed()
            .setTitle("도움말")
            .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
            .addField(
              category.id,
              category
                .filter((cmd) => cmd.aliases.length > 0)
                .map((cmd) => `• **${Util.escapeBold(cmd.id)}**`)
                .join("\n") || "이 카테고리에는 명령어가 없습니다."
            )
        ]
      });

    return paginator.run(message);
  }
}
