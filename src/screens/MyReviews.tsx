import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import SubPageShell from "../components/SubPageShell";
import { useAuth } from "../auth/AuthContext";
import { fetchReviewsForUser } from "../lib/listings";

type ReviewRow = {
  id: string;
  rating: number;
  body: string;
  created_at: string;
  from_profile?: {
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
  from_user_id?: string;
};

export default function MyReviews() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchReviewsForUser(user.id)
      .then((data) => setRows(data as ReviewRow[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SubPageShell title="My Reviews" backTo="/profile">
      {loading && <p className="text-sm text-gray-500">Loading reviews…</p>}
      {!loading && rows.length === 0 && (
        <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-card ring-1 ring-black/5">
          <p className="text-sm font-semibold text-gray-900">No reviews yet</p>
          <p className="mt-1 text-sm text-gray-500">
            After you complete a trade, reviews from other traders appear here.
          </p>
        </div>
      )}
      <div className="space-y-2">
        {rows.map((r) => {
          const name =
            r.from_profile?.display_name ||
            r.from_profile?.username ||
            "Trader";
          const avatar =
            r.from_profile?.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
          return (
            <div
              key={r.id}
              className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5"
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star size={14} fill="currentColor" />
                  {r.rating}
                </span>
              </div>
              {r.body && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {r.body}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </SubPageShell>
  );
}
