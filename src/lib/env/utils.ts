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
