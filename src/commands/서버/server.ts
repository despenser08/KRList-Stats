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

import { KoreanlistEndPoints, KoreanlistOrigin } from "#lib/constants";
import ServerDB from "#lib/database/models/Server";
import ServerStatsDB from "#lib/database/models/ServerStats";
import { FetchResponse, RawServer, ServerFlagsEnum } from "#lib/types";
import convert from "#utils/convertRawToType";
import createChart from "#utils/createChart";
import filterStats from "#utils/filterStats";
import { filterDesc, formatNumber, getId, lineUserText } from "#utils/format";
import isInterface from "#utils/isInterface";
import KRLSEmbed from "#utils/KRLSEmbed";
import KRLSPaginator from "#utils/KRLSPaginator";
import { hyperlink, time } from "@discordjs/builders";
import * as Sentry from "@sentry/node";
import axios, { AxiosError } from "axios";
import { Argument, Command } from "discord-akairo";
import { Guild, Message, MessageAttachment, SnowflakeUtil } from "discord.js";
import moment from "moment-timezone";

export default class ServerCommand extends Command {
  constructor() {
    super("서버", {
      aliases: [
        "서버",
        "server",
        "serverinformation",
        "serverinfo",
        "서버정보",
        "serverdata",
        "서버데이터",
        "serverstat",
        "serverstats",
        "서버스텟",
        "serverstatus",
        "서버상태"
      ],
      description: {
        content: "해당 서버의 정보를 보여줍니다.",
        usage: '<서버 ["정보"] | ["멤버" | "투표" ["전체" | 최근 정보 수 | 날짜 [날짜]]]]>'
      },
      args: [
        {
          id: "guildOrId",
          type: Argument.union("guild", "string"),
          prompt: {
            start: "서버를 입력해 주세요."
          }
        },
        {
          id: "info",
          type: [
            ["info", "정보", "information"],
            ["members", "멤버", "member", "user", "users", "유저"],
            ["votes", "투표", "vote", "heart", "hearts", "하트"]
          ],
          prompt: {
            optional: true,
            retry: '"정보" | "투표" | "멤버"를 입력해 주세요.'
          },
          default: "info"
        },
        {
          id: "limit",
          type: Argument.union(Argument.range("integer", 1, Infinity), "date", ["all", "전체"]),
          prompt: {
            optional: true,
            retry: '"전체" | 최근 정보 수(자연수) | 날짜를 입력해 주세요.'
          },
          default: "all"
        },
        {
          id: "endOfDate",
          type: "date",
          prompt: {
            optional: true,
            retry: "날짜를 입력해 주세요."
          }
        }
      ]
    });
  }

