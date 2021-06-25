import {
  Bot,
  Owner,
  RawBot,
  RawOwner,
  RawUser,
  State,
  StatusEmojiEnum,
  StatusEnum,
  User
} from "../types";
import { BotFlags, UserFlags } from "./Flags";

function bot(bot: RawBot): Bot {
  return {
    ...bot,
    owners: bot.owners.map((raw) => owner(raw)),
    flags: new BotFlags(bot.flags),
    status: {
      raw: bot.status,
      text: StatusEnum[bot.status],
      emoji: StatusEmojiEnum[bot.status]
    },
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
