export const metadata = {
  title: 'Jeffy Wish List — Competition Rules',
  description: 'Official rules for the Jeffy Wish List monthly random draw (Consumer Protection Act, s.36).',
};

// Public, CPA s36-compliant rules for the monthly Wish List draw.
// Required so the promotional competition is lawful: no purchase necessary,
// published rules, defined draw, and record-keeping.
export default function WishListRulesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <h1 className="text-2xl font-bold text-slate-900">Jeffy Wish List — Official Competition Rules</h1>
      <p className="mt-2 text-sm text-slate-500">
        Run under section 36 of the Consumer Protection Act, 2008 (Act 68 of 2008). No purchase necessary.
      </p>

      <ol className="mt-6 space-y-4 text-sm leading-relaxed">
        <li>
          <strong>1. Promoter.</strong> The promoter is Jeffy Commerce (Pty) Ltd (Reg 2025/950712/07),
          39 Panorama Drive, The Links, Somerset West, 7130 (&ldquo;Jeffy&rdquo;).
        </li>
        <li>
          <strong>2. No purchase necessary.</strong> Entry is free. You do not have to buy anything to
          enter or to win. The only cost is any standard data/SMS cost of submitting your wish.
        </li>
        <li>
          <strong>3. How to enter.</strong> Submit one to ten products you wish Jeffy would stock, via the
          Jeffy Wish List on jeffy.co.za. Each validly submitted wish is one entry into the draw.
        </li>
        <li>
          <strong>4. The draw.</strong> Each month Jeffy draws a winner at <strong>random</strong> from the
          eligible wishes. The number of people who support (&ldquo;agree&rdquo; with) a wish helps Jeffy
          decide what to stock but does <em>not</em> change the odds of winning — every eligible wish has an
          equal chance.
        </li>
        <li>
          <strong>5. Eligibility.</strong> Open to South African residents. Employees of the promoter, the
          resellers in its network, and their immediate families are not eligible to win. A wish may win
          only once.
        </li>
        <li>
          <strong>6. Prize.</strong> The winning wish is sourced and delivered to the winner free of charge.
          The prize is not transferable and cannot be exchanged for cash.
        </li>
        <li>
          <strong>7. Winner notification &amp; publication.</strong> The winner will be contacted using the
          details they submitted. Winners may be announced publicly (radio, press, and social media);
          by entering you consent to such announcement should you win.
        </li>
        <li>
          <strong>8. Rules &amp; records.</strong> These rules are available free on request and on
          jeffy.co.za. Jeffy retains the required records of the competition for at least three years, as
          required by the CPA regulations.
        </li>
        <li>
          <strong>9. General.</strong> Jeffy may amend these rules or end the competition where reasonable;
          any change will be published here. The promoter&rsquo;s decision on the conduct of the draw is final.
        </li>
      </ol>

      <p className="mt-8 text-xs text-slate-400">
        &ldquo;Jeffy Wish List&rdquo; is Jeffy&rsquo;s own brand. It is not affiliated with, and does not use the name of,
        any other wish-granting organisation.
      </p>
    </main>
  );
}
