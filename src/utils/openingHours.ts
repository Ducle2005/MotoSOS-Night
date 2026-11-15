export interface OpeningHoursEvaluation {
  isOpen: boolean;
  hasExplicitHours: boolean;
  statusLabel: string;
}

const DAY_INDEX_MAP: Record<string, number> = {
  su: 0,
  mo: 1,
  tu: 2,
  we: 3,
  th: 4,
  fr: 5,
  sa: 6,
};

function parseMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 24 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function dayMatchesToken(dayToken: string, currentDay: number): boolean {
  const parts = dayToken.split(',').map((p) => p.trim().toLowerCase());
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = DAY_INDEX_MAP[startStr];
      const end = DAY_INDEX_MAP[endStr];
      if (start === undefined || end === undefined) continue;
      if (start <= end) {
        if (currentDay >= start && currentDay <= end) return true;
      } else if (currentDay >= start || currentDay <= end) {
        return true;
      }
    } else if (DAY_INDEX_MAP[part] === currentDay) {
      return true;
    }
  }
  return false;
}

function timeMatchesRanges(timeSpec: string, nowMinutes: number): boolean {
  const ranges = timeSpec.split(',').map((r) => r.trim());
  for (const range of ranges) {
    const [startRaw, endRaw] = range.split('-');
    if (!startRaw || !endRaw) continue;
    const start = parseMinutes(startRaw);
    const end = parseMinutes(endRaw);
    if (start === null || end === null) continue;
    if (end > start) {
      if (nowMinutes >= start && nowMinutes < end) return true;
    } else if (nowMinutes >= start || nowMinutes < end) {
      return true;
    }
  }
  return false;
}

export function evaluateOpeningHours(
  openingHoursRaw: string | null | undefined,
  now: Date = new Date(),
): OpeningHoursEvaluation {
  const cleaned = openingHoursRaw?.trim() ?? '';
  if (!cleaned) {
    return {
      isOpen: true,
      hasExplicitHours: false,
      statusLabel: 'Mở cửa • Gọi xác nhận trước',
    };
  }

  if (/^24\/7$/i.test(cleaned) || /00:00\s*-\s*24:00/.test(cleaned)) {
    return {
      isOpen: true,
      hasExplicitHours: true,
      statusLabel: 'Đang mở cửa',
    };
  }

  const currentDay = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const rules = cleaned
    .split(';')
    .map((r) => r.trim())
    .filter(Boolean);

  let matchedAnyParsableRule = false;
  let dayExplicitlyOff = false;

  for (const rule of rules) {
    const offMatch = /^([A-Za-z,-]+)\s+off$/i.exec(rule);
    if (offMatch) {
      matchedAnyParsableRule = true;
      if (dayMatchesToken(offMatch[1], currentDay)) {
        dayExplicitlyOff = true;
      }
      continue;
    }

    const withDaysMatch = /^([A-Za-z,\-\s]+?)\s+(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})*)$/.exec(
      rule,
    );
    if (withDaysMatch) {
      matchedAnyParsableRule = true;
      if (
        dayMatchesToken(withDaysMatch[1], currentDay) &&
        timeMatchesRanges(withDaysMatch[2], nowMinutes)
      ) {
        return {
          isOpen: true,
          hasExplicitHours: true,
          statusLabel: 'Đang mở cửa',
        };
      }
      continue;
    }

    const timeOnlyMatch = /^(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})*)$/.exec(
      rule,
    );
    if (timeOnlyMatch) {
      matchedAnyParsableRule = true;
      if (timeMatchesRanges(timeOnlyMatch[1], nowMinutes)) {
        return {
          isOpen: true,
          hasExplicitHours: true,
          statusLabel: 'Đang mở cửa',
        };
      }
    }
  }

  if (matchedAnyParsableRule || dayExplicitlyOff) {
    return {
      isOpen: false,
      hasExplicitHours: true,
      statusLabel: 'Đã đóng cửa',
    };
  }

  return {
    isOpen: true,
    hasExplicitHours: false,
    statusLabel: 'Mở cửa • Gọi xác nhận trước',
  };
}
