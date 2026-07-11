import { useNavigate } from "react-router-dom";
import {
  Settings,
  BadgeCheck,
  List,
  Bookmark,
  History,
  Star,
  ChevronRight,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { currentUser } from "../data";

const rows = [
  { label: "My Listings", count: 6, icon: List },
  { label: "Saved Items", count: 12, icon: Bookmark },
  { label: "Trade History", count: 28, icon: History },
  { label: "My Reviews", count: 16, icon: Star },
];

export default function Profile() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <h1 className="text-lg font-bold text-gray-900">Profile</h1>
        <button
          onClick={() => navigate("/more")}
          className="text-gray-500"
          aria-label="Settings"
        >
          <Settings size={22} />
        </button>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col items-center pt-2 text-center">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-card"
          />
          <div className="mt-3 flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-gray-900">
              {currentUser.name}
            </h2>
          </div>
          {currentUser.verified && (
            <span className="mt-1 flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
              <BadgeCheck size={14} /> Verified Trader
            </span>
          )}
        </div>

        <div className="mt-5 flex rounded-2xl bg-white py-4 shadow-card ring-1 ring-black/5">
          <Stat value={currentUser.trades} label="Trades" />
          <Divider />
          <Stat value={currentUser.rating} label="Rating" />
          <Divider />
          <Stat value={currentUser.reviews} label="Reviews" />
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-bold text-gray-900">About me</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {currentUser.about}
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
          {rows.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={r.label}
                onClick={() => navigate("/more")}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                  i !== rows.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon size={18} />
                </span>
                <span className="flex-1 text-sm font-medium text-gray-800">
                  {r.label}
                </span>
                <span className="text-sm font-semibold text-gray-400">
                  {r.count}
                </span>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Divider() {
  return <div className="w-px bg-gray-100" />;
}
