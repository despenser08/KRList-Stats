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

import { hyperlink, time, userMention } from "@discordjs/builders";
import * as Sentry from "@sentry/node";
import axios, { AxiosError } from "axios";
import { Argument, Command } from "discord-akairo";
import { User, Message, MessageAttachment, GuildMember, SnowflakeUtil } from "discord.js";
import moment from "moment-timezone";
import { DiscordEndPoints, KoreanlistEndPoints, KoreanlistOrigin } from "../../lib/constants";
import BotDB from "../../lib/database/models/Bot";
import BotStatsDB from "../../lib/database/models/BotStats";
import { BotFlagsEnum, FetchResponse, RawBot } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";
import createChart from "../../lib/utils/createChart";
import filterStats from "../../lib/utils/filterStats";
import { filterDesc, formatNumber, getId, lineUserText } from "../../lib/utils/format";
import isInterface from "../../lib/utils/isInterface";
import KRLSEmbed from "../../lib/utils/KRLSEmbed";
import KRLSPaginator from "../../lib/utils/KRLSPaginator";

export default class BotCommand extends Command {
  constructor() {
    super("봇", {
      aliases: ["봇", "bot", "botinformation", "botinfo", "봇정보", "botdata", "봇데이터", "botstat", "botstats", "봇스텟", "botstatus", "봇상태"],
      description: {
        content: "해당 봇의 정보를 보여줍니다.",
        usage: '<봇 ["정보"] | ["서버" | "업타임" | "투표" ["전체" | 최근 정보 수 | 날짜 [날짜]]]]>'
      },
      args: [
        {
          id: "userOrId",
          type: Argument.union("user", "member", "string"),
          prompt: {
            start: "봇 | 유저를 입력해 주세요."
          }
        },
        {
          id: "info",
          type: [
            ["info", "정보", "information"],
            ["servers", "서버", "server", "guild", "guilds", "길드"],
            ["uptime", "업타임", "status", "상태"],
            ["votes", "투표", "vote", "heart", "hearts", "하트"]
          ],
          prompt: {
            optional: true,
            retry: '"정보" | "투표" | "서버" | "키워드"를 입력해 주세요.'
          },
          default: "info"
        },
        {
          id: "limit",
          type: Argument.union(Argument.range("integer", 1, Infinity), "date", [
            ["all", "전체"],
            ["quarter", "분기"]
          ]),
          prompt: {
            optional: true,
            retry: '"전체" | "분기" | 최근 정보 수(자연수) | 날짜를 입력해 주세요.'
          },
          default: "all"
        },
        {
          id: "endOfDateOrQuarter",
          type: Argument.union(Argument.range("integer", 1, Infinity), "date"),
          prompt: {
            optional: true,
            retry: "날짜 | 분기를 입력해 주세요."
          }
        }
      ]
    });
  }

