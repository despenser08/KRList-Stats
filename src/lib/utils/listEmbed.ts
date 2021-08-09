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

import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from "discord.js";

const defaultButton = [
  new MessageButton().setCustomId("prev").setLabel("이전").setStyle("PRIMARY"),
  new MessageButton()
    .setCustomId("cancel")
    .setLabel("취소")
    .setStyle("SECONDARY"),
  new MessageButton().setCustomId("next").setLabel("다음").setStyle("PRIMARY")
];

export default async function (
  targetMessage: Message,
  pages: MessageEmbed[],
  options: {
    description?: { text?: string; icon?: string };
    itemLength?: number;
    itemName?: string;
    buttons?: MessageButton[];
    timeout?: number;
    message?: Message;
  } = {
    buttons: defaultButton,
    timeout: 12e4
  }
) {
  const buttons = options.buttons ?? defaultButton;
  if (!options.timeout) options.timeout = 12e4;

  if (!targetMessage && !targetMessage.channel) return;
  if (!pages) return;
  if (buttons.length !== 3) return;

  let page = 0;
  const content = {
    content: null,
    embeds: [
      pages[page].setFooter(
        `페이지 ${page + 1}/${pages.length}${
          options.itemLength && options.itemName
            ? ` | ${options.itemLength}개의 ${options.itemName}`
            : ""
        }${
          options.description && options.description.text
            ? ` • ${options.description.text}`
            : ""
        }`,
        options.description?.icon ?? null
      )
    ],
    components: [new MessageActionRow().addComponents(buttons)]
  };
  let curPage: Message;

  if (options.message) curPage = await options.message.edit(content);
  else curPage = await targetMessage.reply(content);

  const collector = curPage.createMessageComponentCollector({
    time: options.timeout
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    if (interaction.user.id == targetMessage.author.id) {
      switch (interaction.customId) {
        case buttons[0].customId:
          page = page > 0 ? --page : pages.length - 1;
          break;

        case buttons[1].customId:
          return collector.stop();

        case buttons[2].customId:
          page = page + 1 < pages.length ? ++page : 0;
          break;

        default:
          return;
      }

      await interaction.editReply({
        embeds: [
          pages[page].setFooter(
            `페이지 ${page + 1}/${pages.length}${
              options.itemLength && options.itemName
                ? ` | ${options.itemLength}개의 ${options.itemName}`
                : ""
            }${
              options.description && options.description.text
                ? ` • ${options.description.text}`
                : ""
            }`,
            options.description?.icon ?? null
          )
        ]
      });
    } else
      interaction.followUp({
        content: "요청한 사람만 조작할 수 있습니다.",
        ephemeral: true
      });
  });

  collector.on("end", () => {
    curPage.edit({ components: [] });
  });
}
