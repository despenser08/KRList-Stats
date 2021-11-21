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

  const botStatCount = await BotDB.countDocuments({ track: true });
  client.logger.info(`Found ${botStatCount} bots to migrate.`);

  const half = Math.floor(botStatCount / 2);
  const rest = botStatCount - half;

  client.logger.info("Fetching bots... (1)");
  const bots1 = await BotDB.find({ track: true }).limit(half).sort({ date: 1 });

  for await (const bot of bots1) {
    client.logger.info(`Migrating stats for ${bot.id}...`);
    for await (const stat of bot.stats) BotStatsDB.create({ id: bot.id, ...stat });
    client.logger.info(`${bot.id} migration completed.`);
  }

  client.logger.info("Fetching bots... (2)");
  const bots2 = await BotDB.find({ track: true }).limit(rest).sort({ date: -1 });

  for await (const bot of bots2) {
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
