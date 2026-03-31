# Travel Packing Helper

This page is now a frontend-only checklist app backed by explicit JSON data.

Stack:

- Alpine.js from CDN
- plain browser JavaScript
- static HTML and CSS
- `data.json` as the source of truth

What it does:

- loads predefined packing items and travel actions from `data.json`
- groups items by category and actions by stage
- lets you tick entries directly in the browser
- supports search and quick filtering
- stores progress in local browser storage
- copies checked entries to the clipboard

Files:

- `index.html`: checklist app page
- `styles.css`: standalone styling
- `app.js`: Alpine data model, fetch logic, and persistence
- `data.json`: predefined items and actions

