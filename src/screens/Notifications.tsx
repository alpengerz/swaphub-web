import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageCircle, Handshake } from "lucide-react";
import SubPageShell from "../components/SubPageShell";
import { useAuth } from "../auth/AuthContext";
import { fetchMyConversations } from "../lib/chat";
import { fetchTradeHistory } from "../lib/trades";

type Note = {
  id: string;
  title: string;
  body: string;
  at: string;
  href: string;
  kind: "message" | "offer";
};

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchMyConversations(user.id).catch(() => []),
      fetchTradeHistory(user.id).catch(() => []),
    ])
      .then(([convs, trades]) => {
        const messageNotes: Note[] = (convs as { id: string; last_message_at: string | null }[])
          .filter((c) => c.last_message_at)
          .slice(0, 10)
          .map((c) => ({
            id: `msg-${c.id}`,
            title: "Conversation update",
            body: "You have activity in a trade chat.",
            at: c.last_message_at as string,
            href: `/chat/${c.id}`,
            kind: "message" as const,
          }));

        const offerNotes: Note[] = trades.slice(0, 10).map((t) => ({
          id: `offer-${t.id}`,
          title: t.role === "seller" ? "New offer activity" : "Your offer update",
          body: `${t.listing?.title ?? "A listing"} · ${t.trade?.status ?? t.status}`,
          at: t.created_at,
          href: t.trade?.id ? `/summary/${t.trade.id}` : t.listing?.id ? `/item/${t.listing.id}` : "/trade-history",
          kind: "offer" as const,
        }));

        setNotes(
          [...messageNotes, ...offerNotes].sort(
            (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
          )
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <SubPageShell title="Notifications" backTo="/home">
      <p className="mb-3 text-sm text-gray-500">
        Alerts for chats and offers related to your trades.
      </p>
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && notes.length === 0 && (
        <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-card ring-1 ring-black/5">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Bell size={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-gray-900">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-gray-500">
            When someone messages you or makes an offer, it will show up here.
          </p>
        </div>
      )}
      <div className="space-y-2">
        {notes.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => navigate(n.href)}
            className="flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-card ring-1 ring-black/5 transition active:bg-gray-50"
          >
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              {n.kind === "message" ? (
                <MessageCircle size={18} />
              ) : (
                <Handshake size={18} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{n.title}</p>
              <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(n.at).toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </SubPageShell>
  );
}
