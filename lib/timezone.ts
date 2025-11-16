const dtfCache = new Map<string, Intl.DateTimeFormat>();

const getFormatter = (timeZone: string) => {
  if (!dtfCache.has(timeZone)) {
    dtfCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  }
  return dtfCache.get(timeZone)!;
};

export interface DatePartInput {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

const pad = (value: number) => value.toString().padStart(2, '0');

export const getTimeZoneParts = (date: Date, timeZone: string) => {
  const parts = getFormatter(timeZone).formatToParts(date);
  const mapped: Record<string, number> = {};
  for (const part of parts) {
    if (
      part.type === 'year' ||
      part.type === 'month' ||
      part.type === 'day' ||
      part.type === 'hour' ||
      part.type === 'minute' ||
      part.type === 'second'
    ) {
      mapped[part.type] = Number(part.value);
    }
  }
  return mapped as {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
};

export const makeZonedDate = (input: DatePartInput, timeZone: string): Date => {
  const { year, month, day } = input;
  const hour = input.hour ?? 0;
  const minute = input.minute ?? 0;
  const second = input.second ?? 0;

  const initial = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const actual = getTimeZoneParts(initial, timeZone);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const actualUtc = Date.UTC(
    actual.year,
    actual.month - 1,
    actual.day,
    actual.hour,
    actual.minute,
    actual.second
  );
  const diff = actualUtc - desiredUtc;
  if (diff === 0) {
    return initial;
  }
  return new Date(initial.getTime() - diff);
};

export const extractDateParts = (date: Date) => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
});

export const formatDateInTimeZone = (date: Date, timeZone: string) => {
  const parts = getTimeZoneParts(date, timeZone);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
};

export const formatTimeInTimeZone = (date: Date, timeZone: string) => {
  const parts = getTimeZoneParts(date, timeZone);
  return `${pad(parts.hour)}:${pad(parts.minute)}`;
};
