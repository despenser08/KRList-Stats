import { Command, Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class extends Listener {
  public constructor() {
    super("missingPermissions", {
      emitter: "commandHandler",
      event: "missingPermissions"
    });
  }

  public async exec(
    message: Message,
    command: Command,
    type: string,
    missing: unknown
  ) {
    return message.channel.send(
      `${
        type === "user"
          ? `${message.author}님은 \`${missing}\` 권한이 없어`
          : `현재 봇이 \`${missing}\` 권한이 없어`
      } \`${command}\` 명령어를 사용하실 수 없습니다.`
    );
  }
}
