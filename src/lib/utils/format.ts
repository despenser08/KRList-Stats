import moment from "moment-timezone";
import { timezone as cTimezone } from "../../config";

export function formatTime({
  date = null,
  format = "YYYY/MM/DD hh:mm:ss A",
  timezone = cTimezone
} = {}) {
  return date
    ? moment(date).tz(timezone).format(format)
    : moment.tz(timezone).format(format);
}

export function formatNumber(value?: number) {
  if (!value && value !== 0) return "N/A";

  const suffixes = ["", "만", "억", "조", "해"];
  const suffixNum = Math.floor(("" + value).length / 4);
  let shortValue: string | number = parseFloat(
    (suffixNum != 0 ? value / Math.pow(10000, suffixNum) : value).toPrecision(2)
  );
  if (shortValue % 1 != 0) {
    shortValue = shortValue.toFixed(1);
  }
  if (suffixNum === 1 && shortValue < 1) return Number(shortValue) * 10 + "천";
  return shortValue + suffixes[suffixNum];
}

export function filterDesc(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/!\[(.*?)\][[(].*?[\])]/g, "")
    .replace(
      /^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm,
      "\n"
    )
    .replace(/(\r\n|\n|\r){2,}/g, "\n\n");
}
