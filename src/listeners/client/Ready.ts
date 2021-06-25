import { Listener } from "discord-akairo";
import scheduleFetch from "../../lib/scheduleTask";

export default class extends Listener {
  constructor() {
    super("ready", { emitter: "client", event: "ready" });
  }

  public async exec() {
    scheduleFetch(this.client);

    this.client.user.setPresence({
      status: "idle",
      activity: {
        name: `${this.client.commandHandler.prefix[0]}도움말`,
        type: "PLAYING"
      }
    });

    this.client.logger.info(`${this.client.user.tag} is ready.`);
  }
}
