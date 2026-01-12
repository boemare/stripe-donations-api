import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration - update these values for your campaign
const GOAL_AMOUNT = 10000;  // Target amount in dollars
const GOAL_DONORS = 100;    // Target number of donors

// Optional: Filter by specific payment link ID (leave empty to count all payments)
const PAYMENT_LINK_ID = process.env.STRIPE_PAYMENT_LINK_ID || '';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Update to your Framer domain in production
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let allPayments = [];
    let hasMore = true;
    let startingAfter = undefined;

    // Paginate through all payments
    while (hasMore) {
      const params = {
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter }),
      };

      const payments = await stripe.paymentIntents.list(params);
      allPayments = allPayments.concat(payments.data);
      hasMore = payments.has_more;

      if (payments.data.length > 0) {
        startingAfter = payments.data[payments.data.length - 1].id;
      }
    }

    // Filter successful payments
    let successfulPayments = allPayments.filter(p => p.status === 'succeeded');

    // If a specific payment link is configured, filter by it
    if (PAYMENT_LINK_ID) {
      successfulPayments = successfulPayments.filter(p =>
        p.metadata?.payment_link === PAYMENT_LINK_ID ||
        p.payment_method_options?.link?.payment_link === PAYMENT_LINK_ID
      );
    }

    // Calculate totals
    const donorCount = successfulPayments.length;
    const totalAmount = successfulPayments.reduce((sum, p) => sum + p.amount_received, 0) / 100;

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
