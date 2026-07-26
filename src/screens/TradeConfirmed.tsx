import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ShieldCheck, MessageCircle, FileText } from "lucide-react";
import Button from "../components/Button";
import { completeTrade, fetchTrade } from "../lib/trades";

const tips = [
  "Meet in a public place",
  "Check items before exchanging",
  "Be respectful and trust each other",
];

export default function TradeConfirmed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void fetchTrade(id).then((t) => {
      if (!t) return;
      const trade = t as {
        offer_id: string;
        offers?: { conversation_id?: string | null };
      };
      setOfferId(trade.offer_id);
      setConversationId(trade.offers?.conversation_id ?? null);
    });
  }, [id]);

  async function markCompleted() {
    if (!id) return;
    setBusy(true);
    try {
      await completeTrade(id);
      navigate("/home", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="relative overflow-hidden bg-brand-500 px-6 pb-10 pt-16 text-center text-white">
        <div className="relative mx-auto flex h-20 w-20 animate-pop-in items-center justify-center rounded-full bg-white shadow-lg">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500">
            <Check size={32} strokeWidth={3} className="text-white" />
          </span>
        </div>
        <h1 className="relative mt-5 text-2xl font-extrabold">Trade Confirmed!</h1>
        <p className="relative mt-2 text-sm text-white/90">
          You and the other trader have confirmed the trade.
        </p>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              conversationId
                ? navigate(`/chat/${conversationId}`)
                : navigate("/messages")
            }
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-4 shadow-card"
          >
            <MessageCircle size={22} className="text-brand-600" />
            <span className="text-sm font-semibold text-gray-800">View Chat</span>
          </button>
          <button
            onClick={() =>
              offerId ? navigate(`/summary/${offerId}`) : undefined
            }
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-4 shadow-card"
          >
            <FileText size={22} className="text-brand-600" />
            <span className="text-sm font-semibold text-gray-800">
              Trade Details
            </span>
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-brand-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-brand-800">
            <ShieldCheck size={18} /> Safety Tips
          </p>
          <ul className="mt-3 space-y-2">
            {tips.map((t) => (
              <li
                key={t}
                className="flex items-center gap-2 text-sm text-brand-700"
              >
                <Check size={16} className="text-brand-600" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button fullWidth disabled={busy} onClick={() => void markCompleted()}>
          {busy ? "Saving…" : "Mark as Completed After Trade"}
        </Button>
      </div>
    </div>
  );
}
