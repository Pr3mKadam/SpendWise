// supabase/functions/bill-reminder/index.ts
// Deploy: supabase functions deploy bill-reminder
// Secrets:
//   supabase secrets set VAPID_PUBLIC_KEY=your-vapid-public-key
//   supabase secrets set VAPID_PRIVATE_KEY=your-vapid-private-key
//   supabase secrets set VAPID_SUBJECT=mailto:admin@spendwise.app
//
// Schedule cron (every day at 9am IST):
//   supabase functions cron create --schedule "0 3:30 * * *" --name "daily-bill-reminder" bill-reminder
// (3:30 UTC = 9:00 AM IST)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import webpush from 'npm:web-push@3.6.7';

interface RecurringTransaction {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  frequency: string;
  next_occurrence: string;
  user_id: string;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

serve(async req => {
  // Only allow service_role or cron trigger
  const authHeader = req.headers.get('Authorization') ?? '';
  const isCron = req.headers.get('x-supabase-cron') === 'true';

  if (!authHeader.includes('service_role') && !isCron) {
    return new Response(JSON.stringify({ error: 'Unauthorized — service role required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Configure web-push
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@spendwise.app';

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Calculate date range: next 3 days
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const todayStr = today.toISOString().slice(0, 10);
    const threeDaysLaterStr = threeDaysLater.toISOString().slice(0, 10);

    // Query recurring transactions with upcoming bills
    const { data: upcomingBills, error: billsError } = await supabase
      .from('recurring_transactions')
      .select('id, merchant, amount, category, frequency, next_occurrence, user_id')
      .gte('next_occurrence', todayStr)
      .lte('next_occurrence', threeDaysLaterStr);

    if (billsError) {
      console.error('Failed to query recurring transactions:', billsError);
      return new Response(JSON.stringify({ error: 'Database query failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!upcomingBills?.length) {
      return new Response(
        JSON.stringify({ message: 'No upcoming bills in next 3 days', sent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Group bills by user
    const billsByUser: Record<string, RecurringTransaction[]> = {};
    for (const bill of upcomingBills as RecurringTransaction[]) {
      if (!billsByUser[bill.user_id]) billsByUser[bill.user_id] = [];
      billsByUser[bill.user_id].push(bill);

      // Update next_occurrence for monthly bills
      if (bill.frequency === 'monthly') {
        const nextDate = new Date(bill.next_occurrence);
        nextDate.setMonth(nextDate.getMonth() + 1);
        const nextStr = nextDate.toISOString().slice(0, 10);

        await supabase
          .from('recurring_transactions')
          .update({ next_occurrence: nextStr })
          .eq('id', bill.id);
      }
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const [userId, bills] of Object.entries(billsByUser)) {
      // Get user's push subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId);

      if (subError || !subscriptions?.length) {
        console.warn(`No push subscriptions for user ${userId}`);
        continue;
      }

      // Build notification for this user
      const billCount = bills.length;
      const totalAmount = bills.reduce((s, b) => s + b.amount, 0);
      const merchantList = bills.map(b => b.merchant).join(', ');

      const title =
        billCount === 1 ? `💰 Bill due: ${bills[0].merchant}` : `💰 ${billCount} bills due soon`;

      const body =
        billCount === 1
          ? `${bills[0].merchant} — ${bills[0].amount.toLocaleString()} due on ${bills[0].next_occurrence}`
          : `${merchantList} — total ${totalAmount.toLocaleString()} due in next 3 days`;

      const payload = JSON.stringify({
        title,
        body,
        url: '/history',
        icon: '/icons/pwa-192x192.png',
      });

      for (const sub of subscriptions as PushSubscription[]) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
            { TTL: 86400 }
          );
          totalSent++;
        } catch (err: unknown) {
          totalFailed++;
          if (err instanceof Error && err.message.includes('410')) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalBills: upcomingBills.length,
        affectedUsers: Object.keys(billsByUser).length,
        sent: totalSent,
        failed: totalFailed,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    console.error('bill-reminder error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
