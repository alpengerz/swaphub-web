import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MoreVertical, Send, Plus } from "lucide-react";
import { chatMessages, getListing, users, type ChatMessage } from "../data";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = getListing(id);
  const partner = users[listing.ownerId];
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [
      ...m,
      {
        id: `m${m.length + 1}`,
        fromMe: true,
        text: draft.trim(),
        time: "Now",
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-3 py-2.5">
        <button onClick={() => navigate(-1)} className="text-gray-700">
          <ChevronLeft size={24} />
        </button>
        <img
          src={partner.avatar}
          alt={partner.name}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{partner.name}</p>
          <p className="text-xs text-brand-600">Active now</p>
        </div>
        <button className="text-gray-500">
          <MoreVertical size={20} />
        </button>
      </header>

      <div className="border-b border-gray-100 bg-white px-4 py-2">
        <button
          onClick={() => navigate(`/summary/${listing.id}`)}
          className="flex w-full items-center gap-3 rounded-xl bg-gray-50 p-2 text-left"
        >
          <img
            src={listing.image}
            alt={listing.title}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{listing.title}</p>
            <p className="text-xs text-gray-500">{listing.distanceKm} km away</p>
          </div>
          <span className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white">
            View Trade
          </span>
        </button>
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} avatar={partner.avatar} />
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <Plus size={20} />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          onClick={send}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white transition active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function Bubble({ message, avatar }: { message: ChatMessage; avatar: string }) {
  const mine = message.fromMe;
  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && (
        <img src={avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
      )}
      <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
        {message.images && (
          <div className="mb-1 flex gap-1.5">
            {message.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-16 w-16 rounded-xl object-cover"
              />
            ))}
          </div>
        )}
        {message.text && (
          <div
            className={`rounded-2xl px-3.5 py-2.5 text-sm ${
              mine
                ? "rounded-br-md bg-brand-500 text-white"
                : "rounded-bl-md bg-white text-gray-800 shadow-sm ring-1 ring-black/5"
            }`}
          >
            {message.text}
          </div>
        )}
        <p
          className={`mt-1 text-[10px] text-gray-400 ${
            mine ? "text-right" : "text-left"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}
