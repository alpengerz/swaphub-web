import SubPageShell from "../../components/SubPageShell";

export default function Privacy() {
  return (
    <SubPageShell title="Privacy Policy">
      <article className="space-y-4 text-sm leading-relaxed text-gray-600">
        <p className="text-xs text-gray-400">Last updated: July 27, 2026</p>
        <p>
          SwapHub (“we”, “us”) helps people trade items without payments in the
          app. This policy explains what we collect and how we use it.
        </p>
        <section>
          <h2 className="font-semibold text-gray-900">What we collect</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Account details: email, username, display name, city, bio, photo</li>
            <li>Listings you post (photos, descriptions, location labels)</li>
            <li>Messages, offers, and trade activity between users</li>
            <li>Basic device/app usage needed to run the service (via hosting providers)</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">How we use data</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>To create your account and show your profile to other traders</li>
            <li>To power listings, chat, offers, and safety features</li>
            <li>To respond to support requests and abuse reports</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">Sharing</h2>
          <p className="mt-1">
            We do not sell your personal data. Profile and listing information you
            publish is visible to other SwapHub users. We use trusted processors
            (such as Supabase for auth/database/storage and Vercel for hosting) to
            run the app.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">Your choices</h2>
          <p className="mt-1">
            You can update your profile in Settings → Edit profile. To delete your
            account or request a data export, email{" "}
            <a className="font-semibold text-brand-600" href="mailto:support@swaphub.app">
              support@swaphub.app
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-900">Contact</h2>
          <p className="mt-1">
            Questions about privacy:{" "}
            <a className="font-semibold text-brand-600" href="mailto:support@swaphub.app">
              support@swaphub.app
            </a>
          </p>
        </section>
      </article>
    </SubPageShell>
  );
}
