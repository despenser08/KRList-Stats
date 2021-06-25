import { Command, Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class extends Listener {
  public constructor() {
    super("error", {
      emitter: "commandHandler",
      event: "error"
    });
  }

  public async exec(error: Error, message: Message, command: Command) {
    this.client.logger.error(
      `Requested: "${message.content}"\nError on "${command}" command: ${error.message}\n${error.stack}`
    );

    return message.channel.send(
      `\`${command}\` 명령어를 처리하는 와중에 오류가 발생하였습니다.\n${error}`
    );
  }
}
