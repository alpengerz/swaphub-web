import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, MessageCircle, Plus, Search, User } from "lucide-react";
import Logo from "./Logo";
import { useUnread } from "../auth/UnreadContext";
import { useAuth } from "../auth/AuthContext";

/**
 * Carousell-style top bar for desktop browsers.
 */
export default function DesktopTopNav() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { unreadMessages } = useUnread();
  const [q, setQ] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
        <Link to="/home" className="shrink-0">
          <Logo size={28} />
        </Link>

        <form onSubmit={onSearch} className="relative mx-2 min-w-0 flex-1 max-w-2xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items, categories…"
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-brand-400 focus:bg-white"
          />
        </form>

        <nav className="flex shrink-0 items-center gap-1">
          <TopLink to="/search" label="Browse" />
          <TopLink
            to="/messages"
            label="Inbox"
            icon={MessageCircle}
            badge={unreadMessages}
          />
          <Link
            to="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadMessages > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>
          <Link
            to="/profile"
            className="flex h-10 items-center gap-2 rounded-full px-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <img
              src={
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.display_name ?? "U"}`
              }
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-1 ring-black/5"
            />
            <span className="hidden max-w-[7rem] truncate lg:inline">
              {profile?.display_name || profile?.username || "Profile"}
            </span>
            <User size={16} className="text-gray-400 lg:hidden" />
          </Link>
          <button
            type="button"
            onClick={() => navigate("/post")}
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <Plus size={18} strokeWidth={2.5} />
            Sell
          </button>
        </nav>
      </div>
    </header>
  );
}

function TopLink({
  to,
  label,
  icon: Icon,
  badge,
}: {
  to: string;
  label: string;
  icon?: typeof MessageCircle;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition ${
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-gray-600 hover:bg-gray-100"
        }`
      }
    >
      {Icon ? <Icon size={18} /> : null}
      <span className="hidden sm:inline">{label}</span>
      {badge ? (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </NavLink>
  );
}
