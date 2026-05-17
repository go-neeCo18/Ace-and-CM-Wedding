# 💍 Wedding Invitation Website — Setup Guide

## Files in this package

| File | Purpose |
|------|---------|
| `index.html` | The complete one-page wedding website |
| `google-apps-script.js` | Paste into Google Apps Script to enable RSVP → Sheets |
| `netlify.toml` | Netlify deployment configuration |

---

## Step 1 — Personalise the HTML

Open `index.html` and find & replace these placeholders:

| Placeholder | What to replace with |
|---|---|
| `Alex` / `Sam` | The couple's names |
| `Saturday · October 10, 2026` | Your wedding date |
| `4:00 PM` | Your ceremony time |
| Venue names & addresses | Your actual venues |
| The Google Maps `iframe src` URL | Your real embed URL (see below) |
| `September 1, 2026` (RSVP deadline) | Your deadline |

### Get a real Google Maps embed URL
1. Go to [maps.google.com](https://maps.google.com)
2. Search your venue name
3. Click **Share** → **Embed a map** → **Copy HTML**
4. Paste the full `src="..."` value into the `<iframe>` in `index.html`

---

## Step 2 — Connect Google Sheets (RSVP backend)

1. Open (or create) a new **Google Sheet** — this will store all RSVPs.
2. Click **Extensions → Apps Script**.
3. Delete any starter code, then paste the entire contents of `google-apps-script.js`.
4. Click **Deploy → New deployment**:
   - **Type**: Web App
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Click **Deploy**, authorise when prompted, then **copy the Web App URL**.
6. In `index.html`, find:
   ```js
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
   ```
   Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with the URL you just copied.

> **Note:** The form uses `mode: 'no-cors'`, which is the standard approach for Google Apps Script. It means you can't read the raw response, but the data is saved correctly in your sheet. Test it by submitting the form and checking the **RSVPs** tab in your Google Sheet.

---

## Step 3 — Deploy to Netlify

### Option A — Drag & Drop (easiest)
1. Go to [netlify.com](https://netlify.com) and log in.
2. Click **Add new site → Deploy manually**.
3. Drag the entire **`wedding-invitation`** folder onto the upload zone.
4. Done! Netlify gives you a free URL (e.g. `random-name.netlify.app`).
5. To use a custom domain: **Site settings → Domain management → Add custom domain**.

### Option B — GitHub (auto-deploys on every save)
1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import from Git → GitHub**.
3. Set **Publish directory** to the folder name (or `.` if it's the repo root).
4. Every `git push` automatically updates your live site.

---

## Customisation Tips

- **Names & date** — top of `<body>` in the Hero section
- **Colors** — edit the CSS variables at the top of `<style>`:
  ```css
  --navy:  #1A2744;
  --burg:  #6B1A2A;
  --gold:  #C9A96E;
  ```
- **Fonts** — swap the Google Fonts `<link>` in `<head>`
- **RSVP deadline** — search for "September 1, 2026" in the HTML

---

*Made with love for your special day. 💍*
