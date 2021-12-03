/**
 * @copyright Skyra Project
 * @license https://github.com/skyra-project/skyra/blob/main/LICENSE
 * @see https://github.com/skyra-project/skyra/blob/main/src/lib/env/utils.ts
 */

import { isNullishOrEmpty } from "@sapphire/utilities";
import type { EnvAny, EnvBoolean, EnvInteger, EnvString, KRLSEnv } from ".";

export function envParseInteger(key: EnvInteger, defaultValue?: number) {
  const value = process.env[key];

  if (isNullishOrEmpty(value)) {
    if (defaultValue === undefined) throw new TypeError(`EnvError: "${key}" must be an integer, but is empty or undefined.`);
    return defaultValue;
  }

  const integer = Number(value);
  if (Number.isInteger(integer)) return integer;
  throw new Error(`EnvError: "${key}" must be an integer, but received "${value}" (${typeof value}).`);
}

export function envParseBoolean(key: EnvBoolean, defaultValue?: boolean) {
  const value = process.env[key];

  if (isNullishOrEmpty(value)) {
    if (defaultValue === undefined) throw new TypeError(`EnvError: "${key}" must be a boolean, but is empty or undefined.`);
    return defaultValue;
  }

  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`EnvError: "${key}" must be a boolean, but received "${value}" (${typeof value}).`);
}

export function envParseString<K extends EnvString>(key: K, defaultValue?: KRLSEnv[K]) {
  const value = process.env[key];

  if (isNullishOrEmpty(value)) {
    if (defaultValue === undefined) throw new TypeError(`EnvError: "${key}" must be a string, but is empty or undefined.`);
    return defaultValue;
  }

  return value;
}

export function envParseArray(key: EnvString, defaultValue?: string[]) {
  const value = process.env[key];
  if (isNullishOrEmpty(value)) {
    if (defaultValue === undefined) throw new Error(`EnvError: "${key}" must be an array, but is empty or undefined.`);
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) return parsed.map((parse) => `${parse}`);
    else throw new TypeError(`EnvError: "${key}" is not a JSON format.`);
  } catch {
    return value.split(",");
  }
}

export function envIsDefined(...keys: readonly EnvAny[]) {
  return keys.every((key) => {
    const value = process.env[key];
    return value !== undefined && value.length !== 0;
  });
}
