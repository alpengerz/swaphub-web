import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import Button from "../../components/Button";
import { useAuth } from "../../auth/AuthContext";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

/**
 * Handles OAuth + email-confirm redirects.
 * Supabase lands here with either ?code=… (PKCE) or #access_token=…&type=signup
 */
export default function AuthCallback() {
  const { user, profileComplete, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"working" | "success" | "error">(
    "working"
  );
  const [message, setMessage] = useState("Finishing sign-in…");
  const [isEmailConfirm, setIsEmailConfirm] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate("/setup", { replace: true });
      return;
    }

    let cancelled = false;

    async function finish() {
      try {
        const url = new URL(window.location.href);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const code = url.searchParams.get("code");
        const errorDescription =
          url.searchParams.get("error_description") ||
          hash.get("error_description");
        const type =
          url.searchParams.get("type") || hash.get("type") || "";

        if (errorDescription) {
          if (!cancelled) {
            setStatus("error");
            setMessage(errorDescription.replace(/\+/g, " "));
          }
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Implicit / hash tokens — client picks these up via detectSessionInUrl
          await supabase.auth.getSession();
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (!cancelled) {
            setStatus("error");
            setMessage(
              "Could not confirm your session. Try logging in, or request a new verification email."
            );
          }
          return;
        }

        const emailJustConfirmed =
          type === "signup" ||
          type === "email_change" ||
          Boolean(session.user.email_confirmed_at);

        if (emailJustConfirmed) {
          setIsEmailConfirm(true);
          await refreshProfile();
          if (!cancelled) {
            setStatus("success");
            setMessage("Email confirmation successful! Your account is verified.");
          }
          return;
        }

        if (!cancelled) {
          setStatus("success");
          setMessage("Signed in successfully.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            err instanceof Error ? err.message : "Confirmation failed."
          );
        }
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate, refreshProfile]);

  useEffect(() => {
    if (status !== "success" || !user) return;
    const timer = window.setTimeout(() => {
      navigate(profileComplete ? "/home" : "/complete-profile", {
        replace: true,
      });
    }, isEmailConfirm ? 2200 : 800);
    return () => window.clearTimeout(timer);
  }, [status, user, profileComplete, navigate, isEmailConfirm]);

  if (status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <XCircle size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
          Confirmation failed
        </h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-8 w-full space-y-3">
          <Button fullWidth onClick={() => navigate("/login", { replace: true })}>
            Go to log in
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => navigate("/verify-email", { replace: true })}
          >
            Resend verification
          </Button>
        </div>
      </div>
    );
  }

  if (status === "success" && isEmailConfirm) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
          Email confirmed
        </h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <p className="mt-1 text-xs text-gray-400">Taking you to SwapHub…</p>
        <div className="mt-8 w-full">
          <Button
            fullWidth
            onClick={() =>
              navigate(profileComplete ? "/home" : "/complete-profile", {
                replace: true,
              })
            }
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-white text-sm text-gray-500">
      {message}
    </div>
  );
}
