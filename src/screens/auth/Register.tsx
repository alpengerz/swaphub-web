import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import { useAuth } from "../../auth/AuthContext";

export default function Register() {
  const { signUpWithEmail, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }
    setBusy(true);
    try {
      const { needsVerification } = await signUpWithEmail(email.trim(), password);
      if (needsVerification) {
        navigate("/verify-email", { state: { email: email.trim() } });
      } else {
        navigate("/complete-profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign up.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white px-6 pb-8 pt-12">
      <Logo size={28} />
      <h1 className="mt-8 text-2xl font-extrabold text-gray-900">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Join SwapHub — trade what you have for what you need.
      </p>

      {!configured && (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Supabase is not configured yet. See{" "}
          <Link to="/setup" className="font-semibold underline">
            Setup
          </Link>
          .
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1"
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </label>
        <label className="flex items-start gap-2 text-xs leading-relaxed text-gray-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-500"
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="font-semibold text-brand-600">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-semibold text-brand-600">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button fullWidth type="submit" disabled={busy || !configured || !agreed}>
          {busy ? "Creating…" : "Sign up with email"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
