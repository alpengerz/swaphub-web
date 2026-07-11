import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownUp, MapPin, ChevronRight } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import { getListing, listings } from "../data";

export default function TradeSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const receiving = getListing(id);
  const giving = listings.find((l) => l.id === "wireless-headphones")!;

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <ScreenHeader title="Trade Summary" />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        <TradeRow label="You're giving" item={giving} />

        <div className="my-3 flex justify-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
            <ArrowDownUp size={16} />
          </span>
        </div>

        <TradeRow label="You're getting" item={receiving} highlight />

        <div className="mt-6 rounded-2xl bg-white shadow-card ring-1 ring-black/5">
          <Row label="Meeting method" value="Meet in person" />
          <div className="border-t border-gray-100" />
          <Row
            label="Location"
            value="Central Park, New York"
            valueSub="Change"
            icon={<MapPin size={16} className="text-brand-500" />}
          />
        </div>

        <div className="mt-4 rounded-2xl bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-800">Safety first</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-700">
            Always meet in a public place and inspect items before completing a
            trade.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button fullWidth onClick={() => navigate(`/confirmed/${receiving.id}`)}>
          Confirm Trade
        </Button>
      </div>
    </div>
  );
}

function TradeRow({
  label,
  item,
  highlight,
}: {
  label: string;
  item: ReturnType<typeof getListing>;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-gray-900">{label}</p>
      <div
        className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ${
          highlight ? "ring-brand-200" : "ring-black/5"
        }`}
      >
        <img
          src={item.image}
          alt={item.title}
          className="h-14 w-14 rounded-xl object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{item.title}</p>
          <p className="text-xs text-gray-500">{item.condition}</p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueSub,
  icon,
}: {
  label: string;
  value: string;
  valueSub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      {icon}
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
      {valueSub ? (
        <span className="flex items-center gap-0.5 text-sm font-semibold text-brand-600">
          {valueSub} <ChevronRight size={16} />
        </span>
      ) : (
        <ChevronRight size={18} className="text-gray-300" />
      )}
    </div>
  );
}
