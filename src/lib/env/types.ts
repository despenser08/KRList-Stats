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

export type BooleanString = "true" | "false";
export type IntegerString = `${bigint}`;

export type EnvAny = keyof KRLSEnv;
export type EnvString = {
  [K in EnvAny]: KRLSEnv[K] extends BooleanString | IntegerString ? never : K;
}[EnvAny];
export type EnvBoolean = {
  [K in EnvAny]: KRLSEnv[K] extends BooleanString ? K : never;
}[EnvAny];
export type EnvInteger = {
  [K in EnvAny]: KRLSEnv[K] extends IntegerString ? K : never;
}[EnvAny];

export interface KRLSEnv {
  DISCORD_TOKEN: string;

  PREFIX: string;
  OWNERS: string;

  DB_HOST: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_PORT: IntegerString;
  DB_NAME: string;

  SHELL: string;

  KOREANLIST_TOKEN: string;

  SENTRY_DSN: string;
}
