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

export type TradeHistoryRow = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  role: "buyer" | "seller";
  listing?: {
    id: string;
    title: string;
    listing_photos?: { storage_path: string; sort_order: number }[];
  } | null;
  trade?: {
    id: string;
    status: string;
    meeting_location: string;
    completed_at: string | null;
  } | null;
};

export async function fetchTradeHistory(
  userId: string
): Promise<TradeHistoryRow[]> {
  const sb = requireSupabase();

  const asBuyer = await sb
    .from("offers")
    .select("*, listings(*, listing_photos(*)), trades(*)")
    .eq("from_user_id", userId)
    .order("created_at", { ascending: false });

  const myListingIds = await sb
    .from("listings")
    .select("id")
    .eq("owner_id", userId);
  const ids = (myListingIds.data ?? []).map((l) => l.id as string);

  let asSellerData: typeof asBuyer.data = [];
  if (ids.length > 0) {
    const asSeller = await sb
      .from("offers")
      .select("*, listings(*, listing_photos(*)), trades(*)")
      .in("listing_id", ids)
      .neq("from_user_id", userId)
      .order("created_at", { ascending: false });
    if (asSeller.error) throw asSeller.error;
    asSellerData = asSeller.data ?? [];
  }

  if (asBuyer.error) {
    // Fallback without trades embed
    const buyerFb = await sb
      .from("offers")
      .select("*, listings(*, listing_photos(*))")
      .eq("from_user_id", userId)
      .order("created_at", { ascending: false });
    if (buyerFb.error) throw buyerFb.error;
    const sellerFb =
      ids.length > 0
        ? await sb
            .from("offers")
            .select("*, listings(*, listing_photos(*))")
            .in("listing_id", ids)
            .neq("from_user_id", userId)
            .order("created_at", { ascending: false })
        : { data: [], error: null };
    if (sellerFb.error) throw sellerFb.error;

    const rows = [
      ...(buyerFb.data ?? []).map((o) => normalizeOfferRow(o, "buyer")),
      ...(sellerFb.data ?? []).map((o) => normalizeOfferRow(o, "seller")),
    ];
    return rows.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  const rows = [
    ...(asBuyer.data ?? []).map((o) => normalizeOfferRow(o, "buyer")),
    ...(asSellerData ?? []).map((o) => normalizeOfferRow(o, "seller")),
  ];
  return rows.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function normalizeOfferRow(
  o: {
    id: string;
    status: string;
    message: string | null;
    created_at: string;
    listings?: TradeHistoryRow["listing"];
    trades?: TradeHistoryRow["trade"] | TradeHistoryRow["trade"][];
  },
  role: "buyer" | "seller"
): TradeHistoryRow {
  const tradeRaw = o.trades;
  const trade = Array.isArray(tradeRaw) ? tradeRaw[0] : tradeRaw;
  return {
    id: o.id,
    status: o.status,
    message: o.message,
    created_at: o.created_at,
    role,
    listing: o.listings ?? null,
    trade: trade
      ? {
          id: trade.id,
          status: trade.status,
          meeting_location: trade.meeting_location,
          completed_at: trade.completed_at,
        }
      : null,
  };
}
