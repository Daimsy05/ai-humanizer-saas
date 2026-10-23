import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service_role key for admin database access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-nowpayments-sig');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // 1. Verify the webhook signature
    const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET!);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse the verified payload
    const payload = JSON.parse(rawBody);
    console.log('Verified webhook received:', payload);

    // 3. Handle the payment status
    if (payload.payment_status === 'finished' || payload.payment_status === 'confirmed') {
      const orderId = payload.order_id; // e.g., "user_123e4567-e89b-12d3-a456-426614174000_1678886400000"
      
      // Extract user ID from our custom order_id format
      const userId = orderId.split('_')[1];

      if (!userId) {
        console.error('Could not extract user ID from order_id:', orderId);
        return NextResponse.json({ error: 'Invalid order_id' }, { status: 400 });
      }

      // 4. Update the user's subscription in Supabase
      // For a real app, you'd create a new subscription record with an expiry date
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          id: `nowpayments_${payload.payment_id}`, // Use payment ID as unique ID
          user_id: userId,
          status: 'active',
          price_id: 'pro_plan_crypto', // A logical identifier
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        });

      if (error) {
        console.error('Supabase upsert error:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      
      console.log(`User ${userId} upgraded successfully.`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}