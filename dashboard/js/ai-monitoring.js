/*
 * ai-monitoring.js — AI Monitoring screen.
 * Fills the cards, forecast tabs, chart and alerts using the EXAMPLE data in data.js.
 */

const current = DEMO_STATES.NORMAL;            // example "current" reading
const lastMinute = EXAMPLE_HISTORY[EXAMPLE_HISTORY.length - 1].minute;

const RISK_PILL = {
  NORMAL:   { text: 'LOW RISK',      cls: 'pill-green' },
  WARNING:  { text: 'MODERATE RISK', cls: 'pill-gold' },
  CRITICAL: { text: 'HIGH RISK',     cls: 'pill-red' },
};

function fillCurrentReading() {
  const status = statusFromPpm(current.ppm);
  const output = OUTPUTS[status];
  document.getElementById('sync-time').textContent = EXAMPLE_SYNC_TIME;
  document.getElementById('stat-raw').textContent = current.raw;
  document.getElementById('stat-ppm').textContent = `${current.ppm} ppm`;
  document.getElementById('stat-risk').textContent = `${current.risk}%`;
  document.getElementById('stat-risk-label').textContent = `${current.riskLabel} · Example risk`;
  document.getElementById('stat-status').textContent = status;
  document.getElementById('stat-outputs').textContent = `${output.led} LED · ${output.buzzer}`;
}

function showForecast(horizon) {
  const forecast = EXAMPLE_FORECASTS[horizon];
  const time = `${minuteToClock(lastMinute + horizon)} · +${horizon} MIN`;
  document.querySelectorAll('.forecast-time').forEach((el) => (el.textContent = time));

  [['mlr', forecast.mlr], ['lstm', forecast.lstm]].forEach(([model, ppm]) => {
    const risk = RISK_PILL[statusFromPpm(ppm)];
    document.getElementById(`${model}-value`).textContent = `${ppm} ppm`;
    const pill = document.getElementById(`${model}-risk`);
    pill.textContent = risk.text;
    pill.className = `pill ${risk.cls}`;
  });

  document.querySelectorAll('#horizon-tabs .tab').forEach((tab) => {
    tab.classList.toggle('active', Number(tab.dataset.horizon) === horizon);
  });

  drawChart(horizon);
}

/* Draws the history line, the two forecast lines and the threshold lines as SVG. */
function drawChart(horizon) {
  const svg = document.getElementById('odorChart');
  const W = 640, H = 190, left = 28, right = 20, top = 12, bottom = 26;
  const maxPpm = 18;
  const startMin = EXAMPLE_HISTORY[0].minute;
  const endMin = lastMinute + horizon;

  const x = (minute) => left + ((minute - startMin) / (endMin - startMin)) * (W - left - right);
  const y = (ppm) => top + (1 - ppm / maxPpm) * (H - top - bottom);

  let parts = '';

  // Grid lines and y-axis labels
  [5, 10, 15].forEach((v) => {
    parts += `<line x1="${left}" x2="${W - right}" y1="${y(v)}" y2="${y(v)}" stroke="#f1f5f9"/>`;
    parts += `<text x="${left - 6}" y="${y(v) + 3}" font-size="9" fill="#64748b" text-anchor="end">${v}</text>`;
  });

  // Threshold lines
  const thresholds = [
    { v: THRESHOLDS.criticalPpm, color: '#dc2626', label: `CRITICAL ${THRESHOLDS.criticalPpm}` },
    { v: THRESHOLDS.warningPpm, color: '#e69500', label: `WARNING ${THRESHOLDS.warningPpm}` },
  ];
  thresholds.forEach((t) => {
    parts += `<line x1="${left}" x2="${W - right}" y1="${y(t.v)}" y2="${y(t.v)}" stroke="${t.color}" stroke-width="1.2"/>`;
    parts += `<text x="${W - right}" y="${y(t.v) - 4}" font-size="9" fill="${t.color}" text-anchor="end" font-family="JetBrains Mono, monospace">${t.label}</text>`;
  });

  // Actual history (solid green)
  const points = EXAMPLE_HISTORY.map((p) => `${x(p.minute)},${y(p.ppm)}`).join(' ');
  parts += `<polyline points="${points}" fill="none" stroke="#059669" stroke-width="2.5" stroke-linejoin="round"/>`;

  // Forecasts (dashed), starting from the last actual reading
  const last = EXAMPLE_HISTORY[EXAMPLE_HISTORY.length - 1];
  const fc = EXAMPLE_FORECASTS[horizon];
  [['#e69500', fc.mlr], ['#2563eb', fc.lstm]].forEach(([color, ppm]) => {
    parts += `<line x1="${x(last.minute)}" y1="${y(last.ppm)}" x2="${x(endMin)}" y2="${y(ppm)}" stroke="${color}" stroke-width="2" stroke-dasharray="5 4"/>`;
    parts += `<circle cx="${x(endMin)}" cy="${y(ppm)}" r="3.5" fill="${color}"/>`;
  });

  // "Now" marker and x-axis time labels
  parts += `<line x1="${x(last.minute)}" x2="${x(last.minute)}" y1="${top}" y2="${H - bottom}" stroke="#cbd5e1" stroke-dasharray="2 3"/>`;
  const step = (endMin - startMin) / 4;
  for (let i = 0; i <= 4; i++) {
    const m = Math.round((startMin + step * i) / 5) * 5;  // round to 5-minute marks
    parts += `<text x="${x(m)}" y="${H - 8}" font-size="9" fill="#64748b" text-anchor="middle">${minuteToClock(m)}</text>`;
  }

  svg.innerHTML = parts;
}

function fillAlerts() {
  const colors = { NORMAL: 'var(--ok)', WARNING: 'var(--warn)', CRITICAL: 'var(--crit)' };
  document.getElementById('alerts').innerHTML = EXAMPLE_ALERTS.map((a) => `
    <li>
      <span class="dot" style="background:${colors[a.status]}"></span>
      <time>${a.time}</time>
      <div><strong>${a.title}</strong><small>${a.detail}</small></div>
    </li>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  fillCurrentReading();
  fillAlerts();
  showForecast(15);

  document.getElementById('horizon-tabs').addEventListener('click', (event) => {
    const tab = event.target.closest('.tab');
    if (tab) showForecast(Number(tab.dataset.horizon));
  });
});
