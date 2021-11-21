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

import type { AkairoClient } from "discord-akairo";
import BotDB from "./models/Bot";
import BotStatsDB from "./models/BotStats";
import ServerDB from "./models/Server";
import ServerStatsDB from "./models/ServerStats";

export default async function statMigration(client: AkairoClient) {
  client.logger.info("Starting stat migration...");

  client.logger.info("Fetching bots...");
  const bots = await BotDB.find({ track: true });

  for await (const bot of bots) {
    client.logger.info(`Migrating stats for ${bot.id}...`);
    for await (const stat of bot.stats) BotStatsDB.create({ id: bot.id, ...stat });
    client.logger.info(`${bot.id} migration completed.`);
  }

  client.logger.info("Fetching servers...");
  const servers = await ServerDB.find({ track: true });

  for await (const server of servers) {
    client.logger.info(`Migrating stats for ${server.id}...`);
    for await (const stat of server.stats) ServerStatsDB.create({ id: server.id, ...stat });
    client.logger.info(`${server.id} migration completed.`);
  }

  client.logger.info("Stat migration completed.");
}