  public async exec(
    message: Message,
    {
      userOrId,
      info,
      limit,
      endOfDateOrQuarter
    }: {
      userOrId: User | GuildMember | string;
      info: "info" | "votes" | "servers" | "uptime";
      limit: "all" | "quarter" | number | Date;
      endOfDateOrQuarter?: Date | number;
    }
  ) {
    const msg = await message.reply("잠시만 기다려주세요...");

    const id = getId(userOrId);

    return axios
      .get<FetchResponse<RawBot>>(KoreanlistEndPoints.API.bot(id))
      .then(async ({ data }) => {
        if (!data.data) {
          this.client.logger.warn(`FetchError: Bot - ${id}:\nData is empty.`);
          return msg.edit("해당 봇 데이터의 응답이 비어있습니다. 다시 시도해주세요.");
        }
        const bot = convert.bot(data.data);

        const botDB = await BotDB.findOneAndUpdate({ id: bot.id }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
        const statCount = await BotStatsDB.countDocuments({ id: bot.id });

        if (info === "info") {
          const flags = bot.flags.toArray();
          const created = SnowflakeUtil.deconstruct(bot.id).date;
          const desc = filterDesc(bot.desc);

          const paginator = new KRLSPaginator({
            pages: [
              {
                embeds: [
                  new KRLSEmbed()
                    .setTitle(`${bot.name}#${bot.tag} ${bot.status?.emoji}`)
                    .setURL(KoreanlistEndPoints.URL.bot(bot))
                    .setThumbnail(`${KoreanlistOrigin}${KoreanlistEndPoints.CDN.avatar(bot.id)}`)
                    .setDescription(
                      `${userMention(bot.id)} | ${
                        botDB.track ? (statCount > 0 ? `${moment.duration(statCount, "minutes").humanize()} 수집됨` : "수집 대기중") : "수집되지 않음"
                      }${
                        bot.url
                          ? ` | ${hyperlink("초대 링크", bot.url)}`
                          : `\n생성됨: ${hyperlink("슬래시 초대 링크", DiscordEndPoints.URL.inviteBot(bot.id))} | ${hyperlink(
                              "초대 링크",
                              DiscordEndPoints.URL.inviteBot(bot.id, false)
                            )}`
                      }\n${hyperlink("하트 추가", KoreanlistEndPoints.URL.botVote(bot))} | ${hyperlink(
                        "신고하기",
                        KoreanlistEndPoints.URL.botReport(bot)
                      )}\n\n${bot.intro}`
                    )
                    .addField("접두사", bot.prefix, true)
                    .addField("서버 수", bot.servers ? bot.servers.toString() : "N/A", true)
                    .addField("투표 수", bot.votes.toString(), true)
                    .addField("샤드 수", bot.shards ? bot.shards.toString() : "N/A", true)
                    .addField("상태", bot.state, true)
                    .addField("라이브러리", bot.lib, true)
                    .addField("생성일", `${time(created)} (${time(created, "R")})`)
                    .addField("플래그", flags.length > 0 ? flags.map((flag) => BotFlagsEnum[flag]).join(", ") : "없음", flags.length < 1)
                    .addField("카테고리", bot.category.length > 0 ? bot.category.join(", ") : "없음", flags.length < 1)
                    .addField("관리자", bot.owners.map((owner) => lineUserText(owner)).join("\n"))
                    .addField("디스코드", bot.discord ? `https://discord.gg/${bot.discord}` : "없음", !bot.discord)
                    .addField("웹사이트", bot.web ?? "없음", !bot.web)
                    .addField("Git", bot.git ?? "없음", !bot.git)
                    .setImage(
                      KoreanlistEndPoints.OG.bot(bot.id, bot.name, bot.intro, bot.category, [formatNumber(bot.votes), formatNumber(bot.servers)])
                    )
                ]
              },
              { embeds: [new KRLSEmbed().setTitle("봇 설명").setDescription(desc.res)] }
            ]
          });

          for (let i = 0; i < desc.images.length; i++)
            paginator.addPage({
              embeds: [
                new KRLSEmbed()
                  .setTitle(`설명 이미지 #${i + 1}`)
                  .setURL(desc.images[i])
                  .setImage(desc.images[i])
              ]
            });

          if (bot.banner)
            paginator.addPage({
              embeds: [new KRLSEmbed().setTitle("봇 배너").setImage(bot.banner)]
            });
          if (bot.bg)
            paginator.addPage({
              embeds: [new KRLSEmbed().setTitle("봇 배경").setImage(bot.bg)]
            });

          return paginator.run(message, msg);
        } else if (info === "uptime") {
          if (!botDB.track)
            return msg.edit(`**${bot.name}** 데이터가 수집되지 않았습니다. ${message.util?.parsed?.prefix}봇수집을 사용하여 봇 수집을 시작하세요.`);
          else if (statCount < 1) return msg.edit(`**${bot.name}** 수집 대기중입니다. 잠시만 기다려주세요.`);

          const status: {
            online: number;
            idle: number;
            dnd: number;
            streaming: number;
            offline: number;
          } = {
            online: 0,
            idle: 0,
            dnd: 0,
            streaming: 0,
            offline: 0
          };

          const filter = await filterStats(bot.id, statCount, limit, endOfDateOrQuarter);
          const stats = await BotStatsDB.find(filter.query, {}, { skip: filter.skip, sort: { updated: 1 } });

          for await (const stat of stats.map((bot) => bot.status)) status[stat]++;

          const chart = await createChart(1080, 1080, {
            type: "pie",
            data: {
              labels: ["온라인", "자리 비움", "다른 용무 중", "방송 중", "오프라인"],
              datasets: [
                {
                  label: "Status",
                  data: Object.values(status),
                  backgroundColor: ["rgb(59, 165, 93)", "rgb(208, 143, 30)", "rgb(221, 64, 68)", "rgb(88, 53, 147)", "rgb(116, 127, 141)"]
                }
              ]
            },
            options: {
              plugins: {
                datalabels: {
                  formatter: (value, ctx) => {
                    if (value !== 0) {
                      const formattedTime = moment.duration(value, "minutes").humanize();
                      const rawTime = `${value}분`;
                      const label = ctx.chart.data.labels?.[ctx.dataIndex];

                      return formattedTime !== rawTime ? `${label}: ${formattedTime} (${rawTime})` : `${label}: ${rawTime}`;
                    } else return "";
                  },
                  font: { size: 30 }
                },
                title: {
                  display: true,
                  text: `${bot.name} 업타임${limit === "quarter" ? ` (${filter.quarter}분기)` : ""}`,
                  font: { size: 40 }
                },
                subtitle: {
                  display: true,
                  text: `업타임: ${(((stats.length - status.offline) / stats.length) * 100).toFixed(2)}%`,
                  font: { size: 30 }
                },
                legend: {
                  position: "bottom",
                  labels: { boxHeight: 3, font: { size: 20 } }
                }
              }
            }
          });

          return msg.edit({
            content: `**${bot.name}** 업타임${limit === "quarter" ? ` ${filter.quarter}분기` : ""} 차트입니다.`,
            files: [new MessageAttachment(chart, "chart.png")]
          });
        } else {
          if (!botDB.track)
            return msg.edit(`**${bot.name}** 데이터가 수집되지 않았습니다. ${message.util?.parsed?.prefix}봇수집을 사용하여 봇 수집을 시작하세요.`);
          else if (statCount < 1) return msg.edit(`**${bot.name}** 수집 대기중입니다. 잠시만 기다려주세요.`);

          const datas: (number | null)[] = [];
          const dates: string[] = [];

          const filter = await filterStats(bot.id, statCount, info === "votes" && limit === "all" ? "quarter" : limit, endOfDateOrQuarter);
          const stats = await BotStatsDB.find(filter.query, {}, { skip: filter.skip, sort: { updated: 1 } });

          for await (const stat of stats) {
            datas.push(stat[info] ?? null);
            dates.push(moment(stat.updated).format("YYYY/MM/DD HH:mm"));
          }

          const color = info === "servers" ? "rgb(51, 102, 255)" : "rgb(255, 0, 0)";
          const statName = info === "servers" ? "서버" : "투표";

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
                  text: `${bot.name} ${statName} 수${info === "votes" || limit === "quarter" ? ` (${filter.quarter}분기)` : ""}`,
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

          return msg
            .edit({
              content: `**${bot.name}** ${statName}${info === "votes" || limit === "quarter" ? ` ${filter.quarter}분기` : ""} 차트입니다.`,
              files: [new MessageAttachment(chart, "chart.png")]
            })
            .then((resmsg) => {
              if (bot.servers === null && info === "servers")
                resmsg.reply({
                  embeds: [
                    new KRLSEmbed()
                      .setTitle("봇의 서버 수를 확인할 수 없습니다.")
                      .setDescription(
                        `봇 정보를 ${hyperlink(
                          "API",
                          `${KoreanlistOrigin}/developers/docs/API`
                        )}로 보내셔야지 봇 서버 정보가 업데이트됩니다.\n${hyperlink("SDK", `${KoreanlistOrigin}/developers/docs/SDK`)}나 ${hyperlink(
                          "직접 API에 요청",
                          `${KoreanlistOrigin}/developers/docs/%EC%97%94%EB%93%9C%ED%8F%AC%EC%9D%B8%ED%8A%B8/%EB%B4%87#%EB%B4%87-%EC%A0%95%EB%B3%B4-%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8`
                        )}을 보내 봇 정보 업데이트가 가능합니다.`
                      )
                  ]
                });
            });
        }
      })
      .catch(async (e) => {
        if (isInterface<AxiosError>(e, "response")) {
          switch (e.response?.status) {
            case 404:
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`해당 봇을 찾을 수 없습니다. (입력: \`${id}\`)\n${e}`)]
              });

            case 400:
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`잘못된 입력입니다. 다시 시도해주세요. (입력: \`${id}\`)\n${e}`)]
              });

            default:
              this.client.logger.warn(`FetchError: Bot - ${id}:\n${e.stack}`);
              return msg.edit({
                content: null,
                embeds: [new KRLSEmbed().setDescription(`해당 봇을 가져오는 중에 에러가 발생하였습니다. (입력: \`${id}\`)\n${e}`)]
              });
          }
        } else {
          this.client.logger.error(`Error: Bot - ${id}:\n${e.stack}`);
          Sentry.captureException(e);
          return msg.edit({
            content: null,
            embeds: [new KRLSEmbed().setDescription(`해당 봇을 가져오는 중에 에러가 발생하였습니다. (입력: \`${id}\`)\n${e}`)]
          });
        }
      });
  }
}
