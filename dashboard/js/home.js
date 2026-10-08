/*
 * home.js — Home / Facility Overview screen.
 *
 * The "SUPER ADMIN DEMO" buttons switch between example states so the
 * colors, LEDs and messages can be demonstrated:
 *   Live      -> no live data yet (ESP32 not connected to the dashboard)
 *   GOOD      -> example NORMAL reading
 *   WARNING   -> example WARNING reading
 *   CRITICAL  -> example CRITICAL reading
 */

function setHomeStatus(choice) {
  const page = document.getElementById('home');
  const isLive = choice === 'LIVE';
  const status = isLive ? 'OFFLINE' : choice;

  // The status-* class sets the colors used by the badge, sensor pin and health bar.
  page.className = `main status-${status}`;

  document.querySelectorAll('#demo-toggle button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.status === choice);
  });

  const leds = { green: 'led-green', blue: 'led-blue', red: 'led-red' };
  Object.values(leds).forEach((id) => document.getElementById(id).classList.remove('on'));

  if (isLive) {
    document.getElementById('status-text').textContent = 'NO LIVE DATA';
    document.getElementById('banner-text').textContent =
      'Live telemetry is not connected yet — the ESP32 does not send readings to the dashboard yet.';
    document.getElementById('health-text').textContent = 'WAITING FOR SENSOR DATA';
    document.getElementById('sync-text').textContent = '— none yet';
    document.getElementById('gateway-text').textContent = 'ESP32 not connected';
    document.getElementById('buzzer-text').textContent = 'BUZZER';
    return;
  }

  const example = DEMO_STATES[status];
  const output = OUTPUTS[status];
  document.getElementById('status-text').textContent = status === 'NORMAL' ? 'GOOD' : status;
  document.getElementById('banner-text').textContent = example.banner;
  document.getElementById('health-text').textContent = example.health;
  document.getElementById('sync-text').textContent = EXAMPLE_SYNC_TIME;
  document.getElementById('gateway-text').textContent = 'ESP32 Online';
  document.getElementById('buzzer-text').textContent = output.buzzer.toUpperCase();
  document.getElementById(leds[output.led]).classList.add('on');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('demo-toggle').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button) setHomeStatus(button.dataset.status);
  });

  // Same starting state as the Figma design.
  setHomeStatus('WARNING');
});
