import axios, { AxiosError } from "axios";
import { Argument, Command } from "discord-akairo";
import { GuildMember, Message, User, Util } from "discord.js";
import {
  DiscordEndPoints,
  KoreanlistEndPoints,
  KoreanlistOrigin
} from "../../lib/constants";
import { UserFlagsEnum } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";
import { formatNumber } from "../../lib/utils/format";
import isInterface from "../../lib/utils/isInterface";
import KRLSEmbed from "../../lib/utils/KRLSEmbed";
import KRLSPaginator from "../../lib/utils/KRLSPaginator";

export default class extends Command {
  constructor() {
    super("유저", {
      aliases: [
        "유저",
        "유저정보",
        "userinformation",
        "userinfo",
        "userdata",
        "유저데이터",
        "userstat",
        "userstats",
        "유저스텟",
        "userstatus",
        "유저상태"
      ],
      description: {
        content: "해당 유저의 정보를 보여줍니다.",
        usage: "<유저>"
      },
      args: [
        {
          id: "userOrId",
          type: Argument.union("user", "member", "string"),
          prompt: {
            start: "봇 | 유저를 입력해 주세요."
          }
        }
      ]
    });
  }

  public async exec(
    message: Message,
    { userOrId }: { userOrId: User | GuildMember | string }
  ) {
    const msg = await message.reply("잠시만 기다려주세요...");

    const id =
      userOrId instanceof User || userOrId instanceof GuildMember
        ? userOrId.id
        : userOrId;

    return axios
      .get(KoreanlistEndPoints.API.user(id))
      .then(async ({ data }) => {
        const user = convert.user(data.data);
        const flags = user.flags.toArray();

        const infoEmbed = new KRLSEmbed()
          .setTitle(`${user.username}#${user.tag}`)
          .setURL(KoreanlistEndPoints.URL.user({ id: user.id }))
          .setThumbnail(
            `${KoreanlistOrigin}${KoreanlistEndPoints.CDN.avatar(user.id)}`
          )
          .setDescription(`<@${user.id}>`)
          .addField(
            "봇",
            user.bots.length > 0 ? `${user.bots.length}개` : "없음",
            true
          )
          .addField(
            "서버",
            user.servers.length > 0 ? `${user.servers.length}개` : "없음",
            true
          )
          .addField(
            "GitHub",
            user.github ? `https://github.com/${user.github}` : "없음"
          )
          .addField(
            "플래그",
            flags.length > 1
              ? flags.map((flag) => UserFlagsEnum[flag]).join(", ")
              : "없음",
            true
          );

        if (user.bots.length < 1 && user.servers.length < 1)
          return msg.edit({ content: null, embeds: [infoEmbed] });
        else {
          const paginator = new KRLSPaginator({
            pages: [{ embeds: [infoEmbed] }]
          });

          for await (const bot of user.bots)
            paginator.addPage({
              embeds: [
                new KRLSEmbed()
                  .setTitle(`${bot.name}#${bot.tag} ${bot.status.emoji} (봇)`)
                  .setURL(
                    KoreanlistEndPoints.URL.bot({
                      id: bot.id,
                      flags: bot.flags,
                      vanity: bot.vanity
                    })
                  )
                  .setDescription(
                    `<@${bot.id}>${
                      bot.url
                        ? ` | [초대 링크](${bot.url})`
                        : `\n생성됨: [슬래시 초대 링크](${DiscordEndPoints.URL.inviteBot(
                            bot.id
                          )}) | [초대 링크](${DiscordEndPoints.URL.inviteBot(
                            bot.id,
                            false
                          )})`
                    }`
                  )
                  .setImage(
                    KoreanlistEndPoints.OG.bot(
                      bot.id,
                      bot.name,
                      bot.intro,
                      bot.category,
                      [formatNumber(bot.votes), formatNumber(bot.servers)]
                    )
                  )
              ]
            });

          for await (const server of user.servers)
            paginator.addPage({
              embeds: [
                new KRLSEmbed()
                  .setTitle(`${server.name} (서버)`)
                  .setURL(
                    KoreanlistEndPoints.URL.server({
                      id: server.id,
                      flags: server.flags,
                      vanity: server.vanity
                    })
                  )
                  .setDescription(`https://discord.gg/${server.invite}`)
                  .setImage(
                    KoreanlistEndPoints.OG.server(
                      server.id,
                      server.name,
                      server.intro,
                      server.category,
                      [formatNumber(server.votes), formatNumber(server.members)]
                    )
                  )
              ]
            });

          return paginator.run(message, msg);
        }
      })
      .catch((e) => {
        if (isInterface<AxiosError>(e, "response")) {
          switch (e.response.status) {
            case 404:
              return msg.edit({
                content: null,
                embeds: [
                  new KRLSEmbed().setDescription(
                    `해당 유저를 찾을 수 없습니다. (입력: \`${Util.escapeInlineCode(
                      id
                    )}\`)\n${e}`
                  )
                ]
              });

            case 400:
              return msg.edit({
                content: null,
                embeds: [
                  new KRLSEmbed().setDescription(
                    `잘못된 입력입니다. 다시 시도해주세요. (입력: \`${Util.escapeInlineCode(
                      id
                    )}\`)\n${e}`
                  )
                ]
              });

            default:
              this.client.logger.warn(
                `FetchError: Error occurred while fetching user ${id}:\n${e.message}\n${e.stack}`
              );
              return msg.edit({
                content: null,
                embeds: [
                  new KRLSEmbed().setDescription(
                    `해당 유저를 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                      id
                    )}\`)\n${e}`
                  )
                ]
              });
          }
        } else {
          this.client.logger.warn(
            `Error: Error occurred while fetching user ${id}:\n${e.message}\n${e.stack}`
          );
          return msg.edit({
            content: null,
            embeds: [
              new KRLSEmbed().setDescription(
                `해당 유저를 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                  id
                )}\`)\n${e}`
              )
            ]
          });
        }
      });
  }
}
