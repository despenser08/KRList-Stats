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

import type { RawBotStatus } from "#lib/types";
import { getModelForClass, prop } from "@typegoose/typegoose";

class BotStats {
  @prop({ required: true })
  public id!: string;

  @prop({ required: true })
  public updated!: Date;

  @prop({ required: true })
  public votes!: number;

  @prop()
  public servers?: number;

  @prop({ required: true })
  public status!: RawBotStatus;
}

export default getModelForClass(BotStats);
