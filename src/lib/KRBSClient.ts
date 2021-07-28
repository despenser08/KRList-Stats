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

import { LogLevel, SapphireClient, Store } from "@sapphire/framework";
import Dokdo from "dokdo";
import { OWNERS, PREFIX } from "../config";

export default class KRBSClient extends SapphireClient {
  constructor() {
    super({
      defaultPrefix: PREFIX,
      caseInsensitiveCommands: true,
      logger: {
        level: LogLevel.Trace
      },
      shards: "auto"
    });

    Store.injectedContext.dokdo = new Dokdo(this, {
      prefix: PREFIX[0],
      owners: OWNERS,
      noPerm: (message) => message.channel.send("봇 관리자 전용 명령어입니다.")
    });
  }

  public get context() {
    return Store.injectedContext;
  }
}
