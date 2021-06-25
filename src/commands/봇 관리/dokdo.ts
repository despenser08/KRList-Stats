import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class extends Command {
  public constructor() {
    super("독도", {
      aliases: [
        "독도",
        "dokdo",
        "dok",
        "evaluate",
        "eval",
        "이발",
        "execute",
        "exec",
        "실행"
      ],
      description: {
        content: "wonderlandpark님이 개발하신 디스코드 봇 디버깅 툴"
      },
      ownerOnly: true
    });
  }

  public async exec(message: Message) {
    this.client.dokdo.options.prefix = message.util.parsed.prefix;
    return this.client.dokdo.run(message);
  }
}
