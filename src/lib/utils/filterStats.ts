import moment from "moment-timezone";

export default function filterStats(id: string, statCount: number, limit: "all" | number | Date, endOfDate?: Date) {
  const query: { id: string; updated?: { $gte: Date; $lte: Date } } = { id };

  let skip = 0;

  if (limit instanceof Date) {
    const date = moment(limit).startOf("day");
    const nextDate = endOfDate ? moment(endOfDate).endOf("day") : moment(limit).endOf("day");
    query.updated = { $gte: date.toDate(), $lte: nextDate.toDate() };
  } else if (typeof limit === "number" && Number.isInteger(limit) && statCount > limit) skip = statCount - limit;

  return { query, skip };
}
