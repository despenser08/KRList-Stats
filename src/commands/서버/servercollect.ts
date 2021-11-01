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

import * as Sentry from "@sentry/node";
import axios, { AxiosError } from "axios";
import { Argument, Command } from "discord-akairo";
import type { Guild, Message } from "discord.js";
import { KoreanlistEndPoints } from "../../lib/constants";
import ServerDB from "../../lib/database/models/Server";
import type { FetchResponse, RawServer, ServerOwner } from "../../lib/types";
import convert from "../../lib/utils/convertRawToType";
import { getId } from "../../lib/utils/format";
import isInterface from "../../lib/utils/isInterface";
import KRLSEmbed from "../../lib/utils/KRLSEmbed";

export default class ServerCollectCommand extends Command {
  constructor() {
    super("서버수집", {
      aliases: ["서버수집", "servercollect", "collectserver", "수집서버", "servertrack", "서버추적"],
      description: {
        content: "해당 서버의 정보를 수집합니다.",
        usage: "<서버>"
      },
      args: [
        {
          id: "guildOrId",
          type: Argument.union("guild", "string"),
          prompt: { start: "서버를 입력해 주세요." }
        }
      ]
    });
  }

  public async exec(message: Message, { guildOrId }: { guildOrId: Guild | string }) {
    const msg = await message.reply("잠시만 기다려주세요...");

    const id = getId(guildOrId);

    await axios
      .get<FetchResponse<RawServer>>(KoreanlistEndPoints.API.server(id))
      .then(async ({ data }) => {
        if (!data.data) {
          this.client.logger.warn(`FetchError: Server - ${id}:\nData is empty.`);
          return msg.edit("해당 서버 데이터의 응답이 비어있습니다. 다시 시도해주세요.");
        }
        const server = convert.server(data.data);

        const owners = await axios.get<FetchResponse<ServerOwner[]>>(KoreanlistEndPoints.API.serverOwners(id)).then(({ data }) => data.data);
        if (!owners) {
          this.client.logger.warn(`FetchError: Server Owners - ${id}:\nData is empty.`);
          return msg.edit("해당 서버 관리자 데이터의 응답이 비어있습니다. 다시 시도해주세요.");
        }

        if (!owners.map((owner) => owner.id).includes(message.author.id)) return msg.edit(`**${server.name}** 관리자만 수집 요청이 가능합니다.`);

        const serverDB = await ServerDB.findOneAndUpdate({ id: server.id }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });

        if (serverDB.track) {
          if (serverDB.stats.length > 0) return msg.edit(`**${server.name}** 수집은 이미 시작되었습니다.`);
          else return msg.edit(`**${server.name}** 수집 대기중입니다. 잠시만 기다려주세요.`);
        }

        await serverDB.updateOne({ track: true });

        return msg.edit(`1분마다 **${server.name}** 수집이 시작됩니다.`);
      })
      .catch((e) => {
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
