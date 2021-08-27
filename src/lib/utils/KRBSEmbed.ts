import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { Colors } from "../constants";

export default class KRBSEmbed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions) {
    super(data);

    if (!data) return this.setColor(Colors.PRIMARY);
    this.setColor(data.color ?? Colors.PRIMARY);
  }
}
