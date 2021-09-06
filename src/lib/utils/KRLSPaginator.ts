import { MessageActionRow, MessageButton } from "discord.js";
import {
  ButtonPaginator,
  ButtonPaginatorOptions,
  PaginatorDefaultButton
} from "djs-interaction-util";
import CustomEmoji from "./CustomEmoji";

const defaultButton = {
  PREV: PaginatorDefaultButton.PREV.setLabel("이전"),
  STOP: PaginatorDefaultButton.STOP.setLabel("취소"),
  NEXT: PaginatorDefaultButton.NEXT.setLabel("다음")
};

export default class KRLSPaginator extends ButtonPaginator {
  constructor(options?: ButtonPaginatorOptions) {
    super(options);

    if (!options) this.buttons = defaultButton;
    else this.buttons = options.buttons ?? defaultButton;

    // PLEASE DO NOT REMOVE OR EDIT THIS BUTTON CODE; This button is for show credits
    this.actionRows.push(
      new MessageActionRow().addComponents(
        new MessageButton()
          .setURL("https://github.com/despenser08/KRList-Stats")
          .setEmoji(`${new CustomEmoji("877395594216357970", "GitHub")}`)
          .setLabel("KRList-Stats GitHub")
          .setStyle("LINK")
      )
    );
  }
}
