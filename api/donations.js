import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration - update these values for your campaign
const GOAL_AMOUNT = 10000;  // Target amount in dollars
const GOAL_DONORS = 100;    // Target number of donors

// Your payment link ID
const PAYMENT_LINK_ID = 'plink_1SnHEFLJl2M6c3KIE6CFTw8x';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use Checkout Sessions API - this has direct payment_link field
    let allSessions = [];
    let hasMore = true;
    let startingAfter = undefined;

    while (hasMore) {
      const params = {
        limit: 100,
        status: 'complete',  // Only completed checkouts
        ...(startingAfter && { starting_after: startingAfter }),
      };

      const sessions = await stripe.checkout.sessions.list(params);
      allSessions = allSessions.concat(sessions.data);
      hasMore = sessions.has_more;

      if (sessions.data.length > 0) {
        startingAfter = sessions.data[sessions.data.length - 1].id;
      }
    }

    // Filter to only sessions from our payment link
    const donationSessions = allSessions.filter(session =>
      session.payment_link === PAYMENT_LINK_ID
    );

    // Calculate totals
    const donorCount = donationSessions.length;
    const totalAmount = donationSessions.reduce((sum, s) => sum + (s.amount_total || 0), 0) / 100;

    // Calculate percentages
    const amountPercent = Math.min((totalAmount / GOAL_AMOUNT) * 100, 100);
    const donorPercent = Math.min((donorCount / GOAL_DONORS) * 100, 100);

    return res.status(200).json({
      donorCount,
      totalAmount,
      goalDonors: GOAL_DONORS,
      goalAmount: GOAL_AMOUNT,
      amountPercent: Math.round(amountPercent * 10) / 10,
      donorPercent: Math.round(donorPercent * 10) / 10,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stripe API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch donation data',
      message: error.message
    });
  }
}
