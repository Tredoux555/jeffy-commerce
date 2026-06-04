import { redirect } from 'next/navigation';

// The old share-code "create a want" flow is retired. It sent raw base64 images through a
// Next.js server action (which 500'd past the body-size limit) and used the off-model
// "10 agrees = free" mechanic. Everyone now lands on the single Wish List funnel at /wants,
// which has the proper model (demand signal + monthly draw) and compresses images client-side.
export default function CreateWishRedirect() {
  redirect('/wants');
}
