import { FormEvent, useEffect, useState } from "react";
import SubPageShell from "../../components/SubPageShell";
import Button from "../../components/Button";
import { useAuth } from "../../auth/AuthContext";

const PH_CITIES = [
  "Metro Manila",
  "Cebu City",
  "Davao City",
  "Quezon City",
  "Makati",
  "Pasig",
  "Taguig",
  "Cavite",
  "Laguna",
  "Iloilo City",
  "Baguio",
  "Other",
];

const NOTIFY_KEY = "swaphub.notify";

export default function Settings() {
  const { user, profile, updateProfile, resetPassword } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("Metro Manila");
  const [bio, setBio] = useState("");
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);

  useEffect(() => {
    setUsername(profile?.username ?? "");
    setDisplayName(profile?.display_name ?? "");
    setCity(profile?.city ?? "Metro Manila");
    setBio(profile?.bio ?? "");
    const stored = localStorage.getItem(NOTIFY_KEY);
    setNotify(stored !== "0");
  }, [profile]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUser.length < 3) {
      setError("Username must be at least 3 characters (letters, numbers, _).");
      return;
    }
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    setBusy(true);
    try {
      await updateProfile({
        username: cleanUser,
        display_name: displayName.trim(),
        city,
        bio: bio.trim(),
      });
      localStorage.setItem(NOTIFY_KEY, notify ? "1" : "0");
      setOk("Settings saved.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save.";
      if (msg.toLowerCase().includes("unique") || msg.includes("duplicate")) {
        setError("That username is taken. Try another.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword() {
    if (!user?.email) {
      setError("No email on this account.");
      return;
    }
    setPwdBusy(true);
    setError("");
    setOk("");
    try {
      await resetPassword(user.email);
      setOk("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setPwdBusy(false);
    }
  }

  return (
    <SubPageShell title="Settings">
      <form onSubmit={onSave} className="space-y-3">
        <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Account
          </p>
          <p className="mt-1 text-sm text-gray-700">{user?.email ?? "—"}</p>
        </div>

        <label className="block text-sm font-medium text-gray-700">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input mt-1"
            required
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input mt-1"
            required
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          City / area
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input mt-1"
          >
            {PH_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          About you
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="input mt-1 resize-none"
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-card ring-1 ring-black/5">
          <span>
            <span className="block text-sm font-semibold text-gray-900">
              Trade reminders
            </span>
            <span className="text-xs text-gray-500">
              Remember to check messages and offers
            </span>
          </span>
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="h-5 w-5 accent-brand-500"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-brand-600">{ok}</p>}

        <Button fullWidth type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        <Button
          fullWidth
          type="button"
          variant="outline"
          disabled={pwdBusy || !user?.email}
          onClick={() => void onResetPassword()}
        >
          {pwdBusy ? "Sending…" : "Send password reset email"}
        </Button>
      </form>
    </SubPageShell>
  );
}