  public async exec(
    message: Message,
    {
      guildOrId,
      info,
      limit,
      endOfDate
    }: {
      guildOrId: Guild | string;
      info: "info" | "votes" | "members";
      limit: "all" | number | Date;
      endOfDate?: Date;
    }
  ) {
    const msg = await message.reply("잠시만 기다려주세요...");

    const id = getId(guildOrId);

    return axios
      .get<FetchResponse<RawServer>>(KoreanlistEndPoints.API.server(id))
      .then(async ({ data }) => {
        if (!data.data) {
          this.client.logger.warn(`FetchError: Server - ${id}:\nData is empty.`);
          return msg.edit("해당 서버 데이터의 응답이 비어있습니다. 다시 시도해주세요.");
        }
        const server = convert.server(data.data);

        const serverDB = await ServerDB.findOneAndUpdate({ id: server.id }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
        const statCount = await ServerStatsDB.countDocuments({ id: server.id });

        if (info === "info") {
          const flags = server.flags.toArray();
          const created = SnowflakeUtil.deconstruct(server.id).date;
          const desc = await filterDesc(server.desc);

          const paginator = new KRLSPaginator({
            pages: [
              {
                embeds: [
                  new KRLSEmbed()
                    .setTitle(server.name)
                    .setURL(KoreanlistEndPoints.URL.server(server))
                    .setThumbnail(`${KoreanlistOrigin}${KoreanlistEndPoints.CDN.icon(server.id)}`)
                    .setDescription(
                      `https://discord.gg/${server.invite} | ${
                        serverDB.track
                          ? statCount > 0
                            ? `${moment.duration(statCount, "minutes").humanize()} 수집됨`
                            : "수집 대기중"
                          : "수집되지 않음"
                      }\n${hyperlink("하트 추가", KoreanlistEndPoints.URL.serverVote(server))} | ${hyperlink(
                        "신고하기",
                        KoreanlistEndPoints.URL.serverReport(server)
                      )}\n\n${server.intro}`
                    )
                    .addField("멤버 수", server.members ? server.members.toString() : "N/A", true)
                    .addField("투표 수", server.votes.toString(), true)
                    .addField("부스트 티어", (server.boostTier ?? 0) + "레벨", true)
                    .addField("상태", server.state, true)
                    .addField("이모지", server.emojis.length > 0 ? `${server.emojis.length}개` : "없음", true)
                    .addField("생성일", `${time(created)} (${time(created, "R")})`)
                    .addField("카테고리", server.category.length > 0 ? server.category.join(", ") : "없음")
                    .addField("소유자", lineUserText(server.owner) ?? "확인 불가능")
                    .addField("플래그", flags.length > 0 ? flags.map((flag) => ServerFlagsEnum[flag]).join(", ") : "없음")
                    .setImage(
                      KoreanlistEndPoints.OG.server(server.id, server.name, server.intro, server.category, [
                        formatNumber(server.votes),
                        formatNumber(server.members)
                      ])
                    )
                ]
              }
            ]
          });

          if (desc.res.length > 1)
            for (let i = 0; i < desc.res.length; i++)
              paginator.addPage({ embeds: [new KRLSEmbed().setTitle(`서버 설명 #${i + 1}`).setDescription(desc.res[i])] });
          else paginator.addPage({ embeds: [new KRLSEmbed().setTitle("서버 설명").setDescription(desc.res[0])] });

          for await (const image of desc.images) {
            if (image.raw)
              paginator.addPage({
                embeds: [new KRLSEmbed().setTitle(`설명 이미지 #${image.order}`).setURL(image.url).setImage(image.url)]
              });
            else
              paginator.addPage({
                embeds: [new KRLSEmbed().setTitle(`설명 이미지 #${image.order}`).setURL(image.url).setImage(`attachment://${image.order}.png`)],
                files: [image.data]
              });
          }

          if (server.banner)
            paginator.addPage({
              embeds: [new KRLSEmbed().setTitle("서버 배너").setImage(server.banner)]
            });
          if (server.bg)
            paginator.addPage({
              embeds: [new KRLSEmbed().setTitle("서버 배경").setImage(server.bg)]
            });

          return paginator.run(message, msg);
        } else {
          if (!serverDB.track)
            return msg.edit(
              `**${server.name}** 데이터가 수집되지 않았습니다. ${message.util?.parsed?.prefix}서버수집을 사용하여 서버 수집을 시작하세요.`
            );
          else if (statCount < 1) return msg.edit(`**${server.name}** 수집 대기중입니다. 잠시만 기다려주세요.`);

          const datas: (number | null)[] = [];
          const dates: string[] = [];

          const filter = await filterStats(server.id, statCount, limit, endOfDate);
          const stats = await ServerStatsDB.find(filter.query, {}, { skip: filter.skip, sort: { updated: 1 } });

          for await (const stat of stats) {
            datas.push(stat[info] ?? null);
            dates.push(moment(stat.updated).format("YYYY/MM/DD HH:mm"));
          }

          const color = info === "members" ? "rgb(51, 102, 255)" : "rgb(255, 0, 0)";
          const statName = info === "members" ? "멤버" : "투표";

          const chart = await createChart(1920, 1080, {
            type: "line",
            data: {
              labels: dates,
              datasets: [
                {
                  label: `${statName} 수`,
                  data: datas,
                  backgroundColor: [color],
                  borderColor: [color],
                  borderWidth: 5,
                  pointRadius: 0,
                  tension: 0.1
                }
              ]
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: `${server.name} ${statName} 수`,
                  font: { size: 40 }
                },
                legend: {
                  position: "bottom",
                  labels: { boxHeight: 3, font: { size: 20 } }
                },
                datalabels: { display: false }
              },
              scales: { yAxes: { ticks: { precision: 0 } } }
            }
          });

          return msg.edit({
            content: null,
            embeds: [
              new KRLSEmbed()
                .setTitle(server.name)
                .setURL(KoreanlistEndPoints.URL.server(server))
                .setThumbnail(`${KoreanlistOrigin}${KoreanlistEndPoints.CDN.icon(server.id)}`)
                .setDescription(
                  `https://discord.gg/${server.invite} | ${moment.duration(statCount, "minutes").humanize()} 수집됨\n${hyperlink(
                    "하트 추가",
                    KoreanlistEndPoints.URL.serverVote(server)
                  )} | ${hyperlink("신고하기", KoreanlistEndPoints.URL.serverReport(server))}\n\n${statName} 차트입니다.`
                )
                .setImage("attachment://chart.png")
            ],
            files: [new MessageAttachment(chart, "chart.png")]
          });
        }
      })
      .catch(async (e) => {
        if (isInterface<AxiosError>(e, "response")) {
          switch (e.response?.status) {
            case 404:
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`해당 서버를 찾을 수 없습니다. (입력: \`${id}\`)\n${e}`)]
              });

            case 400:
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`잘못된 입력입니다. 다시 시도해주세요. (입력: \`${id}\`)\n${e}`)]
              });

            default:
              this.client.logger.warn(`FetchError: Server - ${id}:\n${e.stack}`);
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`해당 서버를 가져오는 중에 에러가 발생하였습니다. (입력: \`${id}\`)\n${e}`)]
              });
          }
        } else {
          this.client.logger.error(`Error: Server - ${id}:\n${e.stack}`);
          Sentry.captureException(e);
          return msg.edit({
            content: null,
            embeds: [new KRLSEmbed().setDescription(`해당 서버를 가져오는 중에 에러가 발생하였습니다. (입력: \`${id}\`)\n${e}`)]
          });
        }
      });
  }
}
