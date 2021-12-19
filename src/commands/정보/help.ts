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

import { botDescription, KoreanlistEndPoints } from "#lib/constants";
import { envParseString } from "#lib/env";
import type { FetchResponse, RawBot } from "#lib/types";
import convert from "#utils/convertRawToType";
import KRLSEmbed from "#utils/KRLSEmbed";
import KRLSPaginator from "#utils/KRLSPaginator";
import axios from "axios";
import { Argument, Category, Command } from "discord-akairo";
import { Message, MessageActionRow, MessageButton } from "discord.js";

export default class HelpCommand extends Command {
  constructor() {
    super("도움말", {
      aliases: ["도움말", "help", "도움", "헬프", "command", "cmd", "commands", "cmds", "명령어", "커맨드"],
      channel: "guild",
      description: {
        content: "도움말을 보여줍니다.",
        usage: "[명령어 | 카테고리]"
      },
      args: [
        {
          id: "cmdOrCtgry",
          type: Argument.union("commandAlias", (_, str) => this.handler.categories.get(str) ?? null),
          prompt: {
            optional: true,
            retry: `명령어 | 카테고리를 입력해 주세요.`
          }
        }
      ]
    });
  }

  public async exec(message: Message, { cmdOrCtgry }: { cmdOrCtgry?: Command | Category<string, Command> }) {
    if (cmdOrCtgry instanceof Command)
      return message.reply({
        embeds: [
          new KRLSEmbed()
            .setTitle(`명령어 자세히보기 | ${cmdOrCtgry}`)
            .setThumbnail(this.client.user?.displayAvatarURL({ dynamic: true }) ?? "")
            .setDescription(
              `${botDescription}\n\n**별칭**: ${cmdOrCtgry.aliases ? cmdOrCtgry.aliases.map((v) => `\`${v}\``).join(", ") : "별칭 없음"}\n**설명**: ${
                cmdOrCtgry.description.content ?? "설명 없음"
              }\n**사용법**: ${`${message.util?.parsed?.prefix}${cmdOrCtgry} ${cmdOrCtgry.description.usage ?? ""}` ?? "사용법 없음"}`
            )
        ]
      });
    else if (cmdOrCtgry instanceof Category)
      return message.reply({
        embeds: [
          new KRLSEmbed()
            .setTitle(`카테고리 자세히보기 | ${cmdOrCtgry}`)
            .setThumbnail(this.client.user?.displayAvatarURL({ dynamic: true }) ?? "")
            .setDescription(
              `${botDescription}\n\n${
                cmdOrCtgry
                  .filter((cmd) => cmd.aliases.length > 0)
                  .map((cmd) => `• **${cmd.id}** - ${cmd.description.content}`)
                  .join("\n") ?? "이 카테고리에는 명령어가 없습니다."
              }`
            )
        ]
      });
    else {
      const clientbot = this.client.user?.id
        ? await axios
            .get<FetchResponse<RawBot>>(KoreanlistEndPoints.API.bot(this.client.user.id))
            .then(async ({ data }) => (data.data ? convert.bot(data.data) : null))
            .catch(() => null)
        : null;

      const paginator = new KRLSPaginator();

      if (clientbot)
        paginator.setActionRows([
          new MessageActionRow().addComponents(
            new MessageButton().setURL(KoreanlistEndPoints.URL.botVote(clientbot)).setEmoji("❤️").setLabel("하트 추가").setStyle("LINK"),
            new MessageButton()
              .setURL(`https://discord.gg/${clientbot.discord}`)
              .setEmoji("911823414623367188")
              .setLabel("서포트 서버")
              .setStyle("LINK"),
            // PLEASE DO NOT REMOVE OR EDIT THIS BUTTON CODE; This button is for show credits
            new MessageButton()
              .setURL("https://github.com/despenser08/KRList-Stats")
              .setEmoji("900808324667301919")
              .setLabel("KRList-Stats GitHub")
              .setStyle("LINK")
          )
        ]);
      else
        paginator.setActionRows([
          new MessageActionRow().addComponents(
            // PLEASE DO NOT REMOVE OR EDIT THIS BUTTON CODE; This button is for show credits
            new MessageButton()
              .setURL("https://github.com/despenser08/KRList-Stats")
              .setEmoji("900808324667301919")
              .setLabel("KRList-Stats GitHub")
              .setStyle("LINK")
          )
        ]);

      for (const category of this.handler.categories.values())
        paginator.addPage({
          embeds: [
            new KRLSEmbed()
              .setTitle("도움말")
              .setThumbnail(this.client.user?.displayAvatarURL({ dynamic: true }) ?? "")
              .setDescription(botDescription)
              .addField(
                category.id,
                category
                  .filter((cmd) => cmd.aliases.length > 0)
                  .map((cmd) => `• **${cmd.id}** - ${cmd.description.content}`)
                  .join("\n") ?? "이 카테고리에는 명령어가 없습니다."
              )
              .setFooter(`v${envParseString("VERSION")} • ${envParseString("REVISION").slice(0, 7)}`)
          ]
        });

      return paginator.run(message);
    }
  }
}
