/**
 * @copyright Koreanbots
 * @license https://github.com/koreanbots/core/blob/master/LICENSE
 * @see https://github.com/koreanbots/core/blob/master/utils/Constants.ts
 */

import type { BotFlags, ServerFlags } from "#utils/Flags";
import { makeBotURL, makeImageURL, makeServerURL } from "#utils/format";
import { Permissions } from "discord.js";
import { URL } from "url";
import type { KoreanlistImageOptions } from "./types";

export const KoreanlistOrigin = "https://koreanbots.dev";
export const KoreanlistEndPoints = {
  OG: class {
    static root = "https://og.kbots.link";
    static generate(id: string, name: string, bio: string, tags: string[], stats: string[], type: "bot" | "server") {
      const u = new URL(this.root);
      u.pathname = name + ".png";
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
    static bot(id: string, name: string, bio: string, tags: string[], stats: string[]) {
      return this.generate(id, name, bio, tags, stats, "bot");
    }
    static server(id: string, name: string, bio: string, tags: string[], stats: string[]) {
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
    static botVote(options: { id: string; flags?: BotFlags; vanity?: string }) {
      return `${this.bot(options)}/vote`;
    }
    static botReport(options: { id: string; flags?: BotFlags; vanity?: string }) {
      return `${this.bot(options)}/report`;
    }
    static server(options: { id: string; flags?: ServerFlags; vanity?: string }) {
      return `${KoreanlistOrigin}${makeServerURL(options)}`;
    }
    static serverVote(options: { id: string; flags?: ServerFlags; vanity?: string }) {
      return `${this.server(options)}/vote`;
    }
    static serverReport(options: { id: string; flags?: ServerFlags; vanity?: string }) {
      return `${this.server(options)}/report`;
    }
    static user(options: { id: string }) {
      return `${KoreanlistOrigin}/users/${options.id}`;
    }
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
    static serverOwners(id: string) {
      return `${this.base}/servers/${id}/owners`;
    }
    static searchAll(query: string, page = 1) {
      return `${this.base}/search/all?query=${encodeURIComponent(query)}&page=${page}`;
    }
    static searchBot(query: string, page = 1) {
      return `${this.base}/search/bots?query=${encodeURIComponent(query)}&page=${page}`;
    }
    static searchServer(query: string, page = 1) {
      return `${this.base}/search/servers?query=${encodeURIComponent(query)}&page=${page}`;
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

export const DiscordOrigin = "https://discord.com";
export const DiscordEndPoints = {
  URL: class {
    static inviteBot(id: string, slash = true, perms = Permissions.DEFAULT) {
      return `${DiscordOrigin}/api/oauth2/authorize?client_id=${id}&permissions=${perms}&scope=bot${slash ? "%20applications.commands" : ""}`;
    }
  }
};

export const botDescription = "한국 디스코드 리스트의 스텟을 확인하세요.";
export const allowDokdoCommand = ["docs", "djs", "version", "ver"];
export enum Colors {
  PRIMARY = "#7070FB"
}
export enum CommandBlocked {
  owner = "봇 관리자 전용 명령어입니다.",
  guild = "서버 전용 명령어입니다.",
  dm = "DM 전용 명령어입니다."
}
