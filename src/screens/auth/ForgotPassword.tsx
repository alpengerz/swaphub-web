import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import { useAuth } from "../../auth/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await resetPassword(email.trim());
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white px-6 pb-8 pt-12">
      <h1 className="text-2xl font-extrabold text-gray-900">Reset password</h1>
      <p className="mt-1 text-sm text-gray-500">
        Enter your email and we&apos;ll send a reset link.
      </p>

      {done ? (
        <div className="mt-8 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">
          If an account exists for <b>{email}</b>, a reset link is on its way.
          Check your inbox and spam folder.
          <Link to="/login" className="mt-4 block font-semibold text-brand-700">
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button fullWidth type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </Button>
          <Link
            to="/login"
            className="block text-center text-sm font-semibold text-brand-600"
          >
            Back to log in
          </Link>
        </form>
      )}
    </div>
  );
}
