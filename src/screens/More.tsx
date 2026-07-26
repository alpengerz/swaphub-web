import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  UserPlus,
  Award,
  HelpCircle,
  ShieldCheck,
  UserRound,
  LogOut,
  ChevronRight,
  ChevronLeft,
  FileText,
  Scale,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../auth/AuthContext";

const groups = [
  [
    {
      label: "Edit profile",
      sub: "Photo, username, city, and bio",
      icon: UserRound,
      to: "/edit-profile",
    },
    {
      label: "My Wallet",
      sub: "0 credits. No money, just trades.",
      icon: Wallet,
      to: "/more/wallet",
    },
    {
      label: "Invite Friends",
      sub: "Earn reputation points",
      icon: UserPlus,
      to: "/more/invite",
    },
    {
      label: "Trade Badges",
      sub: "Unlock achievements",
      icon: Award,
      to: "/more/badges",
    },
  ],
  [
    {
      label: "Help Center",
      sub: "FAQs and support",
      icon: HelpCircle,
      to: "/more/help",
    },
    {
      label: "Safety Center",
      sub: "Tips and guidelines",
      icon: ShieldCheck,
      to: "/more/safety",
    },
    {
      label: "Privacy Policy",
      sub: "How we handle your data",
      icon: FileText,
      to: "/privacy",
    },
    {
      label: "Terms of Use",
      sub: "Rules for using SwapHub",
      icon: Scale,
      to: "/terms",
    },
  ],
];

export default function More() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLogoutError("");
    setLoggingOut(true);
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (err) {
      setLogoutError(
        err instanceof Error ? err.message : "Could not log out. Try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="relative z-20 flex items-center gap-2 px-2 pb-2 pt-4">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="rounded-xl p-2 text-gray-700 transition active:bg-gray-100"
          aria-label="Back to profile"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        {groups.map((group, gi) => (
          <div
            key={gi}
            className="mt-4 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5"
          >
            {group.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    navigate(item.to, {
                      state:
                        item.to === "/edit-profile"
                          ? { from: "/settings" }
                          : undefined,
                    })
                  }
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-gray-50 ${
                    i !== group.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon size={19} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{item.sub}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        ))}

        <button
          type="button"
          disabled={loggingOut}
          onClick={() => void handleLogout()}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-card ring-1 ring-black/5 transition active:bg-red-50 disabled:opacity-60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
            <LogOut size={19} />
          </span>
          <span className="flex-1 text-sm font-semibold text-red-500">
            {loggingOut ? "Logging out…" : "Log Out"}
          </span>
        </button>
        {logoutError && (
          <p className="mt-2 text-center text-sm text-red-600">{logoutError}</p>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          SwapHub v0.3.0 · Web + PWA
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
