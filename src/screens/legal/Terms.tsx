import SubPageShell from "../../components/SubPageShell";

export default function Terms() {
  return (
    <SubPageShell title="Terms of Use">
      <article className="space-y-4 text-sm leading-relaxed text-gray-600">
        <p className="text-xs text-gray-400">Last updated: July 27, 2026</p>
        <p>
          By using SwapHub you agree to these terms. SwapHub is a barter
          marketplace for exchanging items — not a payment, escrow, or shipping
          service.
        </p>
        <section>
          <h2 className="font-semibold text-gray-900">Your account</h2>
          <p className="mt-1">
            You must provide accurate information and keep your login secure.
            You are responsible for activity under your account.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">Acceptable use</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>No illegal, stolen, dangerous, or prohibited items</li>
            <li>No harassment, scams, or impersonation</li>
            <li>No using SwapHub to solicit cash payments as a substitute for trades</li>
            <li>Meet in public places and inspect items before swapping</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">Trades are between users</h2>
          <p className="mt-1">
            SwapHub is not a party to your trades. We do not guarantee item
            condition, delivery, or outcomes. Use chat records and common-sense
            safety practices.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">Content</h2>
          <p className="mt-1">
            You keep ownership of content you upload. You grant SwapHub a license
            to host and display it so the service can work. We may remove content
            that violates these terms.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">Availability</h2>
          <p className="mt-1">
            The app is provided as-is during early access. Features may change.
            We may suspend accounts that abuse the platform.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">Contact</h2>
          <p className="mt-1">
            <a className="font-semibold text-brand-600" href="mailto:support@swaphub.app">
              support@swaphub.app
            </a>
          </p>
        </section>
      </article>
    </SubPageShell>
  );
}
