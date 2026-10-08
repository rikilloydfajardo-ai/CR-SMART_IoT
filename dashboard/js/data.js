/*
 * data.js — EXAMPLE data used by the dashboard screens.
 *
 * The ESP32 is not connected to the dashboard yet, so every value here is an
 * illustrative example, not a real measurement. When the ESP32 starts sending
 * readings, these objects are what will be replaced by real data.
 */

// Alert thresholds for the estimated ammonia (NH3) level, in ppm.
// These are demo settings and still need calibration with the real MQ-137.
const THRESHOLDS = { warningPpm: 10, criticalPpm: 15 };

// What the on-site LEDs and buzzer do for each status.
// Matches the ESP32 firmware: NORMAL = green, MODERATE = blue, HIGH = red + beeping buzzer.
// (The dashboard calls the firmware's MODERATE level "WARNING" and HIGH "CRITICAL".)
const OUTPUTS = {
  NORMAL:   { led: 'green', buzzer: 'Buzzer off' },
  WARNING:  { led: 'blue',  buzzer: 'Buzzer off' },
  CRITICAL: { led: 'red',   buzzer: 'Beeping buzzer' },
};

// Example readings for each status (used by the Home demo toggle and AI Monitoring).
const DEMO_STATES = {
  NORMAL: {
    raw: 846, ppm: 4.8, risk: 24, riskLabel: 'LOW',
    banner: 'NORMAL — Ammonia (MQ-137 NH₃) within the safe range in CEIT Male Comfort Room',
    health: 'GOOD CONDITION',
  },
  WARNING: {
    raw: 1710, ppm: 11.6, risk: 58, riskLabel: 'MODERATE',
    banner: 'WARNING — Moderate odor buildup detected (MQ-137 NH₃) in CEIT Male Comfort Room',
    health: 'MODERATE ATTENTION',
  },
  CRITICAL: {
    raw: 2630, ppm: 17.9, risk: 86, riskLabel: 'HIGH',
    banner: 'CRITICAL — Strong ammonia odor (MQ-137 NH₃). Immediate cleaning required',
    health: 'IMMEDIATE CLEANING REQUIRED',
  },
};

const EXAMPLE_SYNC_TIME = 'Oct 08, 2026 02:35 PM';

// Example odor history for the AI Monitoring chart: one value every 5 minutes,
// from 1:35 PM to 2:35 PM. "minute" counts minutes after 1:00 PM.
const EXAMPLE_HISTORY = [
  { minute: 35, ppm: 4.6 }, { minute: 40, ppm: 4.9 }, { minute: 45, ppm: 4.4 },
  { minute: 50, ppm: 5.1 }, { minute: 55, ppm: 5.3 }, { minute: 60, ppm: 4.8 },
  { minute: 65, ppm: 5.0 }, { minute: 70, ppm: 5.5 }, { minute: 75, ppm: 5.2 },
  { minute: 80, ppm: 5.8 }, { minute: 85, ppm: 5.4 }, { minute: 90, ppm: 4.9 },
  { minute: 95, ppm: 4.8 },
];

// Example forecasts for each horizon (minutes ahead of the last reading).
const EXAMPLE_FORECASTS = {
  15: { mlr: 5.6, lstm: 5.9 },
  30: { mlr: 6.4, lstm: 7.1 },
  60: { mlr: 7.8, lstm: 9.2 },
};

// Example alert history shown in the Alerts Timeline.
const EXAMPLE_ALERTS = [
  { time: '01:05 PM', status: 'NORMAL', title: 'Normal conditions restored', detail: 'Green LED · buzzer off' },
  { time: '12:48 PM', status: 'WARNING', title: 'Warning threshold crossed', detail: 'Blue LED · buzzer off' },
  { time: '12:20 PM', status: 'CRITICAL', title: 'Critical odor alert resolved', detail: 'Red LED · beeping buzzer stopped' },
];

/* Formats "minutes after 1:00 PM" as a clock time, e.g. 95 -> "02:35 PM". */
function minuteToClock(minute) {
  const total = 13 * 60 + minute;
  let hours = Math.floor(total / 60) % 24;
  const mins = total % 60;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${suffix}`;
}

/* Turns an estimated ppm value into NORMAL, WARNING or CRITICAL. */
function statusFromPpm(ppm) {
  if (ppm >= THRESHOLDS.criticalPpm) return 'CRITICAL';
  if (ppm >= THRESHOLDS.warningPpm) return 'WARNING';
  return 'NORMAL';
}
