/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      WEDDING RSVP — Google Apps Script (Web App)            ║
 * ║                                                              ║
 * ║  SETUP STEPS:                                                ║
 * ║  1. Open your Google Sheet.                                  ║
 * ║  2. Go to Extensions → Apps Script.                          ║
 * ║  3. Delete any existing code and paste THIS entire file.     ║
 * ║  4. Click "Deploy" → "New deployment".                       ║
 * ║  5. Type: Web App                                            ║
 * ║  6. Execute as: Me                                           ║
 * ║  7. Who has access: Anyone                                   ║
 * ║  8. Click Deploy → Authorize → Copy the Web App URL.         ║
 * ║  9. Paste that URL into index.html where it says             ║
 * ║     'YOUR_GOOGLE_APPS_SCRIPT_URL'.                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ── Column headers (auto-created on first RSVP) ───────────────────
const HEADERS = ['Timestamp', 'First Name', 'Last Name', 'Attendance'];

/**
 * Handles POST requests from the wedding site's RSVP form.
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const params = e.parameter;

    const row = [
      params.timestamp  || new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
      params.firstName  || '',
      params.lastName   || '',
      params.attendance || '',
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Returns the "RSVPs" sheet, creating it with headers if it doesn't exist.
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('RSVPs');

  if (!sheet) {
    sheet = ss.insertSheet('RSVPs');
    sheet.appendRow(HEADERS);

    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#1A2744');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Set column widths
    sheet.setColumnWidth(1, 200); // Timestamp
    sheet.setColumnWidth(2, 160); // First Name
    sheet.setColumnWidth(3, 160); // Last Name
    sheet.setColumnWidth(4, 200); // Attendance
  }

  return sheet;
}

/**
 * Optional: handles GET requests (health check / test).
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'RSVP endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
