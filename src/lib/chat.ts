import { requireSupabase } from "./supabase";
import type { Conversation, Message } from "../types/database";

export async function getOrCreateConversation(
  listingId: string,
  buyerId: string,
  sellerId: string
): Promise<Conversation> {
  const sb = requireSupabase();
  const { data: existing } = await sb
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .maybeSingle();
  if (existing) return existing as Conversation;

  const { data, error } = await sb
    .from("conversations")
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function fetchMyConversations(userId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("conversations")
    .select(
      `
      *,
      listings(*, listing_photos(*)),
      buyer:profiles!conversations_buyer_id_fkey(*),
      seller:profiles!conversations_seller_id_fkey(*)
    `
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    // Simpler select if FK aliases fail
    const fallback = await sb
      .from("conversations")
      .select("*, listings(*, listing_photos(*))")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });
    if (fallback.error) throw fallback.error;
    return fallback.data ?? [];
  }
  return data ?? [];
}

export async function fetchConversation(id: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("conversations")
    .select("*, listings(*, listing_photos(*)), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    const fallback = await sb
      .from("conversations")
      .select("*, listings(*, listing_photos(*))")
      .eq("id", id)
      .maybeSingle();
    if (fallback.error) throw fallback.error;
    return fallback.data;
  }
  return data;
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<Message> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      body: input.body.trim(),
      image_paths: [],
    })
    .select("*")
    .single();
  if (error) throw error;

  await sb
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", input.conversationId);

  return data as Message;
}

export function subscribeToMessages(
  conversationId: string,
  onInsert: (message: Message) => void
) {
  const sb = requireSupabase();
  return sb
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as Message)
    )
    .subscribe();
}
