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

import { BitField } from "discord.js";
import { BotFlagsString, UserFlagsString } from "../types";

export class BotFlags extends BitField<BotFlagsString> {
  static FLAGS = {
    OFFICIAL: 1 << 0,
    KOREANBOTS_VERIFIED: 1 << 2,
    PARTNER: 1 << 3,
    DISCORD_VERIFIED: 1 << 4,
    PREMIUM: 1 << 5,
    FIRST_KOREANBOTS_HACKATHON_WINNER: 1 << 6
  };
}

export class UserFlags extends BitField<UserFlagsString> {
  static FLAGS = {
    ADMINISTRATOR: 1 << 0,
    BUG_HUNTER: 1 << 1,
    BOT_REVIEWER: 1 << 2,
    PREMIUM: 1 << 3
  };
}
