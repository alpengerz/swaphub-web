import { useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import SubPageShell from "../../components/SubPageShell";
import Button from "../../components/Button";
import { useAuth } from "../../auth/AuthContext";

export default function Invite() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");

  const inviteUrl = useMemo(() => {
    const ref = profile?.username || "swaphub";
    const url = new URL("/register", window.location.origin);
    url.searchParams.set("ref", ref);
    return url.toString();
  }, [profile?.username]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setStatus("Invite link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus("Could not copy. Long-press the link to copy.");
    }
  }

  async function shareLink() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join me on SwapHub",
          text: "Trade what you have for what you need on SwapHub.",
          url: inviteUrl,
        });
        setStatus("Shared.");
      } else {
        await copyLink();
      }
    } catch {
      // User cancelled share sheet — ignore
    }
  }

  return (
    <SubPageShell title="Invite Friends">
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <p className="text-sm leading-relaxed text-gray-600">
          Invite friends to SwapHub. When they join with your link, you both
          build reputation faster as the community grows.
        </p>
        <div className="mt-4 break-all rounded-xl bg-gray-50 px-3 py-3 text-xs text-gray-700 ring-1 ring-gray-100">
          {inviteUrl}
        </div>
        {status && <p className="mt-2 text-xs font-medium text-brand-600">{status}</p>}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button
          fullWidth
          type="button"
          leftIcon={copied ? <Check size={18} /> : <Copy size={18} />}
          onClick={() => void copyLink()}
        >
          {copied ? "Copied" : "Copy invite link"}
        </Button>
        <Button
          fullWidth
          type="button"
          variant="outline"
          leftIcon={<Share2 size={18} />}
          onClick={() => void shareLink()}
        >
          Share invite
        </Button>
      </div>
    </SubPageShell>
  );
}
