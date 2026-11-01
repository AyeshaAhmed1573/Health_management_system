// Doctors who never configured their hours used to have an empty list, so every date showed
// "no slots". Until a doctor sets their own, offer Monday-Saturday 09:00-17:00 in 30-minute slots.
export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DEFAULT_SLOTS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => ({
  day, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30,
}));

export const effectiveSlots = (doctor) =>
  doctor?.availableSlots?.length ? doctor.availableSlots : DEFAULT_SLOTS;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Validates a doctor-submitted schedule. Returns { slots } or { error }. */
export function validateSlots(input) {
  if (!Array.isArray(input)) return { error: 'availableSlots must be an array' };
  const slots = [];
  for (const s of input) {
    if (!DAYS.includes(s?.day)) return { error: `Invalid day: ${s?.day}` };
    if (!HHMM.test(s.startTime) || !HHMM.test(s.endTime)) return { error: 'Times must look like 09:00' };
    if (s.startTime >= s.endTime) return { error: `${s.day}: end time must be after start time` };
    const dur = Number(s.slotDurationMinutes || 30);
    if (![10, 15, 20, 30, 45, 60].includes(dur)) return { error: 'Slot length must be 10, 15, 20, 30, 45 or 60 minutes' };
    slots.push({ day: s.day, startTime: s.startTime, endTime: s.endTime, slotDurationMinutes: dur });
  }
  return { slots };
}
