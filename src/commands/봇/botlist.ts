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

import { hyperlink, userMention } from "@discordjs/builders";
import * as Sentry from "@sentry/node";
import axios, { AxiosError } from "axios";
import { Argument, Command } from "discord-akairo";
import type { Message } from "discord.js";
import { KoreanlistEndPoints } from "../../lib/constants";
import type { FetchListResponse, RawBot } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";
import isInterface from "../../lib/utils/isInterface";
import KRLSEmbed from "../../lib/utils/KRLSEmbed";

export default class extends Command {
  constructor() {
    super("봇리스트", {
      aliases: ["봇리스트", "botlist"],
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
    const msg = await message.reply("잠시만 기다려주세요...");

    if (category === "votes") {
      await axios
        .get<FetchListResponse<RawBot>>(KoreanlistEndPoints.API.voteList(page))
        .then(async ({ data: { data } }) => {
          const res = data?.data.map((rawBot) => convert.bot(rawBot));
          if (!res) {
            this.client.logger.warn(
              "FetchError: Bot vote list:\nData is empty."
            );
            return msg.edit(
              "투표 봇 리스트의 응답이 비어있습니다. 다시 시도해주세요."
            );
          }

          return msg.edit({
            content: null,
            embeds: [
              new KRLSEmbed()
                .setTitle("봇 투표순 리스트")
                .setDescription(
                  res
                    .map(
                      (bot, index) =>
                        `**${index + 1 + 16 * (page - 1)}.** ${hyperlink(
                          `${bot.name}#${bot.tag}`,
                          KoreanlistEndPoints.URL.bot({
                            id: bot.id,
                            flags: bot.flags,
                            vanity: bot.vanity
                          })
                        )}(${userMention(bot.id)}) ${
                          bot.status?.emoji
                        } [서버: ${bot.servers ?? "N/A"}] - ❤️${bot.votes}`
                    )
                    .join("\n")
                )
                .setFooter(`페이지 ${page}`)
                .setTimestamp()
            ]
          });
        })
        .catch((e) => {
          if (isInterface<AxiosError>(e, "response")) {
            this.client.logger.warn(`FetchError: Bot vote list:\n${e.stack}`);
            return msg.edit({
              content: null,
              embeds: [
                new KRLSEmbed().setDescription(
                  `투표 봇 리스트를 가져오는 중에 에러가 발생하였습니다.\n${e}`
                )
              ]
            });
          } else {
            this.client.logger.error(`Error: Bot vote list:\n${e.stack}`);
            Sentry.captureException(e);
            return msg.edit({
              content: null,
              embeds: [
                new KRLSEmbed().setDescription(
                  `투표 봇 리스트를 가져오는 중에 에러가 발생하였습니다.\n${e}`
                )
              ]
            });
          }
        });
    } else {
      await axios
        .get<FetchListResponse<RawBot>>(KoreanlistEndPoints.API.newList())
        .then(async ({ data: { data } }) => {
          const res = data?.data.map((rawBot) => convert.bot(rawBot));
          if (!res) {
            this.client.logger.warn(
              "FetchError: Bot new list:\nData is empty."
            );
            return msg.edit(
              "신규 봇 리스트의 응답이 비어있습니다. 다시 시도해주세요."
            );
          }

          return msg.edit({
            content: null,
            embeds: [
              new KRLSEmbed()
                .setTitle("신규 봇 리스트")
                .setDescription(
                  res
                    .map(
                      (bot, index) =>
                        `**${index + 1}.** [${bot.name}#${
                          bot.tag
                        }](${KoreanlistEndPoints.URL.bot({
                          id: bot.id,
                          flags: bot.flags,
                          vanity: bot.vanity
                        })}) (<@${bot.id}>) ${bot.status?.emoji} [서버: ${
                          bot.servers ?? "N/A"
                        }]`
                    )
                    .join("\n")
                )
                .setTimestamp()
            ]
          });
        })
        .catch((e) => {
          if (isInterface<AxiosError>(e, "response")) {
            this.client.logger.warn(`FetchError: Bot new list:\n${e.stack}`);
            return msg.edit({
              content: null,
              embeds: [
                new KRLSEmbed().setDescription(
                  `신규 봇 리스트를 가져오는 중에 에러가 발생하였습니다.\n${e}`
                )
              ]
            });
          } else {
            this.client.logger.error(`Error: Bot new list:\n${e.stack}`);
            Sentry.captureException(e);
            return msg.edit({
              content: null,
              embeds: [
                new KRLSEmbed().setDescription(
                  `신규 봇 리스트를 가져오는 중에 에러가 발생하였습니다.\n${e}`
                )
              ]
            });
          }
        });
    }
  }
}
