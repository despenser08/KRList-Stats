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

import { KoreanlistEndPoints } from "#lib/constants";
import type { BotOwner, ImageOptions, ServerOwner, User } from "#lib/types";
import { hyperlink, userMention } from "@discordjs/builders";
import axios from "axios";
import { Guild, GuildMember, MessageAttachment, User as DiscordUser } from "discord.js";
import { marked } from "marked";
import sharp from "sharp";
import { BotFlags, ServerFlags } from "./Flags";
import MarkedRenderer from "./MarkedRenderer";

/**
 * @copyright Koreanbots
 * @license https://github.com/koreanbots/core/blob/master/LICENSE
 * @see https://github.com/koreanbots/core/blob/master/utils/Tools.ts
 */
export function formatNumber(value?: number) {
  if (!value) return "0";
  const suffixes = ["", "만", "억", "조", "해"];
  const suffixNum = Math.floor(("" + value).length / 4);
  let shortValue: string | number = parseFloat((suffixNum != 0 ? value / Math.pow(10000, suffixNum) : value).toPrecision(2));
  if (shortValue % 1 != 0) {
    shortValue = shortValue.toFixed(1);
  }
  if (suffixNum === 1 && shortValue < 1) return Number(shortValue) * 10 + "천";
  else if (shortValue === 1000) return "1천";
  return shortValue + suffixes[suffixNum];
}

/**
 * @copyright Koreanbots
 * @license https://github.com/koreanbots/core/blob/master/LICENSE
 * @see https://github.com/koreanbots/core/blob/master/utils/Tools.ts
 */
export function makeImageURL(root: string, { format = "gif", size = 512 }: ImageOptions = { format: "gif", size: 512 }): string {
  return `${root}.${format}?size=${size}`;
}

/**
 * @copyright Koreanbots
 * @license https://github.com/koreanbots/core/blob/master/LICENSE
 * @see https://github.com/koreanbots/core/blob/master/utils/Tools.ts
 */
export function makeBotURL({ id, vanity, flags = new BotFlags(0) }: { id: string; flags?: BotFlags; vanity?: string }) {
  return `/bots/${(flags.has("TRUSTED") || flags.has("PARTNERED")) && vanity ? vanity : id}`;
}

/**
 * @copyright Koreanbots
 * @license https://github.com/koreanbots/core/blob/master/LICENSE
 * @see https://github.com/koreanbots/core/blob/master/utils/Tools.ts
 */
export function makeServerURL({ id, vanity, flags = new ServerFlags(0) }: { id: string; flags?: ServerFlags; vanity?: string }) {
  return `/servers/${(flags.has("TRUSTED") || flags.has("PARTNERED")) && vanity ? vanity : id}`;
}

export function lineUserText(user?: User | BotOwner | ServerOwner) {
  if (!user) return null;

  return `${hyperlink(`${user.username}#${user.tag}`, KoreanlistEndPoints.URL.user(user))} (${userMention(user.id)})`;
}

export async function filterDesc(text: string) {
  const escapeSymbol = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    lt: "<",
    gt: ">"
  };

  const renderer = new MarkedRenderer();

  let res = marked
    .parse(text, { renderer })
    .replace(/(\r\n|\n|\r){2,}/g, "\n\n")
    .replace(/&(nbsp|amp|quot|lt|gt);/g, (_, entity: keyof typeof escapeSymbol) => escapeSymbol[entity]);
  if (res.length > 4096) res = `${res.substring(0, 4092)}\n...`;

  const images: ({ raw: true; url: string; index: number } | { raw: false; url: string; index: number; data: MessageAttachment })[] = [];
  for await (const url of renderer.images) {
    const index = renderer.images.indexOf(url) + 1;

    const res = await axios
      .get(url)
      .then((data) => {
        if (data.headers["content-type"].includes("image/svg+xml"))
          return Buffer.from(data.data.replace(/font-family="[^"]*"/, 'font-family="Noto Sans KR"'));
        else return null;
      })
      .catch(() => null);

    if (res)
      await sharp(res)
        .png()
        .toBuffer()
        .then((data) => images.push({ raw: false, url, index, data: new MessageAttachment(data, `${index}.png`) }));
    else images.push({ raw: true, url, index });
  }

  return { res, images };
}

export function getId(data: DiscordUser | GuildMember | Guild | string) {
  return encodeURIComponent(typeof data === "object" && "id" in data ? data.id : data);
}
