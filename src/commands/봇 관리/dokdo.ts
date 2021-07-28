import { ApplyOptions } from "@sapphire/decorators";
import { Args, Command, CommandOptions } from "@sapphire/framework";
import type { Message } from "discord.js";

@ApplyOptions<CommandOptions>({
  name: "독도",
  description: "wonderlandpark님이 개발하신 디스코드 봇 디버깅 툴",
  aliases: ["dokdo", "dok", "독도", "evaluate", "eval", "이발", "execute", "exec", "실행"],
  preconditions: ["OwnerOnly"]
})
export default class extends Command {
  public async run(message: Message, args: Args) {
    this.context.dokdo.options.prefix = args.commandContext.commandPrefix;
    this.context.dokdo.options.aliases = [...this.aliases];

    this.context.dokdo.run(message);
  }
}
