import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { Colors } from "../constants";

export default class KRLSEmbed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions) {
    super(data);

    if (!data) {
      this.setColor(Colors.PRIMARY);
      super.setFooter(
        '해당 서비스는 "한국 디스코드 리스트"의 서드파티 서비스입니다.'
      );
    } else {
      this.setColor(data.color ?? Colors.PRIMARY);

      if (!data.footer)
        super.setFooter(
          '해당 서비스는 "한국 디스코드 리스트"의 서드파티 서비스입니다.'
        );
      else
        super.setFooter(
          data.footer.text
            ? `${data.footer.text} • 해당 서비스는 "한국 디스코드 리스트"의 서드파티 서비스입니다.`
            : '해당 서비스는 "한국 디스코드 리스트"의 서드파티 서비스입니다.',
          data.footer.iconURL
        );
    }
  }

  public setFooter(text: string, iconURL?: string) {
    return super.setFooter(
      `${text} • 해당 서비스는 "한국 디스코드 리스트"의 서드파티 서비스입니다.`,
      iconURL
    );
  }
}
