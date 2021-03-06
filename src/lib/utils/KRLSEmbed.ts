/**
 * Copyright (C) 2021 despenser08
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Colors } from "#lib/constants";
import { envParseString } from "#lib/env";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export default class KRLSEmbed extends MessageEmbed {
  public template = `해당 서비스는 "한국 디스코드 리스트"의 공식 서비스가 아닙니다. • v${envParseString("VERSION")} • ${envParseString(
    "REVISION"
  ).slice(0, 7)}`;

  constructor(data?: MessageEmbed | MessageEmbedOptions) {
    super(data);

    if (!data) {
      this.setColor(Colors.PRIMARY);
      super.setFooter(this.template);
    } else {
      this.setColor(data.color ?? Colors.PRIMARY);

      if (!data.footer) super.setFooter(this.template);
      else super.setFooter(data.footer.text ? `${data.footer.text} • ${this.template}` : this.template, data.footer.iconURL);
    }
  }

  public setFooter(text: string, iconURL?: string) {
    return super.setFooter(`${text} • ${this.template}`, iconURL);
  }
}
