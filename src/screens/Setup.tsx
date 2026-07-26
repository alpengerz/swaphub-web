import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { isSupabaseConfigured } from "../lib/supabase";

export default function Setup() {
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-white px-6 pb-10 pt-12">
      <Logo size={28} />
      <h1 className="mt-6 text-2xl font-extrabold text-gray-900">
        Connect Supabase
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        SwapHub needs a free Supabase project for auth, listings, photos, and
        chat. Status:{" "}
        <span
          className={`font-semibold ${
            isSupabaseConfigured ? "text-brand-600" : "text-amber-700"
          }`}
        >
          {isSupabaseConfigured ? "Configured" : "Not configured"}
        </span>
      </p>

      <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-gray-700">
        <li>
          Create a free project at{" "}
          <a
            className="font-semibold text-brand-600"
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
          >
            supabase.com
          </a>
        </li>
        <li>
          Open <b>SQL Editor</b> and run the full script in{" "}
          <code className="rounded bg-gray-100 px-1">
            supabase/migrations/001_initial_schema.sql
          </code>
        </li>
        <li>
          In <b>Authentication → Providers</b>, enable Email. Add redirect URLs:{" "}
          <code className="rounded bg-gray-100 px-1 text-xs">
            http://localhost:5173/auth/callback
          </code>{" "}
          and your Vercel URL.
        </li>
        <li>
          Copy Project URL and anon key from{" "}
          <b>Project Settings → API</b> into{" "}
          <code className="rounded bg-gray-100 px-1">.env.local</code> (see{" "}
          <code className="rounded bg-gray-100 px-1">.env.example</code>).
        </li>
        <li>
          Restart <code className="rounded bg-gray-100 px-1">npm run dev</code>
          .
        </li>
      </ol>

      <p className="mt-8 text-center text-sm">
        {isSupabaseConfigured ? (
          <Link to="/register" className="font-semibold text-brand-600">
            Continue to Register →
          </Link>
        ) : (
          <Link to="/" className="font-semibold text-brand-600">
            ← Back to welcome
          </Link>
        )}
      </p>
    </div>
  );
}
