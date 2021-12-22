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

import {
  Bot,
  BotOwner,
  BotState,
  BotStatusEmojiEnum,
  BotStatusEnum,
  RawBot,
  RawBotOwner,
  RawServer,
  RawServerBot,
  RawServerOwner,
  RawUser,
  Server,
  ServerBot,
  ServerOwner,
  ServerState,
  User
} from "#lib/types";
import { BotFlags, ServerFlags, UserFlags } from "./Flags";

function bot(bot: RawBot): Bot {
  return {
    ...bot,
    owners: bot.owners.map((raw) => botOwner(raw)),
    flags: new BotFlags(bot.flags),
    status: bot.status
      ? {
          raw: bot.status,
          text: BotStatusEnum[bot.status],
          emoji: BotStatusEmojiEnum[bot.status]
        }
      : undefined,
    state: BotState[bot.state],
    url: bot.url ? encodeURI(bot.url) : undefined,
    discord: bot.discord ? encodeURI(`https://discord.gg/${bot.discord}`) : undefined
  };
}

function server(server: RawServer): Server {
  return {
    ...server,
    flags: new ServerFlags(server.flags),
    owner: server.owner ? serverOwner(server.owner) : undefined,
    bots: server.bots.map((raw) => serverBot(raw)),
    state: ServerState[server.state],
    invite: encodeURI(`https://discord.gg/${server.invite}`)
  };
}

function user(user: RawUser): User {
  return {
    ...user,
    flags: new UserFlags(user.flags),
    bots: user.bots.map((raw) => bot(raw)),
    servers: user.servers.map((raw) => server(raw))
  };
}

function botOwner(botOwner: RawBotOwner): BotOwner {
  return { ...botOwner, flags: new ServerFlags(botOwner.flags) };
}

function serverOwner(serverOwner: RawServerOwner): ServerOwner {
  return { ...serverOwner, flags: new UserFlags(serverOwner.flags) };
}

function serverBot(serverBot: RawServerBot): ServerBot {
  return {
    ...serverBot,
    flags: new BotFlags(serverBot.flags),
    status: serverBot.status
      ? {
          raw: serverBot.status,
          text: BotStatusEnum[serverBot.status],
          emoji: BotStatusEmojiEnum[serverBot.status]
        }
      : undefined,
    state: BotState[serverBot.state]
  };
}

const convert = {
  bot,
  server,
  user,
  botOwner,
  serverOwner,
  serverBot
};

export default convert;
