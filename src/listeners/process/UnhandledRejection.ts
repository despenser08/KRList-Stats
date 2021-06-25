import { Listener } from "discord-akairo";

export default class extends Listener {
  public constructor() {
    super("unhandledRejection", {
      emitter: "process",
      event: "unhandledRejection"
    });
  }

  public async exec(error: Error) {
    this.client.logger.error(`Unhandled Rejection: ${error}\n${error.stack}`);
  }
}
