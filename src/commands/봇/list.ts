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

import axios from "axios";
import { Argument, Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { Colors, KoreanbotsEndPoints } from "../../lib/constants";
import { RawBot } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";

export default class extends Command {
  constructor() {
    super("리스트", {
      aliases: ["리스트", "list"],
      description: {
        content: "카테고리로 봇 리스트를 보여줍니다.",
        usage: '<"하트" [페이지 번호]> | <"신규">'
      },
      args: [
        {
          id: "category",
          type: [
            ["votes", "투표", "vote", "heart", "hearts", "하트"],
            ["new", "신규", "최신"]
          ],
          prompt: {
            start: '"하트" | "신규"를 입력해 주세요.',
            retry: '"하트" | "신규"를 입력해 주세요.'
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
    { category, page }: { category: "votes" | "new"; page: number }
  ) {
    const msg = await message.channel.send("잠시만 기다려주세요...");

    if (category === "votes") {
      await axios
        .get(KoreanbotsEndPoints.API.voteList(page))
        .then(
          async ({
            data: {
              data: { data }
            }
          }: {
            data: { data: { data: RawBot[] } };
          }) => {
            const res = data.map((rawBot) => convert.bot(rawBot));

            return msg.edit(
              "",
              new MessageEmbed()
                .setColor(Colors.PRIMARY)
                .setTitle("봇 투표순 리스트")
                .setDescription(
                  res
                    .map(
                      (bot, index) =>
                        `**${index + 1 + 16 * (page - 1)}.** [${bot.name}#${
                          bot.tag
                        }](${KoreanbotsEndPoints.URL.bot(bot.id)}) (<@!${
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
          }
        )
        .catch((e) => {
          this.client.logger.warn(
            `FetchError: Error occurred while fetching bot votes list:\n${e}`
          );
          return msg.edit(
            `투표 봇 리스트를 가져오는 중에 에러가 발생하였습니다.\n${e}`
          );
        });
    } else {
      await axios
        .get(KoreanbotsEndPoints.API.newList())
        .then(
          async ({
            data: {
              data: { data }
            }
          }: {
            data: { data: { data: RawBot[] } };
          }) => {
            const res = data.map((rawBot) => convert.bot(rawBot));

            return msg.edit(
              "",
              new MessageEmbed()
                .setColor(Colors.PRIMARY)
                .setTitle("신규 봇 리스트")
                .setDescription(
                  res
                    .map(
                      (bot, index) =>
                        `**${index + 1}.** [${bot.name}#${
                          bot.tag
                        }](${KoreanbotsEndPoints.URL.bot(bot.id)}) (<@!${
                          bot.id
                        }>) ${bot.status.emoji} [서버: ${bot.servers || "N/A"}]`
                    )
                    .join("\n")
                )
                .setTimestamp()
            );
          }
        )
        .catch((e) => {
          this.client.logger.warn(
            `FetchError: Error occurred while fetching bot new list:\n${e}`
          );
          return msg.edit(
            `신규 봇 리스트를 가져오는 중에 에러가 발생하였습니다.\n${e}`
          );
        });
    }
  }
}
