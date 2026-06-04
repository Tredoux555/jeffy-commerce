// VAT helper. Activates the day Jeffy registers — flip VAT_REGISTERED=true in env.
// In the locked model VAT ends at the wholesale leg (Jeffy is registered; resellers are
// too small to register), so output VAT is computed on the wholesale supply, and import
// VAT becomes recoverable. Exact treatment is subject to the accountant's confirmation.

export const VAT_RATE = 0.15;
export const VAT_REGISTERED = process.env.VAT_REGISTERED === 'true';

// Split a VAT-inclusive amount (cents) into net + VAT (cents).
export function splitInclusive(inclusiveCents: number): { netCents: number; vatCents: number } {
  if (!inclusiveCents || inclusiveCents <= 0) return { netCents: 0, vatCents: 0 };
  const vatCents = Math.round((inclusiveCents * VAT_RATE) / (1 + VAT_RATE));
  return { netCents: inclusiveCents - vatCents, vatCents };
}
