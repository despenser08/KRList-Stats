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

import { MessageActionRow, MessageButton } from "discord.js";
import { ButtonPaginator, ButtonPaginatorOptions, PaginatorDefaultButton } from "djs-interaction-util";

const defaultButton = {
  PREV: PaginatorDefaultButton.PREV.setLabel("이전"),
  STOP: PaginatorDefaultButton.STOP.setLabel("취소"),
  NEXT: PaginatorDefaultButton.NEXT.setLabel("다음")
};

export default class KRLSPaginator extends ButtonPaginator {
  constructor(options?: ButtonPaginatorOptions) {
    super(options);

    this.denied = {
      content: { content: "요청한 사람만 조작할 수 있습니다." },
      ephemeral: true
    };

    if (!options) this.buttons = defaultButton;
    else {
      this.buttons = options.buttons ?? defaultButton;
      this.denied = options.denied ?? this.denied;
    }

    // PLEASE DO NOT REMOVE OR EDIT THIS BUTTON CODE; This button is for show credits
    this.actionRows.push(
      new MessageActionRow().addComponents(
        new MessageButton()
          .setURL("https://github.com/despenser08/KRList-Stats")
          .setEmoji("900808324667301919")
          .setLabel("KRList-Stats GitHub")
          .setStyle("LINK")
      )
    );
  }
}
