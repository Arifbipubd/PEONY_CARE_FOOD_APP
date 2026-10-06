const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const DAY_NAME_TO_INT: Record<string, number> = {
  mon: 0, monday: 0,
  tue: 1, tues: 1, tuesday: 1,
  wed: 2, wednesday: 2,
  thu: 3, thur: 3, thurs: 3, thursday: 3,
  fri: 4, friday: 4,
  sat: 5, saturday: 5,
  sun: 6, sunday: 6,
};

/** JSON string the API accepts for multipart, e.g. "[0,2,4]". Mon=0 … Sun=6. */
export function serializeRecurrenceDays(days: number[]): string {
  return JSON.stringify(days);
}

/** Normalise API custom-days (ints, "0", "Mon", "[0,2,4]", "0,2,4") to Mon=0 … Sun=6. */
export function parseRecurrenceDays(raw: unknown): number[] {
  if (raw == null) return [];
  let items: unknown[] = [];
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        items = JSON.parse(trimmed) as unknown[];
      } catch {
        items = trimmed.split(',');
      }
    } else {
      items = trimmed.split(',');
    }
  } else if (Array.isArray(raw)) {
    items = raw;
  } else {
    return [];
  }

  const days: number[] = [];
  for (const item of items) {
    if (typeof item === 'number' && Number.isInteger(item) && item >= 0 && item <= 6) {
      days.push(item);
      continue;
    }
    if (typeof item === 'string') {
      const token = item.trim();
      const asNum = Number(token);
      if (Number.isInteger(asNum) && asNum >= 0 && asNum <= 6) {
        days.push(asNum);
        continue;
      }
      const mapped = DAY_NAME_TO_INT[token.toLowerCase()];
      if (mapped != null) days.push(mapped);
    }
  }
  return [...new Set(days)].sort((a, b) => a - b);
}

/** Local wall-clock ISO with device offset, e.g. 2026-08-15T19:08:00.000+06:00. */
export function toLocalOffsetIso(d: Date): string {
  const pad = (n: number, len = 2) => String(Math.abs(n)).padStart(len, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  const ms = pad(d.getMilliseconds(), 3);
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const oh = pad(Math.floor(Math.abs(offsetMin) / 60));
  const om = pad(Math.abs(offsetMin) % 60);
  return `${y}-${m}-${day}T${h}:${min}:${s}.${ms}${sign}${oh}:${om}`;
}

/**
 * Available from now until the end of today.
 * The API still requires pickup_start / pickup_end even though the restaurant
 * no longer picks a time window.
 */
export function buildTodayPickupRange(now = new Date()): { start: string; end: string } {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const start = now < end ? now : new Date(end.getTime() - 60 * 1000);
  return { start: toLocalOffsetIso(start), end: toLocalOffsetIso(end) };
}

export function formatAvailabilityLabel(
  recurrenceType?: string | null,
  recurrenceDays?: number[] | null,
): string {
  if (recurrenceType === 'DAILY') return 'Every day';
  if ((recurrenceType === 'CUSTOM' || recurrenceType === 'WEEKLY') && recurrenceDays?.length) {
    return recurrenceDays
      .map((d) => DAY_LABELS[d] ?? '')
      .filter(Boolean)
      .join(', ');
  }
  return 'Today';
}

/** Recurrence first; never show a clock range. */
export function displayAvailability(opts: {
  recurrenceType?: string | null;
  recurrenceDays?: number[] | null;
  pickupWindow?: string | null;
}): string {
  if (opts.recurrenceType && opts.recurrenceType !== 'NONE') {
    return formatAvailabilityLabel(opts.recurrenceType, opts.recurrenceDays);
  }
  if (/^daily$/i.test(opts.pickupWindow?.trim() ?? '')) return 'Every day';
  return 'Today';
}
