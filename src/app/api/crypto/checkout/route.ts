import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { priceAmount } = await req.json();

    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: priceAmount, // e.g., 19.99
        price_currency: 'usd',
        order_id: `user_${user.id}_${Date.now()}`,
        order_description: 'Pro Plan Subscription',
        ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/crypto`,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create invoice');

    return NextResponse.json({ url: data.invoice_url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}