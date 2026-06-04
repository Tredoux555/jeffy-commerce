import { Resend } from 'resend';

// Tiny shared notifier. Sends a plain email via Resend when RESEND_API_KEY is set,
// otherwise it's a silent no-op (so it never breaks flows in dev / pre-launch).
// Always best-effort: errors are swallowed and reported in the return value.

let resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL || 'Jeffy <hello@jeffy.co.za>';

export interface NotifyResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<NotifyResult> {
  const client = getResend();
  if (!client) return { sent: false, skipped: true };
  if (!to || !to.includes('@')) return { sent: false, skipped: true };
  try {
    const { error } = await client.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) return { sent: false, error: String((error as { message?: string })?.message || error) };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// A wa.me deep link the operator can tap to message someone on WhatsApp. We don't have a
// WhatsApp Business API wired, so this returns a click-to-chat URL for manual follow-up.
export function whatsappLink(phone: string, message: string): string | null {
  const digits = (phone || '').replace(/[^\d]/g, '');
  if (!digits) return null;
  // Normalise SA numbers: a leading 0 → +27.
  const intl = digits.startsWith('0') ? `27${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
