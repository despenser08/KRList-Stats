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

// https://github.com/hughsk/fresh-require

export default function freshRequire(file: string) {
  const resolvedFile = require.resolve(file);

  const temp = require.cache[resolvedFile];
  delete require.cache[resolvedFile];

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const modified = require(resolvedFile);

  require.cache[resolvedFile] = temp;

  return modified;
}
