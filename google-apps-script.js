/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      WEDDING RSVP — Google Apps Script (Web App)            ║
 * ║                                                              ║
 * ║  SHEET: "GuestList"  — columns in this exact order:         ║
 * ║  ┌──────────────────────────────────────────────────────┐   ║
 * ║  │ A: Guest Name                                        │   ║
 * ║  │ B: Seats Allocated  (number: 1, 2, 3 …)             │   ║
 * ║  │ C: RSVP Status      (leave blank — script writes it) │   ║
 * ║  │ D: Plus-One Name    (leave blank — script writes it) │   ║
 * ║  │ E: Responded At     (leave blank — script writes it) │   ║
 * ║  └──────────────────────────────────────────────────────┘   ║
 * ║                                                              ║
 * ║  SETUP STEPS:                                                ║
 * ║  1. Open your Google Sheet.                                  ║
 * ║  2. Rename/create a sheet called "GuestList" and add the     ║
 * ║     five column headers above in row 1.                      ║
 * ║  3. Fill in Guest Names (col A) and Seats Allocated (col B). ║
 * ║  4. Go to Extensions → Apps Script.                          ║
 * ║  5. Delete any existing code and paste THIS entire file.     ║
 * ║  6. Click "Deploy" → "New deployment".                       ║
 * ║  7. Type: Web App                                            ║
 * ║  8. Execute as: Me                                           ║
 * ║  9. Who has access: Anyone                                   ║
 * ║  10. Click Deploy → Authorize → Copy the Web App URL.        ║
 * ║  11. Paste that URL into index.html where it says            ║
 * ║      'YOUR_GOOGLE_APPS_SCRIPT_URL'.                          ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ── Sheet name ────────────────────────────────────────────────────
const GUEST_SHEET_NAME = "GuestList";

// ── Column indices in GuestList (1-based) ─────────────────────────
const COL_GUEST_NAME = 1; // A — Guest Name
const COL_SEATS = 2; // B — Seats Allocated
const COL_RSVP_STATUS = 3; // C — RSVP Status  (written by script)
const COL_PLUS_ONE = 4; // D — Plus-One Name (written by script, comma-separated)
const COL_RESPONDED = 5; // E — Responded At  (written by script)

// ─────────────────────────────────────────────────────────────────
// GET  — ?action=guestlist
//   Returns the guest list with seat count + submitted flag so the
//   frontend can show dynamic seat messages and block duplicates.
// ─────────────────────────────────────────────────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";

  if (action === "guestlist") {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(GUEST_SHEET_NAME);

      if (!sheet) {
        return jsonResponse({
          status: "error",
          message: "GuestList sheet not found.",
        });
      }

      const lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return jsonResponse({ status: "ok", guests: [] });
      }

      // Read cols A–C in one fast call (we only need name, seats, status)
      const data = sheet
        .getRange(2, 1, lastRow - 1, COL_RSVP_STATUS)
        .getValues();

      const guests = data
        .filter((row) => String(row[COL_GUEST_NAME - 1]).trim() !== "")
        .map((row) => ({
          name: String(row[COL_GUEST_NAME - 1]).trim(),
          seats: Number(row[COL_SEATS - 1]) || 1,
          submitted: !!row[COL_RSVP_STATUS - 1], // true = already RSVPed
        }));

      return jsonResponse({ status: "ok", guests });
    } catch (err) {
      return jsonResponse({ status: "error", message: err.message });
    }
  }

  // Health check
  return jsonResponse({ status: "ok", message: "RSVP endpoint is live." });
}

// ─────────────────────────────────────────────────────────────────
// POST  — action=rsvp
//   Validates, writes to GuestList in-place, no separate RSVP log.
// ─────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const params = e.parameter;

    if (params.action !== "rsvp") {
      return jsonResponse({ status: "error", message: "Unknown action." });
    }

    const guestName = (params.guestName || "").trim();
    const attendance = (params.attendance || "").trim();
    const plusOnes = (params.plusOnes || "").trim(); // comma-separated names
    const timestamp =
      params.timestamp ||
      new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });

    if (!guestName || !attendance) {
      return jsonResponse({
        status: "error",
        message: "Missing required fields.",
      });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const guestSheet = ss.getSheetByName(GUEST_SHEET_NAME);
    if (!guestSheet) {
      return jsonResponse({
        status: "error",
        message: "GuestList sheet not found.",
      });
    }

    // ── Find the guest row ───────────────────────────────────────
    const lastRow = guestSheet.getLastRow();
    const names = guestSheet
      .getRange(2, COL_GUEST_NAME, lastRow - 1, 1)
      .getValues();
    let guestRow = -1;

    for (let i = 0; i < names.length; i++) {
      if (
        String(names[i][0]).trim().toLowerCase() === guestName.toLowerCase()
      ) {
        guestRow = i + 2; // +2: header row + 0-based index
        break;
      }
    }

    if (guestRow === -1) {
      return jsonResponse({
        status: "error",
        message: "Guest not found in the list.",
      });
    }

    // ── Duplicate RSVP check ─────────────────────────────────────
    const alreadySubmitted = guestSheet
      .getRange(guestRow, COL_RSVP_STATUS)
      .getValue();
    if (alreadySubmitted) {
      return jsonResponse({
        status: "duplicate",
        message: "This guest has already submitted an RSVP.",
      });
    }

    // ── Write RSVP data back into the GuestList row ──────────────
    //   C: RSVP Status   → attendance value
    //   D: Plus-One Name → comma-separated names (or blank)
    //   E: Responded At  → timestamp
    guestSheet.getRange(guestRow, COL_RSVP_STATUS).setValue(attendance);
    guestSheet.getRange(guestRow, COL_PLUS_ONE).setValue(plusOnes);
    guestSheet.getRange(guestRow, COL_RESPONDED).setValue(timestamp);

    return jsonResponse({ status: "success" });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
