import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Plus, Pencil } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { getListing, listings } from "../data";

export default function MakeOffer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = getListing(id);
  const myItem = listings.find((l) => l.id === "wireless-headphones")!;
  const [message, setMessage] = useState("");
  const [offered, setOffered] = useState([myItem]);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <ScreenHeader
        title="Make an Offer"
        right={
          <button className="flex items-center gap-1 text-sm font-semibold text-brand-600">
            <Pencil size={14} /> Edit
          </button>
        }
      />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <SectionLabel>You're offering</SectionLabel>
        <div className="space-y-2">
          {offered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-black/5"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.condition}</p>
              </div>
              <button
                onClick={() =>
                  setOffered((o) => o.filter((x) => x.id !== item.id))
                }
                className="text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 py-3 text-sm font-semibold text-brand-600">
          <Plus size={16} /> Add another item
        </button>

        <SectionLabel className="mt-6">You're looking for</SectionLabel>
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-black/5">
          <img
            src={listing.image}
            alt={listing.title}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{listing.title}</p>
            <p className="text-xs text-gray-500">{listing.condition}</p>
          </div>
        </div>

        <SectionLabel className="mt-6">Add a message (optional)</SectionLabel>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Hi! I'm interested in your bike. These are the items I can offer. Let me know what you think."
          className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand-400"
        />
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button
          fullWidth
          disabled={offered.length === 0}
          onClick={() => navigate(`/chat/${listing.id}`)}
        >
          Send Offer
        </Button>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`mb-2 text-sm font-bold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}
