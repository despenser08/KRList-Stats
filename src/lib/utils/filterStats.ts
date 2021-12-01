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

import QuarterDB from "#lib/database/models/Quarter";
import moment from "moment-timezone";

export default async function filterStats(
  id: string,
  statCount: number,
  limit: "all" | "quarter" | number | Date,
  endOfDateOrQuarter?: Date | number
) {
  const query: { id: string; updated?: { $gte?: Date; $lte?: Date; $lt?: Date } } = { id };

  let skip = 0;

  const quarters = await QuarterDB.find().sort({ start: -1 });
  let currentQuarter = quarters[0];

  if (limit instanceof Date) {
    const date = moment(limit).startOf("day");
    const nextDate = endOfDateOrQuarter && endOfDateOrQuarter instanceof Date ? moment(endOfDateOrQuarter).endOf("day") : moment(limit).endOf("day");
    query.updated = { $gte: date.toDate(), $lte: nextDate.toDate() };
  } else if (typeof limit === "number" && Number.isInteger(limit) && statCount > limit) skip = statCount - limit;
  else if (limit === "quarter") {
    if (quarters.length < 1 || !currentQuarter) throw new Error("No quarters found");

    currentQuarter = typeof endOfDateOrQuarter === "number" ? (await QuarterDB.findOne({ quarter: endOfDateOrQuarter })) ?? quarters[0] : quarters[0];

    const nextQuarter = await QuarterDB.findOne({ quarter: currentQuarter.quarter + 1 });
    if (nextQuarter) query.updated = { $gte: currentQuarter.start, $lt: nextQuarter.start };
    else query.updated = { $gte: currentQuarter.start };
  }

  return { query, skip, quarter: currentQuarter.quarter };
}
