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

import CustomEmoji from "./utils/CustomEmoji";
import { BotFlags, UserFlags } from "./utils/Flags";

export type ImageFormat = "webp" | "png" | "jpg" | "gif";
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;
export interface ImageOptions {
  format?: ImageFormat;
  size?: ImageSize;
}

export interface KoreanbotsImageOptions {
  format?: "webp" | "png" | "gif";
  size?: 128 | 256 | 512;
}

export type BotFlagsString =
  | "OFFICIAL"
  | "KOREANBOTS_VERIFIED"
  | "PARTNER"
  | "DISCORD_VERIFIED"
  | "PREMIUM"
  | "FIRST_KOREANBOTS_HACKATHON_WINNER";

export enum BotFlagsEnum {
  OFFICIAL = "공식",
  KOREANBOTS_VERIFIED = "한국 디스코드봇 리스트 인증됨",
  PARTNER = "파트너",
  DISCORD_VERIFIED = "디스코드 인증됨",
  PREMIUM = "프리미엄",
  FIRST_KOREANBOTS_HACKATHON_WINNER = "제1회 한국 디스코드봇 리스트 해커톤 우승자"
}

export type UserFlagsString =
  | "ADMINISTRATOR"
  | "BUG_HUNTER"
  | "BOT_REVIEWER"
  | "PREMIUM";

export enum UserFlagsEnum {
  ADMINISTRATOR = "관리자",
  BUG_HUNTER = "버그 헌터",
  BOT_REVIEWER = "봇 리뷰어",
  PREMIUM = "프리미엄"
}

export type Category =
  | "관리"
  | "뮤직"
  | "전적"
  | "게임"
  | "도박"
  | "로깅"
  | "빗금 명령어"
  | "웹 대시보드"
  | "밈"
  | "레벨링"
  | "유틸리티"
  | "대화"
  | "NSFW"
  | "검색"
  | "학교"
  | "코로나19"
  | "번역"
  | "오버워치"
  | "리그 오브 레전드"
  | "배틀그라운드"
  | "마인크래프트";

export type Library =
  | "discord.js"
  | "Eris"
  | "discord.py"
  | "discordcr"
  | "Nyxx"
  | "Discord.Net"
  | "DSharpPlus"
  | "Nostrum"
  | "coxir"
  | "DiscordGo"
  | "Discord4J"
  | "Javacord"
  | "JDA"
  | "Discordia"
  | "RestCord"
  | "Yasmin"
  | "disco"
  | "discordrb"
  | "serenity"
  | "SwiftDiscord"
  | "Sword"
  | "기타"
  | "비공개";

export type RawStatus = "online" | "idle" | "dnd" | "streaming" | "offline";

export enum StatusEnum {
  online = "온라인",
  idle = "자리 비움",
  dnd = "다른 용무중",
  streaming = "방송중",
  offline = "오프라인"
}

export const StatusEmojiEnum = {
  online: new CustomEmoji("708147696879272027", "online"),
  idle: new CustomEmoji("708147696807968842", "idle"),
  dnd: new CustomEmoji("708147696976003092", "dnd"),
  offline: new CustomEmoji("708147696523018255", "offline"),
  streaming: new CustomEmoji("708147697168810024", "streaming")
};

export enum State {
  ok = "정상",
  reported = "일시정지",
  blocked = "강제 삭제",
  private = "특수 목적 봇",
  archived = "잠금 처리 (지원 종료)"
}

export interface RawBot {
  id: string;
  name: string;
  tag: string;
  avatar?: string;
  owners: RawOwner[];
  flags: number;
  lib: Library;
  prefix: string;
  votes: number;
  servers?: number;
  shards?: number;
  intro: string;
  desc: string;
  web?: string;
  git?: string;
  url?: string;
  discord?: string;
  category: Category[];
  vanity?: string;
  bg?: string;
  banner?: string;
  status?: RawStatus;
  state: string;
}

export interface Status {
  raw: RawStatus;
  text: StatusEnum;
  emoji: CustomEmoji;
}

export interface Bot {
  id: string;
  name: string;
  tag: string;
  avatar?: string;
  owners: Owner[];
  flags: BotFlags;
  lib: Library;
  prefix: string;
  votes: number;
  servers?: number;
  shards?: number;
  intro: string;
  desc: string;
  web?: string;
  git?: string;
  url?: string;
  discord?: string;
  category: Category[];
  vanity?: string;
  bg?: string;
  banner?: string;
  status?: Status;
  state: State;
}

export interface RawUser {
  id: string;
  username: string;
  tag: string;
  github?: string;
  flags: number;
  bots: RawBot[];
}

export interface User {
  id: string;
  username: string;
  tag: string;
  github?: string;
  flags: UserFlags;
  bots: Bot[];
}

export interface RawOwner {
  id: string;
  username: string;
  tag: string;
  github?: string;
  flags: number;
  bots: string[];
}

export interface Owner {
  id: string;
  username: string;
  tag: string;
  github?: string;
  flags: UserFlags;
  bots: string[];
}
