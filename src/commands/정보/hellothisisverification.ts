import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class extends Command {
  constructor() {
    super("hellothisisverification", {
      aliases: ["hellothisisverification"],
      description: {
        content: "한국 디스코드 리스트 인증을 위한 명령어입니다."
      }
    });
  }

  public async exec(message: Message) {
    return message.reply("despenser08#2706 (552348635283587082)");
  }
}
