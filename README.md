# Reno Calc Web 0.4.8 — Editable source

Open **index.html** in Chrome or VS Code. All three files must stay in the same folder.

- `index.html` — HTML structure: `<head>`, `<body>`, `<header>`, forms, tables and buttons.
- `style.css` — page styling and print layout.
- `script.js` — estimates, calculations, project storage, backup, and profit calculator.

This is a source-code separation of the existing 0.4.8 application, not a new feature version. The original JavaScript was preserved. CSS was reformatted for readability.

**Important:** Local browser data may not appear if you change the file path or use Live Server. Preserve your existing backup JSON and previous working version. Contractor-only financial information is still included in project JSON exports; do not share those files with clients.

Test in Chrome: open projects, cost/profit calculator, PDF print preview, EN/FR selection, backup and restore.


Version 0.4.11: Multiple payments per invoice, with individual payment date, amount, payment method and optional reference. Add Payment records each transaction; Save Invoice persists it locally. Individual Payment Receipt uses the most recently recorded payment; Full Payment Statement lists all payments. Existing 0.4.10 invoices with a single paid amount are migrated in memory on open and saved in the new format when Save Invoice is clicked. Keep a backup of your previous files and browser data before upgrading.
