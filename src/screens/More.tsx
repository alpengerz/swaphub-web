import { useNavigate } from "react-router-dom";
import {
  Wallet,
  UserPlus,
  Award,
  HelpCircle,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../auth/AuthContext";

const groups = [
  [
    {
      label: "My Wallet",
      sub: "0 credits. No money, just trades.",
      icon: Wallet,
    },
    {
      label: "Invite Friends",
      sub: "Earn reputation points",
      icon: UserPlus,
    },
    {
      label: "Trade Badges",
      sub: "Unlock achievements",
      icon: Award,
    },
  ],
  [
    { label: "Help Center", sub: "FAQs and support", icon: HelpCircle },
    { label: "Safety Center", sub: "Tips and guidelines", icon: ShieldCheck },
    { label: "Settings", sub: "Account and preferences", icon: Settings },
  ],
];

export default function More() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex items-center px-4 pb-2 pt-4">
        <h1 className="text-lg font-bold text-gray-900">More</h1>
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
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
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
          onClick={() => {
            void signOut().then(() => navigate("/", { replace: true }));
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-card ring-1 ring-black/5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
            <LogOut size={19} />
          </span>
          <span className="flex-1 text-sm font-semibold text-red-500">
            Log Out
          </span>
        </button>

        <p className="mt-6 text-center text-xs text-gray-400">
          SwapHub v0.2.0 · Web + PWA
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
