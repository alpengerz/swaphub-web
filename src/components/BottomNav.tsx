import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="relative z-20 flex items-center justify-around border-t border-gray-100 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2">
      {items.slice(0, 2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}

      <button
        onClick={() => navigate("/post")}
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition active:scale-95"
        aria-label="Post an item"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {items.slice(2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
          isActive ? "text-brand-500" : "text-gray-400"
        }`
      }
    >
      <span className="relative">
        <Icon size={22} />
        {badge ? (
          <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </NavLink>
  );
}
