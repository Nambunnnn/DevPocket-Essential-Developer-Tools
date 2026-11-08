function assertUnit(unit) {
  if (unit !== 'seconds' && unit !== 'milliseconds') {
    throw new RangeError('Choose seconds or milliseconds.');
  }
}

function parseIsoDateTime(input) {
  const value = input.trim();
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/);
  if (!match) {
    throw new Error('Enter a date and time in ISO format, such as 2026-01-01T12:00.');
  }

  const [, year, month, day, hour, minute, second = '0', fraction = '', timezone = ''] = match;
  const calendar = new Date(0);
  calendar.setUTCFullYear(Number(year), Number(month), 0);
  if (
    Number(month) < 1
    || Number(month) > 12
    || Number(day) < 1
    || Number(day) > calendar.getUTCDate()
    || Number(hour) > 23
    || Number(minute) > 59
    || Number(second) > 59
  ) {
    throw new RangeError('Enter a valid date and time.');
  }

  const milliseconds = Number(fraction.padEnd(3, '0'));
  const date = timezone
    ? new Date(value)
    : new Date(0);
  if (!timezone) {
    date.setFullYear(Number(year), Number(month) - 1, Number(day));
    date.setHours(Number(hour), Number(minute), Number(second), milliseconds);
  }

  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Enter a valid date and time.');
  }

  if (!timezone && (
    date.getFullYear() !== Number(year)
    || date.getMonth() !== Number(month) - 1
    || date.getDate() !== Number(day)
    || date.getHours() !== Number(hour)
    || date.getMinutes() !== Number(minute)
    || date.getSeconds() !== Number(second)
    || date.getMilliseconds() !== milliseconds
  )) {
    throw new RangeError('Enter a valid date and time.');
  }

  return date.getTime();
}

export function timestampToIso(input, unit = 'seconds') {
  assertUnit(unit);
  const value = String(input).trim();
  if (!/^-?\d+$/.test(value)) {
    throw new Error('Enter a whole-number Unix timestamp.');
  }

  const timestamp = Number(value);
  if (!Number.isSafeInteger(timestamp)) {
    throw new RangeError('Timestamp is outside the supported range.');
  }

  const milliseconds = unit === 'seconds' ? timestamp * 1000 : timestamp;
  const date = new Date(milliseconds);
  if (!Number.isSafeInteger(milliseconds) || Number.isNaN(date.getTime())) {
    throw new RangeError('Timestamp is outside the supported date range.');
  }
  return date.toISOString();
}

export function isoToTimestamp(input, unit = 'seconds') {
  assertUnit(unit);
  const milliseconds = parseIsoDateTime(input);
  return unit === 'seconds'
    ? String(milliseconds / 1000)
    : String(milliseconds);
}
