import moment from "moment-timezone";
import QuarterDB from "../database/models/Quarter";

export default async function filterStats(
  id: string,
  statCount: number,
  limit: "all" | "quarter" | number | Date,
  endOfDateOrQuarter?: Date | number
) {
  const query: { id: string; updated?: { $gte?: Date; $lte?: Date } } = { id };

  let skip = 0;

  let quarters = await QuarterDB.find({}, {}, { sort: { start: -1 } });
  let quarter = quarters[0];

  if (limit instanceof Date) {
    const date = moment(limit).startOf("day");
    const nextDate = endOfDateOrQuarter && endOfDateOrQuarter instanceof Date ? moment(endOfDateOrQuarter).endOf("day") : moment(limit).endOf("day");
    query.updated = { $gte: date.toDate(), $lte: nextDate.toDate() };
  } else if (typeof limit === "number" && Number.isInteger(limit) && statCount > limit) skip = statCount - limit;
  else if (limit === "quarter") {
    if (!quarters.length)
      quarters = [
        await QuarterDB.create({
          quarter: 1,
          start: new Date()
        })
      ];

    quarter = typeof endOfDateOrQuarter === "number" ? (await QuarterDB.findOne({ quarter: endOfDateOrQuarter })) ?? quarters[0] : quarters[0];

    const nextQuarter = await QuarterDB.findOne({ quarter: quarter.quarter + 1 });
    if (nextQuarter) query.updated = { $gte: nextQuarter.start, $lte: quarter.start };
    else query.updated = { $gte: quarter.start };
  }

  return { query, skip, quarter: quarter.quarter };
}
