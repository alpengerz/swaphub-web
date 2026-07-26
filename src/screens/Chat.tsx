import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MoreVertical, Send, Plus } from "lucide-react";
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

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partner, setPartner] = useState<Profile | null>(null);
  const [listing, setListing] = useState<ListingWithPhotos | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [offerId, setOfferId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    let channel: RealtimeChannel | null = null;

    void (async () => {
      const conv = await fetchConversation(id);
      if (!conv) return;
      const c = conv as {
        buyer_id: string;
        seller_id: string;
        listings?: ListingWithPhotos;
        buyer?: Profile | null;
        seller?: Profile | null;
      };
      setListing((c.listings as ListingWithPhotos) ?? null);
      setPartner(user.id === c.buyer_id ? c.seller ?? null : c.buyer ?? null);

      const msgs = await fetchMessages(id);
      setMessages(msgs);

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
      });
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
    try {
      const msg = await sendMessage({
        conversationId: id,
        senderId: user.id,
        body: text,
      });
      setMessages((prev) =>
        prev.some((x) => x.id === msg.id) ? prev : [...prev, msg]
      );
    } catch {
      setDraft(text);
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-3 py-2.5">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <img
          src={
            partner?.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.display_name ?? "U"}`
          }
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {partner?.display_name || partner?.username || "Trader"}
          </p>
          <p className="text-xs text-brand-600">SwapHub chat</p>
        </div>
        <button className="text-gray-500">
          <MoreVertical size={20} />
        </button>
      </header>

      {listing && (
        <div className="border-b border-gray-100 bg-white px-4 py-2">
          <button
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
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{listing.title}</p>
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

      <div className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <Plus size={20} />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void send()}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          onClick={() => void send()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white transition active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {message.body && (
        <div
          className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
            mine
              ? "rounded-br-md bg-brand-500 text-white"
              : "rounded-bl-md bg-white text-gray-800 shadow-sm ring-1 ring-black/5"
          }`}
        >
          {message.body}
          <p
            className={`mt-1 text-[10px] ${
              mine ? "text-white/70" : "text-gray-400"
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
