// Ram Lakhan Toy House — enquiry receiver.
// Paste into: Google Sheet → Extensions → Apps Script. See SETUP.md.

const OWNER_EMAIL = 'OWNER_EMAIL_HERE';

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.website) return json({ ok: true }); // honeypot: bots fill hidden field

  SpreadsheetApp.getActive().getSheetByName('Enquiries').appendRow([
    new Date(), d.type, d.product, d.variant || '', d.qty || '', d.name, "'" + d.mobile, d.area, d.note || '', d.season || '',
  ]);

  const text =
    `New ${d.type} enquiry\n` +
    `Product: ${d.product} ${d.variant || ''}\n` +
    `Qty: ${d.qty || '-'}\n` +
    `Season: ${d.season || '-'}\n` +
    `Name: ${d.name}\n` +
    `Mobile: ${d.mobile}\n` +
    `Area: ${d.area}\n` +
    `Note: ${d.note || '-'}`;

  if (OWNER_EMAIL.indexOf('@') > 0) {
    MailApp.sendEmail(OWNER_EMAIL, `New enquiry: ${d.product}`, text);
  }

  // Optional Telegram alert: set TELEGRAM_TOKEN and TELEGRAM_CHAT_ID in Script Properties.
  const p = PropertiesService.getScriptProperties();
  const token = p.getProperty('TELEGRAM_TOKEN');
  const chat = p.getProperty('TELEGRAM_CHAT_ID');
  if (token && chat) {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'post',
      payload: { chat_id: chat, text: text },
    });
  }

  return json({ ok: true });
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
