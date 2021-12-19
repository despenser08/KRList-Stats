/**
 * @copyright Skyra Project
 * @license https://github.com/skyra-project/skyra/blob/main/LICENSE
 * @see https://github.com/skyra-project/skyra/blob/main/src/lib/env/types.ts
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

  VERSION: string;
  REVISION: string;
}
