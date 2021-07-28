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

import "@sapphire/plugin-logger/register";
import KRBSClient from "./lib/KRBSClient";

const client = new KRBSClient();

async function main() {
  try {
    client.logger.info("Logging in...");
    await client.login(process.env.DISCORD_TOKEN);
    client.logger.info(`Logged in as ${client.user?.tag} (${client.user?.id})`);
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
}

main();
