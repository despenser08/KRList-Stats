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

import moment from "moment-timezone";
import { TIMEZONE } from "../../config";
import { KoreanlistEndPoints } from "../constants";
import { ImageOptions, BotOwner, User, ServerOwner } from "../types";
import { BotFlags, ServerFlags } from "./Flags";

export function formatTime({
  date = null,
  format = "YYYY/MM/DD hh:mm:ss A",
  timezone = TIMEZONE
} = {}) {
  return date
    ? moment(date).tz(timezone).format(format)
    : moment.tz(timezone).format(format);
}

export function formatNumber(value: number) {
  if (!value) return "0";
  const suffixes = ["", "만", "억", "조", "해"];
  const suffixNum = Math.floor(("" + value).length / 4);
  let shortValue: string | number = parseFloat(
    (suffixNum != 0 ? value / Math.pow(10000, suffixNum) : value).toPrecision(2)
  );
  if (shortValue % 1 != 0) {
    shortValue = shortValue.toFixed(1);
  }
  if (suffixNum === 1 && shortValue < 1) return Number(shortValue) * 10 + "천";
  else if (shortValue === 1000) return "1천";
  return shortValue + suffixes[suffixNum];
}

export function makeImageURL(
  root: string,
  { format = "png", size = 256 }: ImageOptions
): string {
  return `${root}.${format}?size=${size}`;
}

export function makeBotURL({
  id,
  vanity,
  flags = new BotFlags(0)
}: {
  id: string;
  flags?: BotFlags;
  vanity?: string;
}) {
  return `/bots/${
    (flags.has("KOREANBOTS_VERIFIED") || flags.has("PARTNER")) && vanity
      ? vanity
      : id
  }`;
}

export function makeServerURL({
  id,
  vanity,
  flags = new ServerFlags(0)
}: {
  id: string;
  flags?: ServerFlags;
  vanity?: string;
}) {
  return `/servers/${
    (flags.has("KOREANBOTS_VERIFIED") || flags.has("PARTNER")) && vanity
      ? vanity
      : id
  }`;
}

export function makeUserURL({ id }: { id: string }) {
  return `/users/${id}`;
}

export function lineUserText(user: User | BotOwner | ServerOwner) {
  return `[${user.username}#${user.tag}](${KoreanlistEndPoints.URL.user({
    id: user.id
  })}) (<@${user.id}>)`;
}

export function filterDesc(text: string) {
  const imageRegex = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
  const images: string[] = [];

  const res = text
    .replace(/<[^>]*>/g, "")
    .replace(imageRegex, (image) => {
      const url = image.replace(imageRegex, "$1");
      images.push(url);

      return `[[봇 설명 이미지 #${images.length}]](${url})`;
    })
    .replace(
      /^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm,
      "\n"
    )
    .replace(/(\r\n|\n|\r){2,}/g, "\n\n");

  return { res, images };
}
