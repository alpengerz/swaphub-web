import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import Button from "../../components/Button";
import { useAuth } from "../../auth/AuthContext";

export default function VerifyEmail() {
  const { resendVerification } = useAuth();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
        <Button fullWidth variant="outline" disabled={busy} onClick={() => void resend()}>
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
