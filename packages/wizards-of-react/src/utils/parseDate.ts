import { parse, parseJSON } from "date-fns";

const DATE_ONLY_REGEX = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$");

export function parseDate(dateString: string | number | Date) {
  return typeof dateString === "string" && dateString.match(DATE_ONLY_REGEX)
    ? parse(dateString, "yyyy-MM-dd", new Date())
    : parseJSON(dateString);
}
