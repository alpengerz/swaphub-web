import { ShieldCheck } from "lucide-react";
import SubPageShell from "../../components/SubPageShell";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const TIPS = [
  {
    title: "Meet in public",
    body: "Choose busy, well-lit places — malls, cafés, or barangay halls — never secluded spots for first trades.",
  },
  {
    title: "Inspect before you swap",
    body: "Check the item in person. Photos can miss damage or missing parts.",
  },
  {
    title: "Keep chat on SwapHub",
    body: "Stay in-app so you have a record of the agreement if something goes wrong.",
  },
  {
    title: "Trust your gut",
    body: "If a deal feels rushed or off, walk away. You can report suspicious listings from the item page.",
  },
  {
    title: "No cash pressure",
    body: "SwapHub is for trading items. Don’t send money to “hold” or “ship” an item.",
  },
];

export default function Safety() {
  const navigate = useNavigate();

  return (
    <SubPageShell title="Safety Center">
      <div className="mb-4 flex items-start gap-3 rounded-2xl bg-brand-50 p-4 text-brand-800">
        <ShieldCheck size={22} className="mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">
          Safe swaps keep the community strong. Follow these guidelines every
          time you meet to trade.
        </p>
      </div>

      <div className="space-y-2">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5"
          >
            <p className="text-sm font-semibold text-gray-900">{tip.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {tip.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button fullWidth type="button" onClick={() => navigate("/home")}>
          Back to browsing
        </Button>
      </div>
    </SubPageShell>
  );
}
