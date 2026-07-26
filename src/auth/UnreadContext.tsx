import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchUnreadMessageCount } from "../lib/unread";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

interface UnreadContextValue {
  unreadMessages: number;
  refreshUnread: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextValue | null>(null);

export function UnreadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setUnreadMessages(0);
      return;
    }
    try {
      const n = await fetchUnreadMessageCount(user.id);
      setUnreadMessages(n);
    } catch (err) {
      console.error("refreshUnread", err);
    }
  }, [user]);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    const onLocal = () => void refreshUnread();
    window.addEventListener("swaphub-unread-changed", onLocal);
    return () => window.removeEventListener("swaphub-unread-changed", onLocal);
  }, [refreshUnread]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`unread:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as { sender_id?: string };
          if (row.sender_id && row.sender_id !== user.id) {
            void refreshUnread();
          }
        }
      )
      .subscribe();

    const poll = window.setInterval(() => void refreshUnread(), 20000);

    return () => {
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [user, refreshUnread]);

  const value = useMemo(
    () => ({ unreadMessages, refreshUnread }),
    [unreadMessages, refreshUnread]
  );

  return (
    <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>
  );
}

export function useUnread() {
  const ctx = useContext(UnreadContext);
  if (!ctx) throw new Error("useUnread must be used within UnreadProvider");
  return ctx;
}
