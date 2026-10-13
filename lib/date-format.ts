import { format, isValid, parseISO } from "date-fns";

function parseDate(value: string) {
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

export function formatAdminDate(value: string) {
  const date = parseDate(value);
  return date ? format(date, "dd-MMM-yy") : value;
}

export function formatAdminDateTime(value: string) {
  const date = parseDate(value);
  if (!date) return value;

  const formattedDate = format(date, "dd-MMM-yy");
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate}, ${formattedTime}`;
}
