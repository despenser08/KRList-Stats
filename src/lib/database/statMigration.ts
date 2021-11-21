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

  const firstfourth = Math.floor(botStatCount / 5);
  const fifth = botStatCount - firstfourth * 4;

  client.logger.info("Fetching bots... (1)");
  const bots1 = await BotDB.find({ track: true }).limit(firstfourth).allowDiskUse(true);

  for await (const bot of bots1) {
    client.logger.info(`Migrating stats for ${bot.id}...`);
    for await (const stat of bot.stats)
      await BotStatsDB.create({ id: bot.id, updated: stat.updated, votes: stat.votes, servers: stat.servers, status: stat.status });
    client.logger.info(`${bot.id} migration completed.`);
  }

  client.logger.info("Fetching bots... (2)");
  const bots2 = await BotDB.find({ track: true }).limit(firstfourth).allowDiskUse(true).skip(firstfourth);

  for await (const bot of bots2) {
    client.logger.info(`Migrating stats for ${bot.id}...`);
    for await (const stat of bot.stats)
      await BotStatsDB.create({ id: bot.id, updated: stat.updated, votes: stat.votes, servers: stat.servers, status: stat.status });

    client.logger.info(`${bot.id} migration completed.`);
  }

  client.logger.info("Fetching bots... (3)");
  const bots3 = await BotDB.find({ track: true })
    .limit(firstfourth)
    .allowDiskUse(true)
    .skip(firstfourth * 2);

  for await (const bot of bots3) {
    client.logger.info(`Migrating stats for ${bot.id}...`);
    for await (const stat of bot.stats)
      await BotStatsDB.create({ id: bot.id, updated: stat.updated, votes: stat.votes, servers: stat.servers, status: stat.status });

    client.logger.info(`${bot.id} migration completed.`);
  }

  client.logger.info("Fetching bots... (4)");
  const bots4 = await BotDB.find({ track: true })
    .limit(fifth)
    .allowDiskUse(true)
    .skip(firstfourth * 3);

  for await (const bot of bots4) {
    client.logger.info(`Migrating stats for ${bot.id}...`);
    for await (const stat of bot.stats)
      await BotStatsDB.create({ id: bot.id, updated: stat.updated, votes: stat.votes, servers: stat.servers, status: stat.status });

    client.logger.info(`${bot.id} migration completed.`);
  }

  client.logger.info("Fetching bots... (5)");
  const bots5 = await BotDB.find({ track: true })
    .limit(firstfourth)
    .allowDiskUse(true)
    .skip(firstfourth * 4);

  for await (const bot of bots5) {
    client.logger.info(`Migrating stats for ${bot.id}...`);
    for await (const stat of bot.stats)
      await BotStatsDB.create({ id: bot.id, updated: stat.updated, votes: stat.votes, servers: stat.servers, status: stat.status });

    client.logger.info(`${bot.id} migration completed.`);
  }

  client.logger.info("Fetching servers...");
  const servers = await ServerDB.find({ track: true });

  for await (const server of servers) {
    client.logger.info(`Migrating stats for ${server.id}...`);
    for await (const stat of server.stats)
      await ServerStatsDB.create({ id: server.id, updated: stat.updated, votes: stat.votes, members: stat.members });
    client.logger.info(`${server.id} migration completed.`);
  }

  client.logger.info("Stat migration completed.");
}
