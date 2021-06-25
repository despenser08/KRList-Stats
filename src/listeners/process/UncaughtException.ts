import { Listener } from "discord-akairo";

export default class extends Listener {
  public constructor() {
    super("uncaughtException", {
      emitter: "process",
      event: "uncaughtException"
    });
  }

  public async exec(error: Error) {
    this.client.logger.error(`Uncaught Exception: ${error}\n${error.stack}`);
  }
}
