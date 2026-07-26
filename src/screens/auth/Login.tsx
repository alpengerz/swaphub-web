import { FormEvent, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import { isProfileComplete, useAuth } from "../../auth/AuthContext";

export default function Login() {
  const { signInWithEmail, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/home";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const profile = await signInWithEmail(email.trim(), password);
      if (isProfileComplete(profile)) {
        navigate(from.startsWith("/complete-profile") ? "/home" : from, {
          replace: true,
        });
      } else {
        navigate("/complete-profile", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white px-6 pb-8 pt-12">
      <Logo size={28} />
      <h1 className="mt-8 text-2xl font-extrabold text-gray-900">Welcome back</h1>
      <p className="mt-1 text-sm text-gray-500">Log in to continue trading.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
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
            autoComplete="current-password"
          />
        </label>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-brand-600">
            Forgot password?
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button fullWidth type="submit" disabled={busy || !configured}>
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        New to SwapHub?{" "}
        <Link to="/register" className="font-semibold text-brand-600">
          Sign up
        </Link>
      </p>
    </div>
  );
}
