import { redirect } from 'next/navigation';

// The old "create a want" flow is retired. Everyone now lands on the single Wish List funnel
// at /wants, which uses the current model: submit a wish (no purchase, no catch), and every
// week Jeffy draws winners at random and grants their wish free.
export default function CreateWishRedirect() {
  redirect('/wants');
}
