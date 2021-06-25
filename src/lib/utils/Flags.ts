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
