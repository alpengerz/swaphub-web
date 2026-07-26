import { requireSupabase } from "./supabase";
import { getOrCreateConversation } from "./chat";
import type { Offer, Trade } from "../types/database";

export async function createOffer(input: {
  listingId: string;
  fromUserId: string;
  sellerId: string;
  offeredListingIds: string[];
  message: string;
}): Promise<{ offer: Offer; conversationId: string }> {
  const sb = requireSupabase();
  const conversation = await getOrCreateConversation(
    input.listingId,
    input.fromUserId,
    input.sellerId
  );

  const { data: offer, error } = await sb
    .from("offers")
    .insert({
      listing_id: input.listingId,
      from_user_id: input.fromUserId,
      conversation_id: conversation.id,
      offered_listing_ids: input.offeredListingIds,
      message: input.message,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;

  if (input.message.trim()) {
    await sb.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: input.fromUserId,
      body: input.message.trim(),
      image_paths: [],
    });
    await sb
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation.id);
  }

  return { offer: offer as Offer, conversationId: conversation.id };
}

export async function fetchOffer(id: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("offers")
    .select("*, listings(*, listing_photos(*), profiles(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function acceptOfferAndCreateTrade(input: {
  offerId: string;
  meetingMethod?: string;
  meetingLocation?: string;
}): Promise<Trade> {
  const sb = requireSupabase();
  const { error: offerErr } = await sb
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", input.offerId);
  if (offerErr) throw offerErr;

  const { data: trade, error } = await sb
    .from("trades")
    .insert({
      offer_id: input.offerId,
      meeting_method: input.meetingMethod ?? "Meet in person",
      meeting_location: input.meetingLocation ?? "",
      status: "confirmed",
    })
    .select("*")
    .single();
  if (error) throw error;
  return trade as Trade;
}

export async function fetchTradeByOffer(offerId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("trades")
    .select("*")
    .eq("offer_id", offerId)
    .maybeSingle();
  if (error) throw error;
  return data as Trade | null;
}

export async function fetchTrade(id: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("trades")
    .select(
      `
      *,
      offers(*, listings(*, listing_photos(*), profiles(*)))
    `
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function completeTrade(tradeId: string) {
  const sb = requireSupabase();
  const { error } = await sb
    .from("trades")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", tradeId);
  if (error) throw error;
}

export async function createReview(input: {
  tradeId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  body: string;
}) {
  const sb = requireSupabase();
  const { error } = await sb.from("reviews").insert({
    trade_id: input.tradeId,
    from_user_id: input.fromUserId,
    to_user_id: input.toUserId,
    rating: input.rating,
    body: input.body,
  });
  if (error) throw error;
}

export async function createReport(input: {
  reporterId: string;
  targetType: "listing" | "user" | "message";
  targetId: string;
  reason: string;
}) {
  const sb = requireSupabase();
  const { error } = await sb.from("reports").insert({
    reporter_id: input.reporterId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
  });
  if (error) throw error;
}
