import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { Colors } from "../constants";

export default class KRLSEmbed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions) {
    super(data);

    if (!data) return this.setColor(Colors.PRIMARY);
    this.setColor(data.color ?? Colors.PRIMARY);
    this.setFooter('이 봇은 "한국 디스코드 리스트"의 공식 봇이 아닙니다.');
  }
}
