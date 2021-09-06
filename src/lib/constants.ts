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

// https://github.com/koreanbots/core

import { Permissions } from "discord.js";
import { KoreanlistImageOptions } from "./types";
import { BotFlags, ServerFlags } from "./utils/Flags";
import {
  makeBotURL,
  makeImageURL,
  makeServerURL,
  makeUserURL
} from "./utils/format";

export const KoreanlistOrigin = "https://beta.koreanbots.dev";
export const KoreanlistEndPoints = {
  OG: class {
    static root = "https://og.kbots.link";
    static generate(
      id: string,
      name: string,
      bio: string,
      tags: string[],
      stats: string[],
      type: "bot" | "server"
    ) {
      const u = new URL(this.root);
      u.pathname = name;
      u.searchParams.append(
        "image",
        KoreanlistOrigin +
          (type === "bot"
            ? KoreanlistEndPoints.CDN.avatar(id, { format: "webp", size: 256 })
            : KoreanlistEndPoints.CDN.icon(id, { format: "webp", size: 256 }))
      );
      u.searchParams.append("bio", bio);
      u.searchParams.append("type", type);
      tags.map((t) => u.searchParams.append("tags", t));
      stats.map((s) => u.searchParams.append("stats", s));
      return u.href;
    }
    static bot(
      id: string,
      name: string,
      bio: string,
      tags: string[],
      stats: string[]
    ) {
      return this.generate(id, name, bio, tags, stats, "bot");
    }
    static server(
      id: string,
      name: string,
      bio: string,
      tags: string[],
      stats: string[]
    ) {
      return this.generate(id, name, bio, tags, stats, "server");
    }
  },
  CDN: class {
    static root = "/api/image";
    static avatar(id: string, options?: KoreanlistImageOptions) {
      return makeImageURL(`${this.root}/discord/avatars/${id}`, options);
    }
    static icon(id: string, options?: KoreanlistImageOptions) {
      return makeImageURL(`${this.root}/discord/icons/${id}`, options);
    }
  },
  URL: class {
    static bot(options: { id: string; flags?: BotFlags; vanity?: string }) {
      return `${KoreanlistOrigin}${makeBotURL(options)}`;
    }
    static server(options: {
      id: string;
      flags?: ServerFlags;
      vanity?: string;
    }) {
      return `${KoreanlistOrigin}${makeServerURL(options)}`;
    }
    static user(options: { id: string }) {
      return `${KoreanlistOrigin}${makeUserURL(options)}`;
    }
    static logo = `${KoreanlistOrigin}/logo.png`;
  },
  API: class {
    static root = "/api/v2";
    static get base() {
      return `${KoreanlistOrigin}${this.root}`;
    }

    static bot(id: string) {
      return `${this.base}/bots/${id}`;
    }
    static server(id: string) {
      return `${this.base}/servers/${id}`;
    }
    static searchAll(query: string, page = 1) {
      return `${this.base}/search/all?query=${encodeURIComponent(
        query
      )}&page=${page}`;
    }
    static searchBot(query: string, page = 1) {
      return `${this.base}/search/bots?query=${encodeURIComponent(
        query
      )}&page=${page}`;
    }
    static searchServer(query: string, page = 1) {
      return `${this.base}/search/servers?query=${encodeURIComponent(
        query
      )}&page=${page}`;
    }
    static voteList(page = 1) {
      return `${this.base}/list/bots/votes?page=${page}`;
    }
    static newList() {
      return `${this.base}/list/bots/new`;
    }
    static user(id: string) {
      return `${this.base}/users/${id}`;
    }
    static stats(id: string) {
      return `${this.bot(id)}/stats`;
    }
  }
};

export enum Colors {
  PRIMARY = "#7070FB"
}

export const DiscordOrigin = "https://discord.com";
export const DiscordEndPoints = {
  URL: class {
    static inviteBot(id: string, slash = true, perms = Permissions.ALL) {
      return `${DiscordOrigin}/api/oauth2/authorize?client_id=${id}&permissions=${perms}&scope=bot${
        slash ? "%20applications.commands" : ""
      }`;
    }
  }
};

export enum CommandBlocked {
  owner = "봇 관리자 전용 명령어입니다.",
  guild = "서버 전용 명령어입니다.",
  dm = "DM 전용 명령어입니다."
}
