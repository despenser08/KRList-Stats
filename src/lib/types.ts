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

import { formatEmoji } from "@discordjs/builders";
import type { BotFlags, ServerFlags, UserFlags } from "./utils/Flags";

export interface FetchResponse<T> {
  code: number;
  data?: T;
  message?: string;
  version: number;
}

export interface FetchListResponse<T> {
  code: number;
  data?: { type: string; data: T[]; currentPage: number; totalPage: number };
  message?: string;
  version: number;
}

export type ImageFormat = "webp" | "png" | "jpg" | "gif";
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;
export interface ImageOptions {
  format?: ImageFormat;
  size?: ImageSize;
}

export interface KoreanlistImageOptions {
  format?: "webp" | "png" | "gif";
  size?: 128 | 256 | 512;
}

export type BotFlagsString =
  | "OFFICIAL"
  | "TRUSTED"
  | "PARTNERED"
  | "VERIFIED"
  | "PREMIUM"
  | "HACKERTHON";
export enum BotFlagsEnum {
  OFFICIAL = "공식",
  TRUSTED = "한국 디스코드 리스트 인증됨",
  PARTNERED = "파트너",
  VERIFIED = "디스코드 인증됨",
  PREMIUM = "프리미엄",
  HACKERTHON = "제1회 한국 디스코드 리스트 해커톤 우승자"
}

export type ServerFlagsString =
  | "OFFICIAL"
  | "TRUSTED"
  | "PARTNERED"
  | "VERIFIED"
  | "DISCORD_PARTNERED";
export enum ServerFlagsEnum {
  OFFICIAL = "공식",
  TRUSTED = "한국 디스코드 리스트 인증됨",
  PARTNERED = "파트너",
  VERIFIED = "디스코드 인증됨",
  DISCORD_PARTNERED = "디스코드 파트너"
}

export type UserFlagsString = "STAFF" | "BUGHUNTER" | "BOTREVIEWER" | "PREMIUM";
export enum UserFlagsEnum {
  STAFF = "관리자",
  BUGHUNTER = "버그 헌터",
  BOTREVIEWER = "봇 리뷰어",
  PREMIUM = "프리미엄"
}

export type BotCategory =
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

export type ServerCategory =
  | "커뮤니티"
  | "친목"
  | "음악"
  | "기술"
  | "교육"
  | "게임"
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

export type RawBotStatus = "online" | "idle" | "dnd" | "streaming" | "offline";
export interface BotStatus {
  raw: RawBotStatus;
  text: BotStatusEnum;
  emoji: string;
}

export type RawBotState =
  | "ok"
  | "reported"
  | "blocked"
  | "archived"
  | "private";
export enum BotState {
  ok = "정상",
  reported = "일시정지",
  blocked = "강제 삭제",
  private = "특수 목적 봇",
  archived = "잠금 처리 (지원 종료)"
}

export type RawServerState = "ok" | "reported" | "blocked" | "unreachable";
export enum ServerState {
  ok = "정상",
  reported = "일시정지",
  blocked = "강제 삭제",
  unreachable = "정보 갱신 불가"
}

export enum BotStatusEnum {
  online = "온라인",
  idle = "자리 비움",
  dnd = "다른 용무중",
  streaming = "방송중",
  offline = "오프라인"
}

export const BotStatusEmojiEnum = {
  online: formatEmoji("708147696879272027"),
  idle: formatEmoji("708147696807968842"),
  dnd: formatEmoji("708147696976003092"),
  offline: formatEmoji("708147696523018255"),
  streaming: formatEmoji("708147697168810024")
};

export interface Emoji {
  id: string;
  name: string;
  url: string;
}
export interface RawBot {
  id: string;
  name: string;
  flags: number;
  state: RawBotState;
  tag: string;
  avatar?: string;
  status?: RawBotStatus;
  lib: Library;
  prefix: string;
  votes: number;
  servers?: number;
  shards?: number;
  intro: string;
  desc: string;
  category: BotCategory[];
  web?: string;
  git?: string;
  url?: string;
  discord?: string;
  vanity?: string;
  bg?: string;
  banner?: string;
  owners: RawBotOwner[];
}

export interface Bot {
  id: string;
  name: string;
  flags: BotFlags;
  state: BotState;
  tag: string;
  avatar?: string;
  status?: BotStatus;
  lib: Library;
  prefix: string;
  votes: number;
  servers?: number;
  shards?: number;
  intro: string;
  desc: string;
  category: BotCategory[];
  web?: string;
  git?: string;
  url?: string;
  discord?: string;
  vanity?: string;
  bg?: string;
  banner?: string;
  owners: BotOwner[];
}

export interface RawServerBot {
  id: string;
  name: string;
  flags: number;
  state: RawBotState;
  tag: string;
  avatar?: string;
  status?: RawBotStatus;
  lib: Library;
  prefix: string;
  votes: number;
  servers?: number;
  shards?: number;
  intro: string;
  desc: string;
  category: BotCategory[];
  web?: string;
  git?: string;
  url?: string;
  discord?: string;
  vanity?: string;
  bg?: string;
  banner?: string;
  owners: string[];
}

export interface ServerBot {
  id: string;
  name: string;
  flags: BotFlags;
  state: BotState;
  tag: string;
  avatar?: string;
  status?: BotStatus;
  lib: Library;
  prefix: string;
  votes: number;
  servers?: number;
  shards?: number;
  intro: string;
  desc: string;
  category: BotCategory[];
  web?: string;
  git?: string;
  url?: string;
  discord?: string;
  vanity?: string;
  bg?: string;
  banner?: string;
  owners: string[];
}

export interface RawServer {
  id: string;
  name: string;
  flags: number;
  state: RawServerState;
  icon?: string;
  votes: number;
  members?: number;
  boostTier?: number;
  emojis: Emoji[];
  intro: string;
  desc: string;
  category: ServerCategory[];
  invite: string;
  vanity?: string;
  bg?: string;
  banner?: string;
  owner?: RawServerOwner;
  bots: RawServerBot[];
}

export interface Server {
  id: string;
  name: string;
  flags: ServerFlags;
  state: ServerState;
  icon?: string;
  votes: number;
  members?: number;
  boostTier?: number;
  emojis: Emoji[];
  intro: string;
  desc: string;
  category: ServerCategory[];
  invite: string;
  vanity?: string;
  bg?: string;
  banner?: string;
  owner?: ServerOwner;
  bots: ServerBot[];
}

export interface RawUser {
  id: string;
  avatar: string;
  tag: string;
  username: string;
  flags: number;
  github?: string;
  bots: RawBot[];
  servers: RawServer[];
}

export interface User {
  id: string;
  tag: string;
  username: string;
  flags: UserFlags;
  github?: string;
  bots: Bot[];
  servers: Server[];
}

export interface RawServerOwner {
  id: string;
  tag: string;
  username: string;
  flags: number;
  github?: string;
  bots: string[];
  servers: string[];
}

export interface ServerOwner {
  id: string;
  tag: string;
  username: string;
  flags: UserFlags;
  github?: string;
  bots: string[];
  servers: string[];
}

export interface RawBotOwner {
  id: string;
  username: string;
  tag: string;
  github?: string;
  flags: number;
  bots: string[];
  servers: string[];
}

export interface BotOwner {
  id: string;
  username: string;
  tag: string;
  github?: string;
  flags: ServerFlags;
  servers: string[];
}

export interface SearchAllResult {
  bots: RawBot[];
  servers: RawServer[];
}
