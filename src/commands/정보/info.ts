import { Command } from "discord-akairo";
import { Message } from "discord.js";

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
        content: "해당 봇이나 서버의 정보를 보여줍니다.",
        usage: '<"봇" | "서버"> <봇 | 서버> [인수]'
      },
      args: [
        {
          id: "action",
          type: [
            ["bot", "봇"],
            ["server", "서버"]
          ],
          prompt: { start: '"봇" | "서버"를 입력해 주세요.' }
        },
        {
          id: "rest",
          match: "rest",
          prompt: { start: "봇 | 서버를 입력해 주세요." }
        }
      ]
    });
  }

  public async exec(
    message: Message,
    { action, rest }: { action: "bot" | "server"; rest: string }
  ) {
    message.content = `${message.util.parsed.prefix}${action} ${rest}`;
    return this.handler.handle(message);
  }
}
