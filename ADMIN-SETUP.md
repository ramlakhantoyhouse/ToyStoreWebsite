# Control centre setup (for the helper / developer)

This guide sets up the owner-only **Control Centre** at `/admin` for Ram Lakhan Toy House.
It takes about 20 minutes. Everything used here is free.

> हिंदी: यह गाइड दुकान के मददगार (helper) के लिए है। दुकानदार के लिए अलग गाइड है: [OWNER-GUIDE.md](OWNER-GUIDE.md)।

What you get:

- The owner logs in at `<site>/admin` and manages products, photos, categories, seasons, shop timings, banner, "Shop closed today" and enquiries from a phone.
- Products, settings and enquiries are stored in **Supabase** (free database + login + photo storage).
- Customers never log in. They only browse and send enquiries.

---

## 0. Demo mode (no setup needed)

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are **not** set, the site runs in **demo mode**:

- The website shows the bundled starter catalogue from `src/data/products.ts`.
- `/admin` still works, but every change is saved **only in that browser** (localStorage). Nobody else sees it.
- Demo login: **demo@ramlakhan.shop** / **demo1234** (the login screen also has a "Fill demo login" button).

Use demo mode to try the control centre or show it to the owner. For the real shop, do the steps below.

> हिंदी: बिना Supabase के भी /admin खुलता है, पर बदलाव सिर्फ़ उसी ब्राउज़र में रहते हैं। असली दुकान के लिए नीचे के स्टेप करें।

---

## 1. Create a free Supabase project

1. Go to <https://supabase.com> and sign up (a Google account is fine).
2. **New project** → name it `ram-lakhan-toy-house`, pick a strong database password (save it somewhere safe), region **Mumbai (ap-south-1)**.
3. Wait 1–2 minutes until the project is ready.

> हिंदी: supabase.com पर मुफ़्त अकाउंट बनाएं → New project → region Mumbai चुनें।

## 2. Copy the keys into `.env`

1. In Supabase: **Project Settings → API** (also shown under **Connect**).
2. Copy **Project URL** and the **anon public** key. Do **not** use the `service_role` key anywhere in this project.
3. In the project folder, copy `.env.example` to `.env` and fill it:

```bash
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

4. Restart `npm run dev` after editing `.env`.

> हिंदी: Project Settings → API से Project URL और anon public key कॉपी करके `.env` में डालें।

## 3. Create the database tables

1. In Supabase: **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this project, copy **all** of it, paste, press **Run**.
3. You should see "Success. No rows returned". It is safe to run again later.

This creates the `products`, `categories`, `seasons`, `settings`, `enquiries` and `admins` tables, the security rules (public can read the catalogue and send enquiries; only admins can change things or read enquiries), and the public `product-photos` storage bucket.

> हिंदी: SQL Editor में `supabase/schema.sql` पूरा पेस्ट करके Run दबाएं।

## 4. Lock down sign-ups

1. **Authentication → Providers (Sign In / Providers)**: keep **Email** turned **on**.
2. Turn **off** **"Allow new users to sign up"**.

Only the users you add by hand can log in. Even if someone else got an account, they could not change anything unless they are in the `admins` table.

> हिंदी: "Allow new users to sign up" बंद करें, ताकि कोई और अकाउंट न बना सके।

## 5. Create the owner's login

1. **Authentication → Users → Add user → Create new user**.
2. Enter the owner's email and a password (at least 8 characters). Tick **Auto Confirm User**.
3. Go back to **SQL Editor** and run this line with that same email:

```sql
insert into public.admins (user_id) select id from auth.users where email = 'OWNER_EMAIL_HERE' on conflict do nothing;
```

4. Check: **Table Editor → admins** should now have one row.

Give the email and password to the owner on paper or in person. Repeat step 5 for any other person who should have access (for example, you as helper).

> हिंदी: Users → Add user से मालिक का ईमेल-पासवर्ड बनाएं, फिर ऊपर वाली `insert into public.admins` लाइन चलाएं। इसके बिना लॉग इन होकर भी कुछ बदल नहीं पाएंगे।

## 6. Set the site URL (for "Forgot password?")

1. **Authentication → URL Configuration**.
2. **Site URL**: the live site, for example `https://ramlakhantoyhouse.vercel.app`.
3. **Redirect URLs**: add `https://ramlakhantoyhouse.vercel.app/admin/reset` (and `http://localhost:5173/admin/reset` for testing).

Without this, the password reset email link will not open the "Set a new password" screen.

> हिंदी: Site URL में लाइव वेबसाइट डालें और Redirect URLs में `<site>/admin/reset` जोड़ें।

## 7. Deploy on Vercel

1. Push the project to GitHub, then on <https://vercel.com> **Add New → Project** → import the repo.
2. Framework: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. **Environment Variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as `.env`) for Production and Preview.
4. **Deploy**. SPA rewrites (so `/admin` and product pages open directly) are already in `vercel.json`.

If you change env vars later, press **Redeploy**: Vite bakes them in at build time.

> हिंदी: Vercel में दोनों env vars डालें, फिर Deploy करें। env बदलने पर Redeploy ज़रूरी है।

## 8. First login and starter catalogue

1. Open `<site>/admin` and log in with the owner's email and password.
2. On the dashboard (Home), press **Import starter catalogue**. This copies the bundled products, categories, seasons and shop settings into Supabase.
3. Open the website in another tab. It now reads everything from Supabase.

Do this only once. After that, all changes are made in the control centre.

> हिंदी: पहली बार लॉग इन करके Home पर **Import starter catalogue** दबाएं। यह सिर्फ़ एक बार करना है।

## 9. Hand over to the owner

- Open `<site>/admin` on the owner's phone, log in once, and add it to the home screen (see [OWNER-GUIDE.md](OWNER-GUIDE.md)).
- Walk through: add a product with a camera photo, mark one out of stock, answer one test enquiry.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Can't log in** ("Invalid login credentials") | Check the user exists in **Authentication → Users** and is confirmed. Reset the password there if needed. |
| **Logs in but can't save / "not allowed"** | The user is missing from the `admins` table. Run the `insert into public.admins …` line from step 5 with the exact email. |
| **Photos fail to upload** | Check **Storage** has a public bucket named `product-photos` and the "photos admin …" policies exist. Re-run `supabase/schema.sql` (it is safe). Photos are compressed to WebP in the browser before upload; max 5 MB. |
| **Changes not showing on the website** | Hard refresh the page (pull down to refresh on phone, Ctrl+Shift+R on computer). Check the live site has the env vars and was redeployed after adding them. |
| **Website shows demo data / admin says "Demo mode"** | `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing in that environment. Add them and redeploy. |
| **Reset-password email link opens the home page** | Add `<site>/admin/reset` to Redirect URLs (step 6). |
| **Enquiries not appearing** | Make sure `schema.sql` ran fully (the `enquiries` table and the "anyone can enquire" policy). The customer also gets WhatsApp opened, so no enquiry is lost meanwhile. |
| **Supabase project paused** | Free projects pause after about a week with no visits. Open the Supabase dashboard and press **Restore**. Regular site traffic keeps it awake. |

## Note: Google Apps Script is no longer used

Enquiries used to go to a Google Sheet through Apps Script (`VITE_ENQUIRY_URL`). They are now saved in Supabase and shown in the control centre under **Enquiries**. The `apps-script/` folder can be ignored and `VITE_ENQUIRY_URL` is not needed.
