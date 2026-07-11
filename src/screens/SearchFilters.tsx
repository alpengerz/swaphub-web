import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ClipboardList } from "lucide-react";
import ScreenHeader from "../components/ScreenHeader";
import Chip from "../components/Chip";
import Button from "../components/Button";
import { categories, conditions, listings } from "../data";

const lookingForOptions = ["All", "Items", "Services", "Skills"];

export default function SearchFilters() {
  const navigate = useNavigate();
  const [distance, setDistance] = useState(25);
  const [condition, setCondition] = useState("All");
  const [lookingFor, setLookingFor] = useState("All");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader
        title="Search"
        right={
          <button className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600">
            <ClipboardList size={20} />
          </button>
        }
      />

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        <div className="mt-1 flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-400">
          <Search size={18} />
          Search items or keywords
        </div>

        <div className="mt-3 flex gap-3">
          <FilterPill label="All Categories" />
          <FilterPill label="Filters" />
        </div>

        <Label>Categories</Label>
        <div className="grid grid-cols-5 gap-2">
          {categories.slice(0, 5).map((c) => {
            const Icon = c.icon;
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(active ? null : c.id)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition ${
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-600"
                    : "border-gray-100 bg-white text-gray-600"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{c.label}</span>
              </button>
            );
          })}
        </div>

        <Label>Distance</Label>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Within {distance} km</span>
          <span className="font-semibold text-brand-600">{distance} km</span>
        </div>
        <input
          type="range"
          min={5}
          max={100}
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="brand-range mt-3 w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>5 km</span>
          <span>100 km</span>
        </div>

        <Label>Condition</Label>
        <div className="flex flex-wrap gap-2">
          <Chip
            label="All"
            active={condition === "All"}
            onClick={() => setCondition("All")}
          />
          {conditions.map((c) => (
            <Chip
              key={c}
              label={c}
              active={condition === c}
              onClick={() => setCondition(c)}
            />
          ))}
        </div>

        <Label>Looking for</Label>
        <div className="flex flex-wrap gap-2">
          {lookingForOptions.map((o) => (
            <Chip
              key={o}
              label={o}
              active={lookingFor === o}
              onClick={() => setLookingFor(o)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        <Button fullWidth onClick={() => navigate("/home")}>
          Show Results ({listings.length * 22})
        </Button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 text-sm font-bold text-gray-900">{children}</h3>
  );
}

function FilterPill({ label }: { label: string }) {
  return (
    <button className="flex flex-1 items-center justify-between rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700">
      {label}
      <ChevronDown size={16} className="text-gray-400" />
    </button>
  );
}
