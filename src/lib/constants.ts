import { ImageFormat, ImageSize, KoreanbotsImageOptions } from "./types";

export const KoreanbotsOrigin = "https://koreanbots.dev";
export const KoreanbotsEndPoints = {
  OG: class {
    static root = "https://og.kbots.link";
    static bot(
      id: string,
      name: string,
      bio: string,
      tags: string[],
      stats: string[]
    ) {
      const u = new URL(this.root);
      u.pathname = name;
      u.searchParams.append(
        "image",
        KoreanbotsOrigin +
          KoreanbotsEndPoints.CDN.avatar(id, { format: "webp", size: 256 })
      );
      u.searchParams.append("bio", bio);
      tags.map((t) => u.searchParams.append("tags", t));
      stats.map((s) => u.searchParams.append("stats", s));
      return u.href;
    }
  },
  CDN: class {
    static root = "/api/image";
    static avatar(id: string, options?: KoreanbotsImageOptions) {
      return makeImageURL(`${this.root}/discord/avatars/${id}`, options);
    }
  },
  URL: class {
    static bot(id: string) {
      return `${KoreanbotsOrigin}/bots/${id}`;
    }
    static user(id: string) {
      return `${KoreanbotsOrigin}/users/${id}`;
    }
    static submittedBot(id: string, date: number) {
      return `${KoreanbotsOrigin}/pendingBots/${id}/${date}`;
    }
  },
  API: class {
    static root = "/api/v2";
    static get base() {
      return `${KoreanbotsOrigin}${this.root}`;
    }

    static bot(id: string) {
      return `${this.base}/bots/${id}`;
    }
    static search(query: string, page = 1) {
      return `${this.base}/search/bots?query=${encodeURIComponent(
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

export function makeImageURL(
  root: string,
  {
    format = "png",
    size = 256
  }: {
    format?: ImageFormat;
    size?: ImageSize;
  }
): string {
  return `${root}.${format}?size=${size}`;
}

export enum Colors {
  PRIMARY = "#7070FB"
}
