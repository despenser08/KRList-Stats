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

import axios, { AxiosError } from "axios";
import { Argument, Command } from "discord-akairo";
import { Message, MessageEmbed, Util } from "discord.js";
import { Colors, KoreanbotsEndPoints } from "../../lib/constants";
import Bot from "../../lib/database/models/Bot";
import { RawBot } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";
import isInterface from "../../lib/utils/isInterface";

export default class extends Command {
  constructor() {
    super("검색", {
      aliases: ["검색", "search"],
      description: {
        content: "검색으로 봇 리스트를 보여줍니다.",
        usage: '"<검색어>" [페이지 번호]'
      },
      args: [
        {
          id: "query",
          prompt: {
            start: "검색어를 입력해 주세요."
          }
        },
        {
          id: "page",
          type: Argument.range("integer", 1, Infinity),
          prompt: {
            optional: true,
            retry: "페이지 번호(자연수)를 입력해 주세요."
          },
          default: 1
        }
      ]
    });
  }

  public async exec(
    message: Message,
    { query, page }: { query: string; page: number }
  ) {
    const msg = await message.channel.send("잠시만 기다려주세요...");

    await axios
      .get(KoreanbotsEndPoints.API.search(query, page))
      .then(
        async ({
          data: {
            data: { data }
          }
        }: {
          data: { data: { data: RawBot[] } };
        }) => {
          const res = data.map((rawBot) => convert.bot(rawBot));

          if (res.length < 1)
            return msg.edit(
              new MessageEmbed()
                .setColor(Colors.PRIMARY)
                .setDescription(`"${query}"에 대한 검색 결과가 없습니다.`)
            );
          else {
            msg.edit(
              "",
              new MessageEmbed()
                .setColor(Colors.PRIMARY)
                .setTitle(`"${query}"에 대한 검색 결과입니다.`)
                .setDescription(
                  res
                    .map(
                      (bot, index) =>
                        `**${index + 1 + 16 * (page - 1)}.** [${bot.name}#${
                          bot.tag
                        }](${KoreanbotsEndPoints.URL.bot(bot.id)}) (<@${
                          bot.id
                        }>) ${bot.status.emoji} [서버: ${
                          bot.servers || "N/A"
                        }] - ❤️${bot.votes}`
                    )
                    .join("\n")
                )
                .setFooter(`페이지 ${page}`)
                .setTimestamp()
            );

            for (let i = 0; i < res.length; i++) {
              const botDB = await Bot.findOne({ id: res[i].id, track: true });
              if (!botDB) continue;

              botDB.keywords.set(query, (botDB.keywords.get(query) || 0) + 1);
              botDB.save();
            }
          }
        }
      )
      .catch((e) => {
        if (isInterface<AxiosError>(e, "response"))
          switch (e.response.status) {
            case 404:
              return msg.edit(
                "",
                new MessageEmbed()
                  .setColor(Colors.PRIMARY)
                  .setDescription(
                    `해당 봇을 찾을 수 없습니다. (입력: \`${Util.escapeInlineCode(
                      query
                    )}\`)`
                  )
              );

            case 400:
              return msg.edit(
                "",
                new MessageEmbed()
                  .setColor(Colors.PRIMARY)
                  .setDescription(
                    `잘못된 입력입니다. 다시 시도해주세요. (입력: \`${Util.escapeInlineCode(
                      query
                    )}\`)`
                  )
              );

            default:
              this.client.logger.warn(
                `FetchError: Error occurred while fetching search list (input: "${query}"):\n${e.message}\n${e.stack}`
              );
              return msg.edit(
                "",
                new MessageEmbed()
                  .setColor(Colors.PRIMARY)
                  .setDescription(
                    `검색 리스트를 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                      query
                    )}\`)\n${e}`
                  )
              );
          }
        else {
          this.client.logger.warn(
            `Error: Error occurred while fetching search list (input: "${query}"):\n${e.message}\n${e.stack}`
          );
          return msg.edit(
            "",
            new MessageEmbed()
              .setColor(Colors.PRIMARY)
              .setDescription(
                `검색 리스트를 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                  query
                )}\`)\n${e}`
              )
          );
        }
      });
  }
}
