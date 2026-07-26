import { useState } from "react";
import { MapPin, X } from "lucide-react";

const PH_CITIES = [
  "Metro Manila",
  "Cebu City",
  "Davao City",
  "Quezon City",
  "Makati",
  "Pasig",
  "Taguig",
  "Cavite",
  "Laguna",
  "Iloilo City",
  "Baguio",
  "Other",
];

export default function CityPicker({
  city,
  onSelect,
  onClose,
}: {
  city: string;
  onSelect: (city: string) => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black/40">
      <button
        type="button"
        className="min-h-[20%] flex-1"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="max-h-[75%] rounded-t-3xl bg-white px-4 pb-6 pt-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-brand-500" />
            <h2 className="text-base font-bold text-gray-900">Your area</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 active:bg-gray-100"
            aria-label="Close city picker"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-3 text-sm text-gray-500">
          Choose where you trade. This updates your profile location.
        </p>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <div className="no-scrollbar max-h-72 space-y-1 overflow-y-auto">
          {PH_CITIES.map((c) => {
            const active = c === city;
            return (
              <button
                key={c}
                type="button"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  setError("");
                  Promise.resolve(onSelect(c))
                    .then(() => onClose())
                    .catch((err) =>
                      setError(
                        err instanceof Error ? err.message : "Could not update city"
                      )
                    )
                    .finally(() => setBusy(false));
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-800 active:bg-gray-50"
                }`}
              >
                {c}
                {active && (
                  <span className="text-xs font-semibold text-brand-600">Current</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
