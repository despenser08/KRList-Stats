import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { Colors } from "../constants";

export default class KRLSEmbed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions) {
    super(data);

    if (!data) {
      this.setColor(Colors.PRIMARY);
      this.setFooter('이 봇은 "한국 디스코드 리스트"의 공식 봇이 아닙니다.');
    } else {
      this.setColor(data.color ?? Colors.PRIMARY);

      if (!data.footer)
        this.setFooter('이 봇은 "한국 디스코드 리스트"의 공식 봇이 아닙니다.');
      else
        this.setFooter(
          data.footer.text
            ? `${data.footer.text} • 이 봇은 "한국 디스코드 리스트"의 공식 봇이 아닙니다.`
            : '이 봇은 "한국 디스코드 리스트"의 공식 봇이 아닙니다.',
          data.footer.iconURL
        );
    }
  }
}
