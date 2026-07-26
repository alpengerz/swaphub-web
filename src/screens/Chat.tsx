import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Send } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  fetchConversation,
  fetchMessages,
  sendMessage,
  subscribeToMessages,
} from "../lib/chat";
import { coverUrl } from "../lib/listings";
import { requireSupabase } from "../lib/supabase";
import type { ListingWithPhotos, Message, Profile } from "../types/database";
import { useAuth } from "../auth/AuthContext";
import { markConversationRead } from "../lib/unread";
import Button from "../components/Button";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partner, setPartner] = useState<Profile | null>(null);
  const [listing, setListing] = useState<ListingWithPhotos | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [offerId, setOfferId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "missing">(
    "loading"
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    let channel: RealtimeChannel | null = null;
    setStatus("loading");
    setError("");

    void (async () => {
      try {
        const conv = await fetchConversation(id);
        if (!conv) {
          setStatus("missing");
          return;
        }
        const c = conv as {
          buyer_id: string;
          seller_id: string;
          listings?: ListingWithPhotos;
          buyer?: Profile | null;
          seller?: Profile | null;
        };
        if (user.id !== c.buyer_id && user.id !== c.seller_id) {
          setStatus("forbidden");
          return;
        }
        setListing((c.listings as ListingWithPhotos) ?? null);
        setPartner(user.id === c.buyer_id ? c.seller ?? null : c.buyer ?? null);

        const msgs = await fetchMessages(id);
        setMessages(msgs);
        markConversationRead(user.id, id);

        try {
          const sb = requireSupabase();
          const { data } = await sb
            .from("offers")
            .select("id")
            .eq("conversation_id", id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (data?.id) setOfferId(data.id as string);
        } catch {
          /* ignore */
        }

        channel = subscribeToMessages(id, (m) => {
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, m]
          );
          markConversationRead(user.id, id);
        });
        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not open chat");
        setStatus("missing");
      }
    })();

    return () => {
      if (channel) void channel.unsubscribe();
    };
  }, [id, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!draft.trim() || !user || !id) return;
    const text = draft;
    setDraft("");
    setSendError("");
    try {
      const msg = await sendMessage({
        conversationId: id,
        senderId: user.id,
        body: text,
      });
      setMessages((prev) =>
        prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]
      );
    } catch (err) {
      setDraft(text);
      setSendError(err instanceof Error ? err.message : "Could not send message");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading chat…
      </div>
    );
  }

  if (status === "forbidden" || status === "missing") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-semibold text-gray-900">
          {status === "forbidden" ? "You can’t open this chat" : "Chat not found"}
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="button" onClick={() => navigate("/messages")}>
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-3 py-2.5">
        <button
          type="button"
          onClick={() => navigate("/messages")}
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 active:bg-gray-100"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>
        <img
          src={
            partner?.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.display_name ?? "U"}`
          }
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">
            {partner?.display_name || partner?.username || "Trader"}
          </p>
          <p className="text-xs text-brand-600">SwapHub chat</p>
        </div>
      </header>

      {listing && (
        <div className="border-b border-gray-100 bg-white px-4 py-2">
          <button
            type="button"
            onClick={() =>
              offerId
                ? navigate(`/summary/${offerId}`)
                : navigate(`/item/${listing.id}`)
            }
            className="flex w-full items-center gap-3 rounded-xl bg-gray-50 p-2 text-left"
          >
            <img
              src={coverUrl(listing)}
              alt={listing.title}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {listing.title}
              </p>
              <p className="text-xs text-gray-500">{listing.location}</p>
            </div>
            <span className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white">
              {offerId ? "View Trade" : "View Item"}
            </span>
          </button>
        </div>
      )}

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} mine={m.sender_id === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <p className="px-4 pb-1 text-center text-xs text-red-600">{sendError}</p>
      )}
      <div className="flex items-center gap-2 border-t border-gray-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void send()}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => void send()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white transition active:scale-95"
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
          mine
            ? "rounded-br-md bg-brand-500 text-white"
            : "rounded-bl-md bg-white text-gray-800 shadow-sm ring-1 ring-black/5"
        }`}
      >
        {message.body}
      </div>
    </div>
  );
}
