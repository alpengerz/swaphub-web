import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SubPageShell from "../../components/SubPageShell";
import Button from "../../components/Button";

const FAQS = [
  {
    q: "Is SwapHub free?",
    a: "Yes. Listing, browsing, chatting, and trading are free. SwapHub is trade-only — no payments in the app.",
  },
  {
    q: "How do I start a trade?",
    a: "Open a listing, tap Make an Offer, describe what you’re offering, then chat with the other trader to agree on details and a meetup.",
  },
  {
    q: "How do I post an item?",
    a: "Tap the green + button, add photos and details, say what you’re looking for, then publish.",
  },
  {
    q: "Can I change my username?",
    a: "Go to Settings → Edit profile to update your photo, display name, city, and bio.",
  },
  {
    q: "Something looks wrong — who do I contact?",
    a: "Email support@swaphub.app with your username and a short description. We’ll help as soon as we can.",
  },
];

export default function Help() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SubPageShell title="Help Center" backTo="/settings">
      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className={i !== FAQS.length - 1 ? "border-b border-gray-100" : ""}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-gray-900">
                  {item.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-gray-400 transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-3.5 text-sm leading-relaxed text-gray-600">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
        <p className="text-sm font-semibold text-gray-900">Still need help?</p>
        <p className="mt-1 text-sm text-gray-500">
          Reach the SwapHub team by email.
        </p>
        <div className="mt-3">
          <Button
            fullWidth
            type="button"
            variant="outline"
            onClick={() => {
              window.location.href =
                "mailto:support@swaphub.app?subject=SwapHub%20help";
            }}
          >
            Email support
          </Button>
        </div>
      </div>
    </SubPageShell>
  );
}
