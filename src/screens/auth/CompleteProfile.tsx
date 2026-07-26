import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function CompleteProfile() {
  const { profile, updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [displayName, setDisplayName] = useState(
    profile?.display_name ?? user?.user_metadata?.full_name ?? ""
  );
  const [city, setCity] = useState(profile?.city ?? "Metro Manila");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
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
      navigate("/home", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save profile.";
      if (msg.toLowerCase().includes("unique") || msg.includes("duplicate")) {
        setError("That username is taken. Try another.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white px-6 pb-8 pt-12">
      <h1 className="text-2xl font-extrabold text-gray-900">Complete your profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Pick a username so other traders can find and trust you.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col gap-3">
        <label className="block text-sm font-medium text-gray-700">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input mt-1"
            placeholder="e.g. trader_juan"
            required
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input mt-1"
            placeholder="How you appear to others"
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
          About you (optional)
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="input mt-1 resize-none"
            placeholder="What do you like to trade?"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="mt-auto pt-4">
          <Button fullWidth type="submit" disabled={busy}>
            {busy ? "Saving…" : "Continue to SwapHub"}
          </Button>
        </div>
      </form>
    </div>
  );
}
