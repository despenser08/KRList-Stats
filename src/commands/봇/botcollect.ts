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
import { GuildMember, Message, User, Util } from "discord.js";
import { KoreanlistEndPoints } from "../../lib/constants";
import BotDB from "../../lib/database/models/Bot";
import { FetchResponse, RawBot } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";
import isInterface from "../../lib/utils/isInterface";
import KRLSEmbed from "../../lib/utils/KRLSEmbed";

export default class extends Command {
  constructor() {
    super("봇수집", {
      aliases: [
        "봇수집",
        "botcollect",
        "collectbot",
        "수집봇",
        "bottrack",
        "봇추적"
      ],
      description: {
        content: "해당 봇의 정보를 수집합니다.",
        usage: "<봇>"
      },
      args: [
        {
          id: "userOrId",
          type: Argument.union("user", "member", "string"),
          prompt: { start: "봇을 입력해 주세요." }
        }
      ]
    });
  }

  public async exec(
    message: Message,
    { userOrId }: { userOrId: string | User | GuildMember }
  ) {
    const msg = await message.reply("잠시만 기다려주세요...");

    const id =
      userOrId instanceof User || userOrId instanceof GuildMember
        ? userOrId.id
        : userOrId;

    await axios
      .get<FetchResponse<RawBot>>(KoreanlistEndPoints.API.bot(id))
      .then(async ({ data }) => {
        const bot = convert.bot(data.data);

        if (!bot.owners.map((owner) => owner.id).includes(message.author.id))
          return msg.edit(
            `**${Util.escapeBold(bot.name)}** 관리자만 수집 요청이 가능합니다.`
          );

        const botDB = await BotDB.findOneAndUpdate(
          { id: bot.id },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (botDB.track) {
          if (botDB.stats.length > 0)
            return msg.edit(
              `**${Util.escapeBold(bot.name)}** 수집은 이미 시작되었습니다.`
            );
          else
            return msg.edit(
              `**${Util.escapeBold(
                bot.name
              )}** 수집 대기중입니다. 잠시만 기다려주세요.`
            );
        }

        await botDB.updateOne({ track: true });

        return msg.edit(
          `1분마다 **${Util.escapeBold(bot.name)}** 수집이 시작됩니다.`
        );
      })
      .catch((e) => {
        if (isInterface<AxiosError>(e, "response")) {
          switch (e.response.status) {
            case 404:
              return msg.edit({
                content: null,
                embeds: [
                  new KRLSEmbed().setDescription(
                    `해당 봇을 찾을 수 없습니다. (입력: \`${Util.escapeInlineCode(
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
              this.client.logger.warn(`FetchError: Bot - ${id}:\n${e.stack}`);
              return msg.edit({
                content: null,
                embeds: [
                  new KRLSEmbed().setDescription(
                    `해당 봇을 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                      id
                    )}\`)\n${e}`
                  )
                ]
              });
          }
        } else {
          this.client.logger.warn(`Error: Bot - ${id}:\n${e.stack}`);
          return msg.edit({
            content: null,
            embeds: [
              new KRLSEmbed().setDescription(
                `해당 봇을 가져오는 중에 에러가 발생하였습니다. (입력: \`${Util.escapeInlineCode(
                  id
                )}\`)\n${e}`
              )
            ]
          });
        }
      });
  }
}
