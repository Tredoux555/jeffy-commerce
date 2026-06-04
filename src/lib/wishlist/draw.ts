import type { createAdminClient } from '@/lib/supabase/server';
import { sendEmail, whatsappLink } from '@/lib/notify/send';

// Shared Wish List draw — picks a uniformly-random eligible wish, records the winner in
// wishlist_grants (auditable), and best-effort notifies them. Used by BOTH the on-demand
// admin button (/api/admin/wishlist/draw) and the optional cron (/api/cron/wishlist-draw)
// so they behave identically. Demand "agrees" stay the internal sourcing signal — they
// do NOT change the odds; the draw is uniformly random (CPA s36).

type SupabaseAdmin = Awaited<ReturnType<typeof createAdminClient>>;

export interface DrawWinner {
  wantId: string;
  title: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  grantId: string | null;
  emailNotified: boolean;
  whatsappLink: string | null;
}

export interface DrawResult {
  success: boolean;
  drawn: boolean;
  reason?: string;
  candidates?: number;
  winner?: DrawWinner;
  error?: string;
}

export async function runWishlistDraw(supabase: SupabaseAdmin): Promise<DrawResult> {
  // Exclude wishes that have already won (a wish wins at most once).
  const { data: grants } = await supabase.from('wishlist_grants').select('want_id');
  const grantedIds = new Set(
    (grants || []).map((g: { want_id: string | null }) => g.want_id).filter(Boolean)
  );

  // Eligible = active wishes with at least one supporter (genuine demand).
  const { data: wants, error } = await supabase
    .from('wants')
    .select('*')
    .eq('status', 'active')
    .gte('current_agrees', 1);
  if (error) return { success: false, drawn: false, error: error.message };

  const candidates = (wants || []).filter((w: { id: string }) => !grantedIds.has(w.id));
  if (candidates.length === 0) {
    return { success: true, drawn: false, reason: 'no_eligible_wishes' };
  }

  // Uniform random pick.
  const winner = candidates[Math.floor(Math.random() * candidates.length)] as Record<string, unknown>;
  const title = (winner.title as string) || (winner.product_name as string) || 'their wish';
  const who = (winner.creator_name as string) || 'a Jeffy customer';

  const { data: grant, error: gErr } = await supabase
    .from('wishlist_grants')
    .insert({
      want_id: winner.id,
      user_id: (winner.user_id as string) || null,
      prize_note: `Wish List winner — "${title}" for ${who}`,
      is_public: true,
    })
    .select()
    .single();
  if (gErr) return { success: false, drawn: false, error: gErr.message };

  // Notify the winner (best-effort). Email if we have one + a Resend key; always produce a
  // click-to-chat WhatsApp link so the operator can reach out manually.
  const winnerEmail = (winner.creator_email as string) || (winner.email as string) || null;
  const winnerPhone = (winner.creator_phone as string) || (winner.phone as string) || null;
  const congratsMsg = `🎉 Great news ${who}! Your Jeffy Wish List entry "${title}" was drawn as a winner. We'll be in touch to arrange your prize.`;

  let emailNotified = false;
  if (winnerEmail) {
    const r = await sendEmail(
      winnerEmail,
      `🎉 You won the Jeffy Wish List draw!`,
      `<p>Hi ${who},</p>
       <p>Your Wish List entry <strong>"${title}"</strong> was drawn as a winner!</p>
       <p>We'll contact you shortly to arrange your prize. Keep an eye on your phone and inbox.</p>
       <p>— The Jeffy team</p>`
    );
    emailNotified = r.sent;
  }

  return {
    success: true,
    drawn: true,
    candidates: candidates.length,
    winner: {
      wantId: winner.id as string,
      title,
      name: (winner.creator_name as string) || null,
      phone: winnerPhone,
      email: winnerEmail,
      grantId: grant?.id ?? null,
      emailNotified,
      whatsappLink: winnerPhone ? whatsappLink(winnerPhone, congratsMsg) : null,
    },
  };
}
