import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubPageShell from "../components/SubPageShell";
import { useAuth } from "../auth/AuthContext";
import { coverUrl } from "../lib/listings";
import { fetchTradeHistory, type TradeHistoryRow } from "../lib/trades";
import type { ListingWithPhotos } from "../types/database";

export default function TradeHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<TradeHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchTradeHistory(user.id)
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SubPageShell title="Trade History" backTo="/profile">
      {loading && <p className="text-sm text-gray-500">Loading trade history…</p>}
      {!loading && rows.length === 0 && (
        <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-card ring-1 ring-black/5">
          <p className="text-sm font-semibold text-gray-900">No trades yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Offers you make or receive will show up here.
          </p>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-4 text-sm font-semibold text-brand-600"
          >
            Browse listings →
          </button>
        </div>
      )}
      <div className="space-y-2">
        {rows.map((row) => {
          const listing = row.listing as ListingWithPhotos | null | undefined;
          const img = listing ? coverUrl(listing) : "";
          const label = row.trade?.status ?? row.status;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                if (row.trade?.id) navigate(`/summary/${row.trade.id}`);
                else if (listing?.id) navigate(`/item/${listing.id}`);
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-card ring-1 ring-black/5 transition active:bg-gray-50"
            >
              {img ? (
                <img
                  src={img}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gray-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {listing?.title ?? "Listing"}
                </p>
                <p className="text-xs text-gray-500">
                  {row.role === "buyer" ? "You offered" : "Offer received"} ·{" "}
                  {new Date(row.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </SubPageShell>
  );
}
