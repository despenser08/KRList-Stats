import { Listener } from "discord-akairo";

export default class extends Listener {
  public constructor() {
    super("warning", {
      emitter: "process",
      event: "warning"
    });
  }

  public async exec(warn: Error) {
    this.client.logger.warn(`Warning: ${warn}\n${warn.stack}`);
  }
}
