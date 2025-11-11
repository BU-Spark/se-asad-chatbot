import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase_admin } from '@/lib/supabase_admin';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new NextResponse('Error: CLERK_WEBHOOK_SECRET not configured', { status: 500 });
  }

  const headerPayload = req.headers;
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing svix headers', { status: 400 });
  }

  const body = await req.text();

  // new svix instance
  const wh = new Webhook(WEBHOOK_SECRET);

  let wh_event: WebhookEvent;

  try {
    wh_event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error: Invalid signature', { status: 400 });
  }

  const { id } = wh_event.data; // This is the clerk_id
  const eventType = wh_event.type;

  console.log(`Webhook received: ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { email_addresses, first_name, last_name } = wh_event.data;
    const email = email_addresses[0]?.email_address;

    if (!id || !email) {
      return new NextResponse('Error: Missing clerk id or email', { status: 400 });
    }

    const { error: upsertError } = await supabase_admin.from('Users').upsert(
      {
        clerk_id: id,
        email: email,
        first_name: first_name,
        last_name: last_name,
      },
      {
        onConflict: 'clerk_id',
      }
    );

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError.message);
      return new NextResponse('Error processing webhook', { status: 500 });
    }

    console.log('User was created or updated in Supabase.');
  }

  if (eventType === 'user.deleted') {
    const { error: deleteError } = await supabase_admin.from('Users').delete().eq('clerk_id', id);
    if (deleteError) {
      // Still returns status 200 to clerk. Otherwise clerk will keep retrying
      console.warn(`Supabase delete error (user ${id}):`, deleteError.message);
    }

    console.log('User was deleted from Supabase.');
  }

  return new NextResponse('Webhook processed', { status: 200 });
}
