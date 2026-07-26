import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Mail } from "lucide-react";
import Button from "../../components/Button";
import { useAuth } from "../../auth/AuthContext";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

/**
 * Waiting room after signup. Also handles older confirmation links that still
 * redirect here (instead of /auth/callback) so users see a success state.
 */
export default function VerifyEmail() {
  const { resendVerification, user, profileComplete, refreshProfile } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    async function absorbConfirmLink() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const code = url.searchParams.get("code");
      const type =
        url.searchParams.get("type") || hash.get("type") || "";
      const hasTokens =
        Boolean(code) ||
        hash.has("access_token") ||
        type === "signup" ||
        type === "email_change";

      if (!hasTokens && !user) return;

      try {
        if (code) {
          const { error: exErr } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exErr) throw exErr;
        } else {
          await supabase.auth.getSession();
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email_confirmed_at || type === "signup") {
          await refreshProfile();
          if (!cancelled) {
            setConfirmed(true);
            setMessage("Email confirmation successful! Your account is verified.");
            // Clean tokens from the address bar
            window.history.replaceState({}, "", "/verify-email");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not confirm email from this link."
          );
        }
      }
    }

    void absorbConfirmLink();
    return () => {
      cancelled = true;
    };
  }, [user, refreshProfile]);

  async function resend() {
    if (!email) {
      setError("Missing email. Go back and sign up again.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await resendVerification(email);
      setMessage("Verification email resent. Check your inbox (and spam).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend.");
    } finally {
      setBusy(false);
    }
  }

  if (confirmed) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
          Email confirmed
        </h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-8 w-full">
          <Button
            fullWidth
            onClick={() =>
              navigate(profileComplete ? "/home" : "/complete-profile", {
                replace: true,
              })
            }
          >
            Continue to SwapHub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Mail size={28} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
        Check your email
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        We sent a verification link
        {email ? (
          <>
            {" "}
            to <span className="font-semibold text-gray-800">{email}</span>
          </>
        ) : null}
        . Open it to activate your SwapHub account.
      </p>
      {message && <p className="mt-4 text-sm text-brand-700">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-8 w-full space-y-3">
        <Button
          fullWidth
          variant="outline"
          disabled={busy}
          onClick={() => void resend()}
        >
          {busy ? "Sending…" : "Resend email"}
        </Button>
        <Link
          to="/login"
          className="block text-center text-sm font-semibold text-brand-600"
        >
          Back to log in
        </Link>
      </div>
    </div>
  );
}
