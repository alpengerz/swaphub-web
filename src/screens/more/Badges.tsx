import { useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import SubPageShell from "../../components/SubPageShell";
import { useAuth } from "../../auth/AuthContext";
import { fetchMyListings, fetchProfileStats } from "../../lib/listings";

type Badge = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchProfileStats(user.id), fetchMyListings(user.id)])
      .then(([stats, listings]) => {
        setBadges([
          {
            id: "first-list",
            title: "First Listing",
            description: "Post your first item",
            unlocked: listings.length >= 1,
          },
          {
            id: "active-trader",
            title: "Active Trader",
            description: "Complete 1 trade",
            unlocked: stats.trades >= 1,
          },
          {
            id: "trusted",
            title: "Trusted Swapper",
            description: "Earn 3 reviews",
            unlocked: stats.reviews >= 3,
          },
          {
            id: "five-star",
            title: "Five-Star Hub",
            description: "Reach a 4.5+ average rating",
            unlocked: stats.rating >= 4.5 && stats.reviews >= 1,
          },
          {
            id: "collector",
            title: "Collector",
            description: "Have 5 active listings",
            unlocked: listings.filter((l) => l.status === "active").length >= 5,
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SubPageShell title="Trade Badges" backTo="/settings">
      <p className="mb-3 text-sm text-gray-500">
        Unlock badges as you list, trade, and build trust on SwapHub.
      </p>
      {loading && <p className="text-sm text-gray-500">Loading badges…</p>}
      <div className="space-y-2">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5 ${
              b.unlocked ? "" : "opacity-70"
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full ${
                b.unlocked
                  ? "bg-brand-50 text-brand-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {b.unlocked ? <Award size={20} /> : <Lock size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{b.title}</p>
              <p className="text-xs text-gray-500">{b.description}</p>
            </div>
            <span
              className={`text-[11px] font-semibold ${
                b.unlocked ? "text-brand-600" : "text-gray-400"
              }`}
            >
              {b.unlocked ? "Unlocked" : "Locked"}
            </span>
          </div>
        ))}
      </div>
    </SubPageShell>
  );
}
