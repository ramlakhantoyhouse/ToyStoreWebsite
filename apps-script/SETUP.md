# Enquiry setup (Google Sheet + alerts)

The website saves every enquiry into a Google Sheet and emails the owner. This takes about 10 minutes, once.

## 1. Create the Sheet

1. Open [sheets.new](https://sheets.new) with the shop's Google account.
2. Rename the bottom tab from `Sheet1` to **`Enquiries`** (exact spelling).
3. In row 1, type these headers:
   `Time | Type | Product | Variant | Qty | Name | Mobile | Area | Note | Season`

## 2. Add the script

1. In the Sheet: **Extensions → Apps Script**.
2. Delete what's there and paste the whole of [Code.gs](Code.gs).
3. On line 4, replace `OWNER_EMAIL_HERE` with the email that should get alerts.
4. Click **Save**.

## 3. Deploy

1. **Deploy → New deployment** → type **Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Click **Deploy** and allow the permissions Google asks for.
4. Copy the **Web app URL** (ends in `/exec`).

## 4. Connect the website

1. In the project folder, copy `.env.example` to `.env`.
2. Paste the URL: `VITE_ENQUIRY_URL=https://script.google.com/macros/s/.../exec`
3. On Vercel/Netlify, add the same variable under Environment Variables, then redeploy.

Test: send an enquiry from the site. A new row should appear in the Sheet and an email should arrive.

## Optional: Telegram alert (instant phone notification)

1. In Telegram, message **@BotFather** → `/newbot` → copy the token.
2. Send any message to your new bot, then open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `chat.id`.
3. In Apps Script: **Project Settings → Script Properties** → add
   `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID`.

## If you change Code.gs later

Use **Deploy → Manage deployments → Edit → New version**. That keeps the same URL.
