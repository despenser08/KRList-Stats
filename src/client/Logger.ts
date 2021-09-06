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

import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export default function Logger(label: string) {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.label({ label }),
      winston.format.timestamp({ format: "YYYY/MM/DD hh:mm:ss A" }),
      winston.format.printf((info): string => {
        const { message, level, label, timestamp } = info;

        return `[${timestamp}] [${label} | ${level.toUpperCase()}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.colorize({ all: true }),
        level: "debug"
      }),
      new DailyRotateFile({
        filename: path.join(__dirname, "..", "..", "logs", "KRLS-%DATE%.log"),
        level: "debug"
      })
    ]
  });
}
