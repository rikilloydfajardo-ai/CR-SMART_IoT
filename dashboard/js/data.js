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
const OUTPUTS = {
  NORMAL:   { led: 'green', buzzer: 'Buzzer off' },
  WARNING:  { led: 'blue',  buzzer: 'Short buzzer alert' },
  CRITICAL: { led: 'red',   buzzer: 'Continuous buzzer alert' },
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

/* Turns an estimated ppm value into NORMAL, WARNING or CRITICAL. */
function statusFromPpm(ppm) {
  if (ppm >= THRESHOLDS.criticalPpm) return 'CRITICAL';
  if (ppm >= THRESHOLDS.warningPpm) return 'WARNING';
  return 'NORMAL';
}
