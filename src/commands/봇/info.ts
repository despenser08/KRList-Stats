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
import { CanvasRenderService } from "chartjs-node-canvas";
import { Argument, Command } from "discord-akairo";
import {
  MessageEmbed,
  User,
  Util,
  Message,
  MessageAttachment,
  GuildMember
} from "discord.js";
import path from "path";
import {
  Colors,
  DiscordEndPoints,
  KoreanbotsEndPoints,
  KoreanbotsOrigin
} from "../../lib/constants";
import Bot from "../../lib/database/models/Bot";
import { BotFlagsEnum, UserFlagsEnum } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";
import { filterDesc, formatNumber, formatTime } from "../../lib/utils/format";
import isInterface from "../../lib/utils/isInterface";
import listEmbed from "../../lib/utils/listEmbed";

export default class extends Command {
  constructor() {
    super("정보", {
      aliases: [
        "정보",
        "information",
        "info",
        "data",
        "데이터",
        "stat",
        "stats",
        "스텟",
        "status",
        "상태"
      ],
      description: {
        content: "해당 봇의 정보를 보여줍니다.",
        usage:
          '<유저> | <봇 ["현재" | "상태" | "키워드"] | ["투표" | "서버" [정보 수 | "전체"]]>'
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
            ["now", "현재", "current"],
            ["votes", "투표", "vote", "heart", "hearts", "하트"],
            ["servers", "서버", "server", "guild", "guilds", "길드"],
            ["status", "상태"],
            ["keyword", "키워드", "keywords"]
          ],
          prompt: {
            optional: true,
            retry:
              '"현재" | "투표" | "서버" | "상태" | "키워드"를 입력해 주세요.'
          },
          default: "now"
        },
        {
          id: "limit",
          type: Argument.union(Argument.range("integer", 1, Infinity), [
            "all",
            "전체"
          ]),
          prompt: {
            optional: true,
            retry: '정보 수(자연수) | "전체"를 입력해 주세요.'
          },
          default: 10
        }
      ]
    });
  }

  public async exec(
    message: Message,
    {
      userOrId,
      info,
      limit
    }: {
      userOrId: string | User | GuildMember;
      info: "now" | "votes" | "servers" | "status" | "keyword";
      limit: number | "all";
    }
  ) {
    const msg = await message.channel.send("잠시만 기다려주세요...");

    const id =
      userOrId instanceof User || userOrId instanceof GuildMember
        ? userOrId.id
        : userOrId;

    return axios
      .get(KoreanbotsEndPoints.API.bot(id))
      .then(async ({ data }) => {
        const bot = convert.bot(data.data);

        const botDB = await Bot.findOneAndUpdate(
          { id: bot.id },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (info === "now") {
          const flags = bot.flags.toArray();

          msg.delete();
          const pages: MessageEmbed[] = [];

          pages.push(
            new MessageEmbed()
              .setColor(Colors.PRIMARY)
              .setTitle(`${bot.name}#${bot.tag} ${bot.status.emoji}`)
              .setURL(KoreanbotsEndPoints.URL.bot(bot.id))
              .setThumbnail(
                `${KoreanbotsOrigin}${KoreanbotsEndPoints.CDN.avatar(bot.id, {
                  format: "webp",
                  size: 256
                })}`
              )
              .setDescription(
                `<@!${bot.id}> | ${
                  botDB.track ? "봇이 수집 중" : "봇한테 수집되지 않음"
                } | ${
                  bot.url
                    ? `[초대 링크](${bot.url})`
                    : `[초대 링크 (생성됨)](${DiscordEndPoints.URL.inviteBot(
                        bot.id
                      )})`
                }\n\n${bot.intro}`
              )
              .addField(
                "관리자",
                bot.owners
                  .map(
                    (owner) =>
                      `[${owner.username}#${
                        owner.tag
                      }](${KoreanbotsEndPoints.URL.user(owner.id)}) (<@!${
                        owner.id
                      }>)`
                  )
                  .join("\n")
              )
              .addField(
                "카테고리",
                bot.category.length < 1 ? "없음" : bot.category.join(", ")
              )
              .addField("Git", bot.git || "없음")
              .addField("상태", bot.state, true)
              .addField(
                "디스코드",
                bot.discord ? `https://discord.gg/${bot.discord}` : "없음",
                true
              )
              .addField("라이브러리", bot.lib, true)
              .addField("접두사", bot.prefix, true)
              .addField("샤드 수", bot.shards || "N/A", true)
              .addField("서버 수", bot.servers || "N/A", true)
              .addField("투표 수", bot.votes, true)
              .addField(
                "플래그",
                flags.length < 1
                  ? "없음"
                  : flags.map((flag) => BotFlagsEnum[flag]).join(", "),
                true
              )
              .addField("웹페이지", bot.web || "없음")
              .setImage(
                KoreanbotsEndPoints.OG.bot(
                  bot.id,
                  bot.name,
                  bot.intro,
                  bot.category,
                  [formatNumber(bot.votes), formatNumber(bot.servers)]
                )
              )
          );

          if (bot.banner)
            pages.push(
              new MessageEmbed()
                .setColor(Colors.PRIMARY)
                .setTitle("봇 배너")
                .setImage(bot.banner)
            );
          if (bot.bg)
            pages.push(
              new MessageEmbed()
                .setColor(Colors.PRIMARY)
                .setTitle("봇 배경")
                .setImage(bot.bg)
            );

          pages.push(
            new MessageEmbed()
              .setColor(Colors.PRIMARY)
              .setTitle("봇 설명")
              .setDescription(filterDesc(bot.desc))
          );

          return listEmbed(message, pages);
        } else if (info === "status") {
          if (botDB.stats.length < 1)
            return msg.edit(
              `**${Util.escapeBold(bot.name)}** 데이터가 수집되지 않았습니다. ${
                message.util.parsed.prefix
              }수집을 사용하여 봇 수집을 시작하세요.`
            );

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

          for await (const stat of botDB.stats.map((bot) => bot.status))
            status[stat]++;

          const canvas = new CanvasRenderService(1080, 1080, (chart) => {
            chart.defaults.font.family = "Noto Sans KR";
            chart.defaults.color = "#000";
          });
          canvas.registerFont(
            path.join(
              __dirname,
              "..",
              "..",
              "..",
              "assets",
              "fonts",
              "NotoSansKR-Regular.otf"
            ),
            {
              family: "Noto Sans KR"
            }
          );

          const image = await canvas.renderToBuffer(
            {
              type: "polarArea",
              data: {
                labels: [
                  "온라인",
                  "자리 비움",
                  "다른 용무 중",
                  "방송 중",
                  "오프라인"
                ],
                datasets: [
                  {
                    label: "Status",
                    data: Object.values(status),
                    backgroundColor: [
                      "rgb(59, 165, 93)",
                      "rgb(208, 143, 30)",
                      "rgb(221, 64, 68)",
                      "rgb(88, 53, 147)",
                      "rgb(116, 127, 141)"
                    ]
                  }
                ]
              },
              plugins: [
                {
                  id: "white_background_color",
                  beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext("2d");
                    ctx.save();
                    ctx.globalCompositeOperation = "destination-over";
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                  }
                }
              ],
              options: {
                plugins: {
                  title: {
                    display: true,
                    text: `${bot.name} 상태`,
                    font: { size: 40 }
                  },
                  legend: { position: "bottom", labels: { font: { size: 20 } } }
                }
              }
            },
            "image/png"
          );

          msg.edit(`**${Util.escapeBold(bot.name)}** 차트입니다.`);
          return message.channel.send(
            new MessageAttachment(image, "chart.png")
          );
        } else if (info === "keyword") {
          if (botDB.stats.length < 1)
            return msg.edit(
              `**${Util.escapeBold(bot.name)}** 데이터가 수집되지 않았습니다. ${
                message.util.parsed.prefix
              }수집을 사용하여 봇 수집을 시작하세요.`
            );

          if (!botDB.keywords || botDB.keywords.size < 1)
            return msg.edit(
              `봇에서 검색한 결과 중에 **${Util.escapeBold(
                bot.name
              )}**에 관한 결과가 나오지 않았습니다. 나중에 다시 시도해주세요.`
            );

          msg.delete();

          return message.channel.send(
            new MessageEmbed()
              .setColor(Colors.PRIMARY)
              .setTitle(`${bot.name} 검색 키워드`)
              .setDescription(
                [...botDB.keywords.keys()]
                  .sort((a, b) => botDB.keywords.get(b) - botDB.keywords.get(a))
                  .map(
                    (key, index) =>
                      `**${index + 1}.** ${key} - ${botDB.keywords.get(key)}`
                  )
                  .join("\n")
              )
          );
        } else {
          if (botDB.stats.length < 1)
            return msg.edit(
              `**${Util.escapeBold(bot.name)}** 데이터가 수집되지 않았습니다. ${
                message.util.parsed.prefix
              }수집을 사용하여 봇 수집을 시작하세요.`
            );

          const datas: number[] = [];
          const dates: string[] = [];

          for await (const stat of botDB.stats) {
            datas.push(stat[info]);
            dates.push(
              formatTime({ date: stat.updated, format: "YYYY/MM/DD HH:mm" })
            );
          }

          if (typeof limit === "number" && Number.isInteger(limit)) {
            datas.reverse();
            dates.reverse();
            datas.splice(limit);
            dates.splice(limit);
          }

          const color =
            info === "servers" ? "rgb(51, 102, 255)" : "rgb(255, 0, 0)";

          const canvas = new CanvasRenderService(1920, 1080, (chart) => {
            chart.defaults.font.family = "Noto Sans KR";
            chart.defaults.color = "#000";
          });
          canvas.registerFont(
            path.join(
              __dirname,
              "..",
              "..",
              "..",
              "assets",
              "fonts",
              "NotoSansKR-Regular.otf"
            ),
            {
              family: "Noto Sans KR"
            }
          );

          const image = await canvas.renderToBuffer(
            {
              type: "line",
              data: {
                labels: dates,
                datasets: [
                  {
                    label: `${info === "servers" ? "서버" : "투표"} 수`,
                    data: datas,
                    backgroundColor: [color],
                    borderColor: [color],
                    borderWidth: 5,
                    pointRadius: 0,
                    tension: 0.1,
                  }
                ]
              },
              plugins: [
                {
                  id: "white_background_color",
                  beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext("2d");
                    ctx.save();
                    ctx.globalCompositeOperation = "destination-over";
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                  }
                }
              ],
              options: {
                plugins: {
                  title: {
                    display: true,
                    text: `${bot.name} ${
                      info === "servers" ? "서버" : "투표"
                    } 수`,
                    font: { size: 40 }
                  },
                  legend: { position: "bottom", labels: { font: { size: 20 } } }
                },
                scales: { yAxes: { ticks: { precision: 0 } } }
              }
            },
            "image/png"
          );

          msg.edit(`**${Util.escapeBold(bot.name)}** 차트입니다.`);
          return message.channel.send(
            new MessageAttachment(image, "chart.png")
          );
        }
      })
      .catch(async (e) => {
        if (isInterface<AxiosError>(e, "response")) {
          if (e.response.status < 400 || e.response.status > 499)
            this.client.logger.warn(
              `FetchError: Error occurred while fetching bot ${id}:\n${e}`
            );
        } else
          this.client.logger.warn(
            `Error: Error occurred while fetching bot ${id}:\n${e}`
          );

        return axios
          .get(KoreanbotsEndPoints.API.user(id))
          .then(async ({ data }) => {
            const user = convert.user(data.data);
            const flags = user.flags.toArray();

            return msg.edit(
              "",
              new MessageEmbed()
                .setColor(Colors.PRIMARY)
                .setTitle(`${user.username}#${user.tag}`)
                .setURL(KoreanbotsEndPoints.URL.user(user.id))
                .setThumbnail(
                  `${KoreanbotsOrigin}${KoreanbotsEndPoints.CDN.avatar(
                    user.id,
                    {
                      format: "webp",
                      size: 256
                    }
                  )}`
                )
                .setDescription(`<@!${user.id}>`)
                .addField(
                  "봇",
                  user.bots.length < 1
                    ? "없음"
                    : user.bots
                        .map(
                          (bot) =>
                            `[${bot.name}#${
                              bot.tag
                            }](${KoreanbotsEndPoints.URL.bot(bot.id)}) (<@!${
                              bot.id
                            }>) ${bot.status.emoji} [서버: ${
                              bot.servers || "N/A"
                            }]\n> ${bot.intro}`
                        )
                        .join("\n")
                )
                .addField(
                  "플래그",
                  flags.length < 1
                    ? "없음"
                    : flags.map((flag) => UserFlagsEnum[flag]).join(", "),
                  true
                )
                .addField(
                  "GitHub",
                  user.github ? `https://github.com/${user.github}` : "없음",
                  true
                )
            );
          })
          .catch((e) => {
            if (isInterface<AxiosError>(e, "response"))
              switch (e.response.status) {
                case 404:
                  return msg.edit(
                    "",
                    new MessageEmbed()
                      .setColor(Colors.PRIMARY)
                      .setDescription(
                        `해당 봇 또는 유저를 찾을 수 없습니다. (입력: \`${Util.escapeInlineCode(
                          userOrId.toString()
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
                          userOrId.toString()
                        )}\`)`
                      )
                  );

                default:
                  this.client.logger.warn(
                    `FetchError: Error occurred while fetching bot ${id}:\n${e}`
                  );
                  return msg.edit(
                    "",
                    new MessageEmbed()
                      .setColor(Colors.PRIMARY)
                      .setDescription(
                        `해당 봇 또는 유저를 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                          userOrId.toString()
                        )}\`)\n${e}`
                      )
                  );
              }
            else {
              this.client.logger.warn(
                `Error: Error occurred while fetching bot ${id}:\n${e}`
              );
              return msg.edit(
                "",
                new MessageEmbed()
                  .setColor(Colors.PRIMARY)
                  .setDescription(
                    `해당 봇 또는 유저를 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                      userOrId.toString()
                    )}\`)\n${e}`
                  )
              );
            }
          });
      });
  }
}
