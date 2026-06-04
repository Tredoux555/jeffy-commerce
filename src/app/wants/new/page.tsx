import { redirect } from 'next/navigation';

// Retired duplicate create form (off-model "get 10 = FREE", orphaned/no inbound links).
// Everyone uses the single Wish List funnel at /wants.
export default function NewWishRedirect() {
  redirect('/wants');
}
