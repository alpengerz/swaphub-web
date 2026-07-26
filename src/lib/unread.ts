import { requireSupabase } from "./supabase";

const readKey = (userId: string) => `swaphub.read.${userId}`;

type ReadMap = Record<string, string>;

export function getReadMap(userId: string): ReadMap {
  try {
    const raw = localStorage.getItem(readKey(userId));
    const parsed = raw ? (JSON.parse(raw) as ReadMap) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function markConversationRead(userId: string, conversationId: string) {
  const map = getReadMap(userId);
  map[conversationId] = new Date().toISOString();
  localStorage.setItem(readKey(userId), JSON.stringify(map));
  window.dispatchEvent(new Event("swaphub-unread-changed"));
}

/** Count messages from others that are newer than the last time you opened that chat. */
export async function fetchUnreadMessageCount(userId: string): Promise<number> {
  const sb = requireSupabase();
  const { data: convs, error } = await sb
    .from("conversations")
    .select("id, last_message_at")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  if (error) throw error;
  if (!convs?.length) return 0;

  const readMap = getReadMap(userId);
  let total = 0;

  await Promise.all(
    convs.map(async (c) => {
      const since = readMap[c.id] ?? "1970-01-01T00:00:00.000Z";
      const { count, error: cErr } = await sb
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .neq("sender_id", userId)
        .gt("created_at", since);
      if (!cErr) total += count ?? 0;
    })
  );

  return total;
}

/** Conversations with unread activity (for the bell). */
export async function fetchUnreadConversationSummaries(userId: string) {
  const sb = requireSupabase();
  const { data: convs, error } = await sb
    .from("conversations")
    .select("id, last_message_at, listings(title)")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });
  if (error) throw error;

  const readMap = getReadMap(userId);
  const rows: {
    id: string;
    title: string;
    at: string;
    unread: number;
  }[] = [];

  for (const c of convs ?? []) {
    const since = readMap[c.id] ?? "1970-01-01T00:00:00.000Z";
    const { count } = await sb
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", c.id)
      .neq("sender_id", userId)
      .gt("created_at", since);
    const unread = count ?? 0;
    if (unread > 0 && c.last_message_at) {
      const listing = c.listings as { title?: string } | { title?: string }[] | null;
      const title = Array.isArray(listing)
        ? listing[0]?.title
        : listing?.title;
      rows.push({
        id: c.id,
        title: title ?? "Trade chat",
        at: c.last_message_at,
        unread,
      });
    }
  }
  return rows;
}
