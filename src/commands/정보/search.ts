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
import BotDB from "../../lib/database/models/Bot";
import ServerDB from "../../lib/database/models/Server";
import type { FetchResponse, SearchAllResult } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";
import isInterface from "../../lib/utils/isInterface";
import KRLSEmbed from "../../lib/utils/KRLSEmbed";
import KRLSPaginator from "../../lib/utils/KRLSPaginator";

export default class extends Command {
  constructor() {
    super("검색", {
      aliases: ["검색", "search", "전체검색", "allsearch"],
      description: {
        content: "검색으로 전체 리스트를 보여줍니다.",
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

  public async exec(message: Message, { query, page }: { query: string; page: number }) {
    const msg = await message.reply("잠시만 기다려주세요...");

    await axios
      .get<FetchResponse<SearchAllResult>>(KoreanlistEndPoints.API.searchAll(query, page))
      .then(async ({ data: { data } }) => {
        if (!data) {
          this.client.logger.warn("FetchError: Search list:\nData is empty.");
          return msg.edit("검색 리스트의 응답이 비어있습니다. 다시 시도해주세요.");
        }
        const serverRes = data.servers.map((rawServer) => convert.server(rawServer));
        const botRes = data.bots.map((rawBot) => convert.bot(rawBot));

        if (serverRes.length < 1 && botRes.length < 1) return msg.edit(`"${query}"에 대한 전체 검색 결과가 없습니다.`);
        else {
          const paginator = new KRLSPaginator({
            pages: [
              {
                embeds: [
                  new KRLSEmbed()
                    .setTitle(`"${query}"에 대한 전체 검색 결과입니다.`)
                    .setDescription(
                      `**봇 검색 결과**\n\n${
                        botRes.length < 1
                          ? "봇 검색 결과가 없습니다."
                          : botRes
                              .map(
                                (bot, index) =>
                                  `**${index + 1 + 16 * (page - 1)}.** ${hyperlink(
                                    `${bot.name}#${bot.tag}`,
                                    KoreanlistEndPoints.URL.bot({
                                      id: bot.id,
                                      flags: bot.flags,
                                      vanity: bot.vanity
                                    })
                                  )} (${userMention(bot.id)}) ${bot.status?.emoji} [서버: ${bot.servers ?? "N/A"}] - ❤️${bot.votes}`
                              )
                              .join("\n")
                      }`
                    )
                    .setFooter(`페이지 ${page}`)
                    .setTimestamp()
                ]
              },
              {
                embeds: [
                  new KRLSEmbed()
                    .setTitle(`"${query}"에 대한 전체 검색 결과입니다.`)
                    .setDescription(
                      `**서버 검색 결과**\n\n${
                        serverRes.length < 1
                          ? "서버 검색 결과가 없습니다."
                          : serverRes
                              .map(
                                (server, index) =>
                                  `**${index + 1 + 16 * (page - 1)}.** ${hyperlink(
                                    server.name,
                                    KoreanlistEndPoints.URL.server({
                                      id: server.id,
                                      flags: server.flags,
                                      vanity: server.vanity
                                    })
                                  )} [멤버: ${server.members ?? "N/A"}] - ❤️${server.votes}`
                              )
                              .join("\n")
                      }`
                    )
                    .setFooter(`페이지 ${page}`)
                    .setTimestamp()
                ]
              }
            ]
          });

          paginator.run(message, msg);

          for (let i = 0; i < botRes.length; i++) {
            const botDB = await BotDB.findOne({
              id: botRes[i].id,
              track: true
            });
            if (!botDB) continue;

            botDB.keywords.set(query, (botDB.keywords.get(query) ?? 0) + 1);
            botDB.save();
          }

          for (let i = 0; i < serverRes.length; i++) {
            const serverDB = await ServerDB.findOne({
              id: serverRes[i].id,
              track: true
            });
            if (!serverDB) continue;

            serverDB.keywords.set(query, (serverDB.keywords.get(query) ?? 0) + 1);
            serverDB.save();
          }

          return;
        }
      })
      .catch((e) => {
        if (isInterface<AxiosError>(e, "response")) {
          switch (e.response?.status) {
            case 404:
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`해당 검색어를 찾을 수 없습니다. (입력: \`${query}\`)\n${e}`)]
              });

            case 400:
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`잘못된 입력입니다. 다시 시도해주세요. (입력: \`${query}\`)\n${e}`)]
              });

            default:
              this.client.logger.warn(`FetchError: Search list - "${query}":\n${e.stack}`);
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`전체 검색 리스트를 가져오는 중에 에러가 발생하였습니다. (입력: \`${query}\`)\n${e}`)]
              });
          }
        } else {
          this.client.logger.error(`Error: Search list - "${query}":\n${e.stack}`);
          Sentry.captureException(e);
          return msg.edit({
            content: null,
            embeds: [new KRLSEmbed().setDescription(`전체 검색 리스트를 가져오는 중에 에러가 발생하였습니다. (입력: \`${query}\`)\n${e}`)]
          });
        }
      });
  }
}
