# Biswas Cash On Delivery Funnel

A production-oriented Next.js funnel for the **Biswas 20-Item Mixed Dry Fruits — 1 kg jar**. It includes a responsive product landing page, checkout, thank-you page, Google Sheets order storage, a business notification email, and a customer confirmation email.

> Security: credentials previously pasted into chat must be considered exposed. Revoke the old Google service-account key and Gmail app password. Generate new values and add them only to `.env.local` or Vercel Environment Variables. Never commit them.

## 1. Recommended stack

- Next.js App Router and TypeScript for the complete frontend/backend project
- Tailwind CSS for responsive styling
- Zod for server-side order validation
- Google Sheets API with a service account for order storage
- Nodemailer with Gmail SMTP for HTML notifications
- Vercel for deployment

This is a same-origin Next.js application, so no separate backend or public CORS configuration is required. `FRONTEND_URL` adds an origin check to the order endpoint.

## 2. Order flow

1. The customer selects a quantity on the landing page.
2. `/checkout` reads that selection and shows the product details automatically.
3. The customer enters contact/location details and chooses Inside or Outside Valley.
4. The browser posts only the customer details, product ID, quantity, delivery zone and an idempotency key to `/api/order`.
5. The server validates the data and recalculates all prices from the server-side product catalog. Browser-supplied prices are never trusted.
6. The server generates a stable Order ID and appends the order to Google Sheets. A retry does not create a second spreadsheet row for the same checkout attempt.
7. After the row is saved, the server sends the business notification and customer confirmation emails.
8. A success response is returned only after all required steps succeed. The browser then saves a non-sensitive order summary in `sessionStorage` and redirects to `/thank-you`.

If any required integration fails, checkout remains on the page and shows an error. External services cannot be made fully transactional: if one email provider action succeeds and another fails, a retry can resend an email, but the spreadsheet idempotency check prevents a duplicate order row.

## 3. Checkout data and validation

The form collects full name, phone, email, exact location and delivery area. Product name, price and totals are read-only. The API validates all values again, limits quantity to 1–20, rejects invalid email/phone formats and includes a honeypot field for basic bot filtering.

Pricing is configured in `src/lib/product.ts`:

- Regular price: NPR 1,999
- Offer price: NPR 1,599 per 1 kg jar
- Inside Kathmandu Valley delivery: NPR 100
- Outside Kathmandu Valley delivery: NPR 200

## 4. Google Spreadsheet setup

1. Open Google Cloud Console and create a project, such as `Biswas Orders`.
2. Under **APIs & Services → Library**, enable **Google Sheets API**. Google Drive API is optional for this implementation but may be enabled if you use Drive automation later.
3. Under **IAM & Admin → Service Accounts**, create a service account.
4. Create a new JSON key for that account. Copy `client_email` and `private_key` into the corresponding environment variables. Do not save the JSON file in this project.
5. Create or open the Google Spreadsheet.
6. Create a tab named `Orders`, or set `GOOGLE_SHEET_TAB_NAME` to your chosen tab name.
7. Share the spreadsheet with the service account `client_email` as **Editor**.
8. Copy the value between `/d/` and `/edit` in the spreadsheet URL into `GOOGLE_SHEET_ID`.

On the first order, the API writes and formats these columns:

1. Order ID
2. Date & Time
3. Customer Name
4. Phone Number
5. Email Address
6. Exact Location
7. Product Name
8. Quantity
9. Price Per Piece
10. Delivery Zone
11. Delivery Fee
12. Total Price
13. Payment Method
14. Order Status
15. Notes

It freezes/styles the header, auto-resizes columns and applies an Order Status dropdown with: `New Order`, `Order Confirmed`, `Order Ongoing`, `Delivered`, and `Cancelled`.

To add filters manually, select the first row in Google Sheets and choose **Data → Create a filter**.

## 5. Gmail and customer email setup

The project uses Gmail SMTP through Nodemailer.

1. Enable 2-Step Verification on the Gmail account.
2. Open Google Account → Security → App passwords.
3. Create a new app password for this website.
4. Set `SMTP_USER` to the Gmail address and `SMTP_PASS` to the new 16-character app password.
5. Set `BUSINESS_EMAIL` to the inbox that receives order notifications.
6. Set `EMAIL_FROM` to a Gmail-compatible sender such as `Biswas <digitalbiznep@gmail.com>`.

The business email contains customer details, product details, delivery fee, total, payment method, status and a call-confirmation reminder. The customer receives a mobile-friendly confirmation with the Order ID and COD summary. Both use inline CSS for Gmail compatibility.

## 6. Environment variables

Copy `.env.example` to `.env.local` and supply new credentials:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

BUSINESS_EMAIL=digitalbiznep@gmail.com
EMAIL_FROM="Biswas <digitalbiznep@gmail.com>"
BRAND_NAME=Biswas

GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SHEET_TAB_NAME=Orders
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_NEW_KEY\n-----END PRIVATE KEY-----\n"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=digitalbiznep@gmail.com
SMTP_PASS=your_new_gmail_app_password

EMAIL_SERVICE_API_KEY=
```

`EMAIL_SERVICE_API_KEY` is reserved for a future Resend/Brevo/SendGrid adapter and is not used by the current SMTP implementation.

## 7. Local development and testing

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Test a successful order by confirming all four outcomes:

1. Checkout reports success and redirects to `/thank-you`.
2. A correctly formatted row appears in the `Orders` tab.
3. `digitalbiznep@gmail.com` receives the business order email.
4. The customer email address receives the confirmation email.

Also test missing fields, an invalid email, quantity boundaries, both delivery zones and temporarily invalid integration credentials. Failed submissions must not redirect.

Run production checks with:

```bash
pnpm typecheck
pnpm build
```

## 8. Deploying to Vercel

1. Push this project to a private Git repository.
2. Import the repository into Vercel.
3. Add every value from `.env.example` under **Project Settings → Environment Variables**. Use the production URL for `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL`.
4. Paste the Google private key as one environment value. Vercel supports multiline values; the code also converts literal `\n` sequences when necessary.
5. Deploy. Vercel will detect Next.js automatically.
6. Submit one real test order and verify the spreadsheet plus both inboxes before running ads.

## 9. Content notes before launch

- No reels section is rendered because no reel links were supplied.
- The review cards are explicitly marked as sample placeholders. Replace them with genuine, permission-approved customer reviews before launch; fictional testimonials should not be presented as real.
- Product ingredient details and wellness language should be checked against the final label. The page avoids medical-treatment claims and includes an allergy/dietary FAQ.
- The supplied images are converted to PNG and stored under `public/images`.
