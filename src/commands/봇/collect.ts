import axios from "axios";
import { Argument, Command } from "discord-akairo";
import { Message, User, Util } from "discord.js";
import { KoreanbotsEndPoints } from "../../lib/constants";
import Bot from "../../lib/database/models/Bot";
import convert from "../../lib/utils/convertRawToType";

export default class extends Command {
  constructor() {
    super("수집", {
      aliases: ["수집", "collect", "track", "추적"],
      description: {
        content: "해당 봇의 정보를 수집합니다.",
        usage: "<봇>"
      },
      args: [
        {
          id: "userOrId",
          type: Argument.union("user", "string"),
          prompt: { start: "봇을 입력해 주세요." }
        }
      ]
    });
  }

  public async exec(
    message: Message,
    { userOrId }: { userOrId: string | User }
  ) {
    const msg = await message.channel.send("잠시만 기다려주세요...");

    const id = userOrId instanceof User ? userOrId.id : userOrId;

    await axios
      .get(KoreanbotsEndPoints.API.bot(id))
      .then(async ({ data }) => {
        const bot = convert.bot(data.data);

        const botDB = await Bot.findOneAndUpdate(
          { id: bot.id },
          {},
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (botDB.track)
          return msg.edit(
            `**${Util.escapeBold(
              bot.name
            )}** 수집은 이미 시작되었습니다. 새로 등록하셨다면 1분을 기다려주세요.`
          );

        await botDB.updateOne({ track: true });

        return msg.edit(
          `1분마다 **${Util.escapeBold(bot.name)}** 수집이 시작됩니다.`
        );
      })
      .catch((e) => {
        this.client.logger.warn(
          `FetchError: Error occurred while fetching bot ${id}:\n${e}`
        );
        return msg.edit(`해당 봇을 가져오는 중에 에러가 발생하였습니다.\n${e}`);
      });
  }
}
