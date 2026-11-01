export const TZ = process.env.APP_TIMEZONE || 'Asia/Karachi';
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Weekday name + "HH:MM" of a Date as seen in the app timezone. */
export function localParts(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  const hh = get('hour') === '24' ? '00' : get('hour');
  return { day: get('weekday').toLowerCase(), time: `${hh}:${get('minute')}` };
}

export const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/** Pakistan has no DST; for other zones pass APP_TIMEZONE and offsets are resolved via Intl. */
export function zonedDateTime(dateStr, hhmm) {
  const guess = new Date(`${dateStr}T${hhmm}:00Z`);
  const asLocal = new Date(guess.toLocaleString('en-US', { timeZone: TZ }));
  const offset = asLocal.getTime() - guess.getTime();
  return new Date(guess.getTime() - offset);
}

export const weekdayOf = (dateStr) => DAYS[new Date(`${dateStr}T12:00:00Z`).getUTCDay()];
