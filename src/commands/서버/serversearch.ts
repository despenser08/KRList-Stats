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

import { KoreanlistEndPoints } from "#lib/constants";
import type { FetchListResponse, RawServer } from "#lib/types";
import convert from "#utils/convertRawToType";
import KRLSEmbed from "#utils/KRLSEmbed";
import { hyperlink } from "@discordjs/builders";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { Argument, Command } from "discord-akairo";
import type { Message } from "discord.js";

export default class ServerSearchCommand extends Command {
  constructor() {
    super("서버검색", {
      aliases: ["서버검색", "serversearch"],
      description: {
        content: "검색으로 서버 리스트를 보여줍니다.",
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
      .get<FetchListResponse<RawServer>>(KoreanlistEndPoints.API.searchServer(query, page))
      .then(async ({ data: { data } }) => {
        const res = data?.data.map((rawServer) => convert.server(rawServer));

        if (!res || res.length < 1) return msg.edit(`"${query}"에 대한 서버 검색 결과가 없습니다.`);
        else
          return msg.edit({
            content: null,
            embeds: [
              new KRLSEmbed()
                .setTitle(`"${query}"에 대한 서버 검색 결과입니다.`)
                .setDescription(
                  res
                    .map(
                      (server, index) =>
                        `**${index + 1 + 16 * (page - 1)}.** ${hyperlink(server.name, KoreanlistEndPoints.URL.server(server))} [멤버: ${
                          server.members ?? "N/A"
                        }] - ❤️${server.votes}`
                    )
                    .join("\n")
                )
                .setFooter(`페이지 ${page}`)
                .setTimestamp()
            ]
          });
      })
      .catch((e) => {
        if (axios.isAxiosError(e)) {
          switch (e.response?.status) {
            case 404:
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`해당 서버를 찾을 수 없습니다. (입력: \`${query}\`)\n${e}`)]
              });

            case 400:
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`잘못된 입력입니다. 다시 시도해주세요. (입력: \`${query}\`)\n${e}`)]
              });

            default:
              this.client.logger.warn(`FetchError: Server search list - "${query}":\n${e.stack}`);
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`서버 검색 리스트를 가져오는 중에 에러가 발생하였습니다. (입력: \`${query}\`)\n${e}`)]
              });
          }
        } else {
          this.client.logger.error(`Error: Server search list - "${query}":\n${e.stack}`);
          Sentry.captureException(e);
          return msg.edit({
            content: null,
            embeds: [new KRLSEmbed().setDescription(`서버 검색 리스트를 가져오는 중에 에러가 발생하였습니다. (입력: \`${query}\`)\n${e}`)]
          });
        }
      });
  }
}
