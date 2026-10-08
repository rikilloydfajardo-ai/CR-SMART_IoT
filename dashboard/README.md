# Dashboard

Web dashboard for CR-SMART, implemented from the approved Figma design.
Plain HTML, CSS and JavaScript: no installation and no internet connection needed.

## How to open

Double-click `dashboard/login.html` (or `index.html`) to open it in a browser.

## Screens

| Screen | File | Status |
|---|---|---|
| Login | `login.html` | Implemented |

## Folder structure

```
dashboard/
├── login.html
├── css/style.css        # Colors, fonts and layout from the Figma design
├── js/layout.js         # Shared title bar, header, sidebar menu and footer
├── assets/logo.png      # CSUCC seal
└── vendor/              # Local copies of the fonts and Font Awesome icons
```

## Notes

- **Login is a prototype.** It checks that both fields are filled in and then opens the dashboard. There is no real account check yet.
- Menu items that are not built yet show a "planned, not yet implemented" message.
