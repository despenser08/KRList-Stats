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

import { SpanStatus } from "@sentry/tracing";
import { Listener } from "discord-akairo";
import type { Message } from "discord.js";

export default class CommandFinishedListener extends Listener {
  constructor() {
    super("commandFinished", {
      emitter: "commandHandler",
      event: "commandFinished"
    });
  }

  public async exec(message: Message) {
    const transaction = this.client.transactions.get(message.id);
    if (transaction) {
      transaction.setStatus(SpanStatus.Ok);
      transaction.finish();
      this.client.transactions.delete(message.id);
    }
  }
}
