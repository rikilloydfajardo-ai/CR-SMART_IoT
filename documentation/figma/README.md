# Figma Design

Screenshots of the approved Figma design for the CR-SMART dashboard.

**Designed by:** Riki Lloyd Fajardo

Every screen uses the same layout: a dark-green sidebar menu on the left (Main Navigation, Governance, Account & Session) and the page content on a light background. The design follows the CSUCC colors (green and gold) and shows **one ESP32 with one MQ-137 ammonia (NH₃) sensor**, matching our hardware.

| Screen | Figma file | Implemented in |
|---|---|---|
| Login | `login page.png` | [`dashboard/login.html`](../../dashboard/login.html) |
| Home / Facility Overview | `Home Page.png` | [`dashboard/index.html`](../../dashboard/index.html) |
| AI Monitoring | `AI Monitoring.png` | [`dashboard/ai-monitoring.html`](../../dashboard/ai-monitoring.html) |
| Cleaning Dispatch | `Cleaning Dispatch.png` | [`dashboard/cleaning-dispatch.html`](../../dashboard/cleaning-dispatch.html) |

---

## 1. Login

![Login screen](login%20page.png)

The entry point of the system. The card is split in two:

- **Left panel:** CSUCC seal, "CSUCC Secure Access" badge, and a "Welcome Back" message explaining what users can do after signing in.
- **Right panel:** the sign-in form with **Username** and **Password** fields (required, marked with a red asterisk), a show/hide password icon, the **Sign In** button, and a link to register for an account.

---

## 2. Home / Facility Overview

![Home screen](Home%20Page.png)

The main dashboard after signing in. It gives a quick overview of the CEIT Male Comfort Room.

- **Welcome section:** greets the user by name and shows their role (Super Administrator Privileges). A note explains that the screen uses illustrative demo data.
- **Status chips:** Real-Time IoT (1 active sensor node), AI Predictive (MLR + LSTM), and Smart Dispatch (automated custodial).
- **CR-SMART Digital Twin:** a top-down floor plan of the restroom (3 toilet stalls, 3 urinals, exhaust fan, 2 sinks, entrance) showing where the **MQ-137 sensor** is placed. The sensor marker changes color with the odor status.
- **Warning banner and status badge:** for example, "WARNING — Moderate odor buildup detected (MQ-137 NH₃)".
- **Super Admin Demo toggle:** Live / GOOD / WARNING / CRITICAL buttons for demonstrating each status.
- **Status LEDs and buzzer indicator:** shows which LED (green, blue or red) and buzzer state matches the current status.
- **Mini cards:** Hardware Gateway (ESP32), AI Inference, and Facility Shield.
- **Overall Facility Health bar** with the last telemetry sync time.
- **Core System Capabilities:** single-node odor monitoring, predictive data analytics, and connected custodial care.

---

## 3. AI Monitoring

![AI Monitoring screen](AI%20Monitoring.png)

Shows the sensor readings and the AI predictions for the restroom.

- **Header:** location (CEIT Male Comfort Room), page title, a **Custodial Dispatch** shortcut button, system status, and last sync time.
- **Current Odor Telemetry:** four cards showing the MQ-137 raw analog (ADC) value, the estimated NH₃ level in ppm, the odor risk percentage, and the alert status with the matching LED and buzzer state.
- **Multi-Horizon Predictive Forecasts:** 15 / 30 / 60-minute tabs, with side-by-side forecasts from the **Multiple Linear Regression (MLR)** and **LSTM neural network** models.
- **Odor Level: History & Forecast chart:** actual readings (green line), forecast (dashed line), and the Warning and Critical threshold lines.
- **Alerts Timeline:** recent status changes, each with the LED and buzzer action.
- **AI Model Performance Evaluation:** table for MAE, RMSE, MAPE and R² of each model.

---

## 4. Cleaning Dispatch

![Cleaning Dispatch screen](Cleaning%20Dispatch.png)

Lets administrators send custodial staff to clean the restroom and follow up on each task.

- **Header:** "Smart Facility Cleaning Dispatch & Live Chat", the current room status, and a **Dispatch Cleaner Now** button.
- **Tabs and filters:** All Dispatches / My Assigned Tasks, and a status filter (All, Pending, In Progress, Completed).
- **Dispatch table:** task ID and time, location and reason, assigned cleaner, who dispatched it, urgency (Routine, Moderate, High), status, a live chat link, and a View Details button.
- **Info bar:** explains that urgency reflects the conditions when each task was created.
- **Custodial live chat** preview and the **CR-SMART cleaning assistant**, which suggests cleaning essentials.

---

## Differences between the Figma design and the implemented dashboard

The implemented screens follow the layout, colors and content of the Figma design. These parts were changed on purpose:

| Part | Figma design | Implemented dashboard | Reason |
|---|---|---|---|
| Title bar and header | Not included in these Figma frames | Added the system title strip and the top header (user, role, log-out) | Matches the layout of our full system |
| AI Model Performance table | Shows example MAE, RMSE, MAPE and R² values | Shows "—" and "Not trained yet" | The models have not been trained on real MQ-137 data yet, so we do not show accuracy results |
| "Live" demo button (Home) | Not specified | Shows "No live data" | The ESP32 is not yet connected to the dashboard |
| Example times (alerts and dispatches) | Example times | Adjusted example times | Keeps the alerts, chart and dispatch examples consistent with each other |

All values shown on the screens are **examples** until the ESP32 sends real readings.
