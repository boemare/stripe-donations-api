# Stripe Donations Progress Bar for Framer

A serverless API + Framer component to display live donation progress on your website.

## Setup

### 1. Deploy the API to Vercel

**Option A: Deploy via Vercel CLI**
```bash
cd stripe-donations-api
npm install -g vercel
vercel login
vercel
```

**Option B: Deploy via GitHub**
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Vercel auto-detects the API structure

### 2. Configure Environment Variables

In your Vercel project dashboard, add:

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (starts with `sk_live_` or `sk_test_`) |
| `STRIPE_PAYMENT_LINK_ID` | (Optional) Filter to specific payment link |

**To find your Stripe keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your Secret key

### 3. Update Goal Values

Edit `api/donations.js` and update these lines with your targets:
```javascript
const GOAL_AMOUNT = 10000;  // Your dollar goal
const GOAL_DONORS = 100;    // Your donor count goal
```

Re-deploy after changes: `vercel --prod`

### 4. Add Component to Framer

1. Open your Framer project
2. Go to **Assets** panel → **Code** tab → **New file**
3. Copy the contents of `framer/DonationProgress.tsx`
4. Paste into Framer and save
5. Drag the component onto your canvas
6. In the right panel, set **API URL** to your Vercel URL:
   `https://your-project.vercel.app/api/donations`

### 5. Customize in Framer

The component has these controls in Framer's right panel:
- **API URL** - Your deployed API endpoint
- **Show Amount** - Toggle amount progress bar
- **Show Donors** - Toggle donor count bar
- **Amount Bar Color** - Progress bar color for amount
- **Donor Bar Color** - Progress bar color for donors
- **Background** - Track background color
- **Text Color** - Label text color
- **Bar Height** - Height in pixels
- **Roundness** - Border radius
- **Refresh (sec)** - Auto-refresh interval (0 = disabled)

## Testing

**Test the API:**
```bash
curl https://your-project.vercel.app/api/donations
```

Expected response:
```json
{
  "donorCount": 47,
  "totalAmount": 4250,
  "goalDonors": 100,
  "goalAmount": 10000,
  "amountPercent": 42.5,
  "donorPercent": 47,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

## Security

- The API runs server-side, keeping your Stripe keys secure
- For production, update CORS in `api/donations.js`:
  ```javascript
  res.setHeader('Access-Control-Allow-Origin', 'https://your-framer-site.framer.app');
  ```

## Filtering by Payment Link

If you only want to count donations from a specific Stripe Payment Link:

1. Get your Payment Link ID from Stripe Dashboard
2. Add it as `STRIPE_PAYMENT_LINK_ID` environment variable in Vercel
