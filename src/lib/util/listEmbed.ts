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

import { Message, MessageEmbed } from "discord.js";
import { Color } from "../constants";

export default async function listEmbed(
  message: Message,
  pages: MessageEmbed[],
  options: {
    description?: { text?: string; icon?: string };
    itemLength?: number;
    itemName?: string;
    emojis?: string[];
    timeout?: number;
  } = { emojis: ["◀", "▶", "❌"], timeout: 12e4 }
) {
  const emojis = options.emojis ?? ["◀", "▶", "❌"];
  const timeout = options.timeout ?? 12e4;

  if (!message || !message.channel || !(message.channel.type === "text" || message.channel.type === "news")) return;
  if (!pages) return;
  if (emojis.length !== 3) return;

  let page = 0;
  return message.channel
    .send(
      pages[page].setFooter(
        `페이지 ${page + 1}/${pages.length}${options.itemLength && options.itemName ? ` | ${options.itemLength}개의 ${options.itemName}` : ""}${
          options.description && options.description.text ? ` • ${options.description.text}` : ""
        }`,
        options.description?.icon ?? undefined
      )
    )
    .then(async (curPage) => {
      for await (const emoji of emojis) await curPage.react(emoji);

      const collector = curPage.createReactionCollector(() => true, {
        time: timeout
      });

      collector.on("collect", (reaction, user) => {
        reaction.users.remove(user);

        if (user.id !== message.author.id || !emojis.includes(reaction.emoji.name)) return;

        switch (reaction.emoji.name) {
          case emojis[0]:
            page = page > 0 ? --page : pages.length - 1;
            break;

          case emojis[1]:
            page = page + 1 < pages.length ? ++page : 0;
            break;

          case emojis[2]:
            return collector.stop();
        }

        curPage.edit(
          pages[page].setFooter(
            `페이지 ${page + 1}/${pages.length}${options.itemLength && options.itemName ? ` | ${options.itemLength}개의 ${options.itemName}` : ""}${
              options.description && options.description.text ? ` • ${options.description.text}` : ""
            }`,
            options.description?.icon ?? undefined
          )
        );
      });

      collector.on("end", () => {
        curPage.reactions.removeAll();
        if (curPage.editable) curPage.edit(new MessageEmbed().setColor(Color.PRIMARY).setDescription("세션이 만료되었습니다. 다시 요청해주세요."));
      });
    });
}
