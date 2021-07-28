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

import { BotFlags, UserFlags } from "../constants";
import { Bot, Owner, RawBot, RawOwner, RawUser, State, StatusEmojiEnum, StatusEnum, User } from "../types/Koreanbots";

function bot(bot: RawBot): Bot {
  return {
    ...bot,
    owners: bot.owners.map((raw) => owner(raw)),
    flags: new BotFlags(bot.flags),
    status: bot.status
      ? {
          raw: bot.status,
          text: StatusEnum[bot.status],
          emoji: StatusEmojiEnum[bot.status]
        }
      : undefined,
    state: State[bot.state]
  };
}

function user(user: RawUser): User {
  return {
    ...user,
    flags: new UserFlags(user.flags),
    bots: user.bots.map((raw) => bot(raw))
  };
}

function owner(owner: RawOwner): Owner {
  return { ...owner, flags: new UserFlags(owner.flags) };
}

const convert = {
  bot,
  user,
  owner
};

export default convert;
