import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { listings, users } from "../data";

const previews = [
  { listingId: "mountain-bike", text: "Hey! That looks good. Can we...", time: "10:32 AM", unread: 2 },
  { listingId: "wooden-coffee-table", text: "Is the table still available?", time: "Yesterday", unread: 0 },
  { listingId: "dslr-camera", text: "I can add a lens to the deal.", time: "Yesterday", unread: 1 },
  { listingId: "acoustic-guitar", text: "Great, see you at 3pm.", time: "Mon", unread: 0 },
];

export default function Messages() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="bg-white px-4 pb-3 pt-4">
        <h1 className="text-lg font-bold text-gray-900">Messages</h1>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-400">
          <Search size={18} /> Search conversations
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {previews.map((p) => {
          const listing = listings.find((l) => l.id === p.listingId)!;
          const partner = users[listing.ownerId];
          return (
            <button
              key={p.listingId}
              onClick={() => navigate(`/chat/${listing.id}`)}
              className="flex w-full items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 text-left"
            >
              <div className="relative">
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <img
                  src={listing.image}
                  alt=""
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg object-cover ring-2 ring-white"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate font-semibold text-gray-900">
                    {partner.name}
                  </p>
                  <span className="text-xs text-gray-400">{p.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-gray-500">{p.text}</p>
                  {p.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                      {p.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
