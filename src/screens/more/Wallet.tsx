import { Wallet as WalletIcon } from "lucide-react";
import SubPageShell from "../../components/SubPageShell";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function Wallet() {
  const navigate = useNavigate();

  return (
    <SubPageShell title="My Wallet" backTo="/settings">
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <WalletIcon size={22} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Trade credits
            </p>
            <p className="text-3xl font-extrabold text-gray-900">0</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          SwapHub is trade-only — no payments, escrow, or cash wallets. Credits
          may arrive later as reputation rewards for completed swaps. For now,
          list what you have and offer what you need.
        </p>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-white p-4 text-sm text-gray-600 shadow-card ring-1 ring-black/5">
        <p className="font-semibold text-gray-900">How trading works</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Post an item others might want</li>
          <li>Browse listings and make an offer</li>
          <li>Chat, agree on a meetup, confirm the swap</li>
        </ul>
      </div>

      <div className="mt-6">
        <Button fullWidth type="button" onClick={() => navigate("/home")}>
          Browse listings
        </Button>
      </div>
    </SubPageShell>
  );
}
