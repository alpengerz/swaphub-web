import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Bell, MapPin, ChevronDown } from "lucide-react";
import BottomNav from "../components/BottomNav";
import ItemCard from "../components/ItemCard";
import Logo from "../components/Logo";
import { categories, listings } from "../data";

export default function Home() {
  const navigate = useNavigate();
  const recommended = listings.slice(0, 4);
  const popular = listings.slice(2, 6);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="bg-white px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <Logo size={26} />
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>
        </div>
        <button className="mt-2 flex items-center gap-1 text-sm font-medium text-gray-500">
          <MapPin size={14} className="text-brand-500" /> New York, USA
          <ChevronDown size={14} />
        </button>
        <button
          onClick={() => navigate("/search")}
          className="mt-3 flex w-full items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-left text-sm text-gray-400"
        >
          <Search size={18} />
          Search items, skills or categories
          <SlidersHorizontal size={18} className="ml-auto text-gray-500" />
        </button>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        <Section title="Recommended for you" onSeeAll={() => navigate("/search")}>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {recommended.map((l) => (
              <ItemCard key={l.id} listing={l} />
            ))}
          </div>
        </Section>

        <div className="mt-5 px-4">
          <SectionHeader title="Categories" onSeeAll={() => navigate("/search")} />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {categories.slice(0, 8).map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => navigate("/search")}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card ring-1 ring-black/5">
                    <Icon size={22} />
                  </span>
                  <span className="text-[11px] font-medium text-gray-600">
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Section title="Popular near you" onSeeAll={() => navigate("/search")}>
          <div className="space-y-3 px-4">
            {popular.map((l) => (
              <ItemCard key={l.id} listing={l} variant="list" />
            ))}
          </div>
        </Section>
      </div>

      <BottomNav />
    </div>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-sm font-semibold text-brand-600"
        >
          See all
        </button>
      )}
    </div>
  );
}

function Section({
  title,
  onSeeAll,
  children,
}: {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <div className="px-4">
        <SectionHeader title={title} onSeeAll={onSeeAll} />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
