# Dashboard

Web dashboard for CR-SMART, implemented from the approved Figma design.
Plain HTML, CSS and JavaScript: no installation and no internet connection needed.

## How to open

Double-click `dashboard/login.html` (or `index.html`) to open it in a browser.

## Screens

| Screen | File | Status |
|---|---|---|
| Login | `login.html` | Implemented |
| Home / Facility Overview | `index.html` | Implemented |
| AI Monitoring | `ai-monitoring.html` | Implemented |

## Folder structure

```
dashboard/
├── login.html
├── index.html           # Home / Facility Overview
├── ai-monitoring.html   # MQ-137 telemetry, forecasts, chart, model table
├── css/style.css        # Colors, fonts and layout from the Figma design
├── js/layout.js         # Shared title bar, header, sidebar menu and footer
├── js/data.js           # EXAMPLE readings, thresholds and LED/buzzer rules
├── js/home.js           # Home screen demo status toggle
├── js/ai-monitoring.js  # AI Monitoring cards, forecast tabs and SVG chart
├── assets/logo.png      # CSUCC seal
└── vendor/              # Local copies of the fonts and Font Awesome icons
```

## Notes

- **Login is a prototype.** It checks that both fields are filled in and then opens the dashboard. There is no real account check yet.
- **All sensor values are examples.** The ESP32 is not connected to the dashboard yet. The example values live in `js/data.js`.
- The **SUPER ADMIN DEMO** buttons on Home switch between example states (GOOD, WARNING, CRITICAL). **Live** shows that no live data is connected yet.
- **AI models are not trained yet.** The forecast values are examples, and the model evaluation table shows "Not trained yet" until there are real MQ-137 readings to train on.
- Menu items that are not built yet show a "planned, not yet implemented" message.
