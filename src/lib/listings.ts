import { requireSupabase, publicUrl } from "./supabase";
import type { Condition, ListingWithPhotos, Profile } from "../types/database";

export function photoUrls(listing: ListingWithPhotos): string[] {
  const photos = [...(listing.listing_photos ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  return photos.map((p) => publicUrl("listing-photos", p.storage_path));
}

export function coverUrl(listing: ListingWithPhotos): string {
  const urls = photoUrls(listing);
  return urls[0] || "https://picsum.photos/seed/swaphub-empty/600/600";
}

export async function fetchListings(opts?: {
  category?: string | null;
  condition?: string | null;
  query?: string;
  ownerId?: string;
}): Promise<ListingWithPhotos[]> {
  const sb = requireSupabase();
  // Avoid fragile FK aliases — photos are enough for cards/search/home.
  let q = sb
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.condition && opts.condition !== "All") {
    q = q.eq("condition", opts.condition);
  }
  if (opts?.ownerId) q = q.eq("owner_id", opts.ownerId);
  if (opts?.query?.trim()) {
    const raw = opts.query.trim().replace(/[%_,.()]/g, " ");
    const term = `%${raw}%`;
    q = q.or(
      `title.ilike.${term},description.ilike.${term},looking_for.ilike.${term}`
    );
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ListingWithPhotos[];
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const sb = requireSupabase();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/avatar.${ext}`;
  const { error: upErr } = await sb.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (upErr) throw upErr;
  // cache-bust so the new photo shows immediately
  return `${publicUrl("avatars", path)}?t=${Date.now()}`;
}

export async function fetchListing(id: string): Promise<ListingWithPhotos | null> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("listings")
    .select("*, listing_photos(*), profiles!listings_owner_id_fkey(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    const fallback = await sb
      .from("listings")
      .select("*, listing_photos(*)")
      .eq("id", id)
      .maybeSingle();
    if (fallback.error) throw fallback.error;
    return fallback.data as ListingWithPhotos | null;
  }
  return data as ListingWithPhotos | null;
}

export async function fetchMyListings(userId: string): Promise<ListingWithPhotos[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("listings")
    .select("*, listing_photos(*)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ListingWithPhotos[];
}

export async function createListing(input: {
  ownerId: string;
  title: string;
  description: string;
  condition: Condition;
  category: string;
  lookingFor: string;
  location: string;
  files: File[];
}): Promise<string> {
  const sb = requireSupabase();
  const { data: listing, error } = await sb
    .from("listings")
    .insert({
      owner_id: input.ownerId,
      title: input.title.trim(),
      description: input.description.trim(),
      condition: input.condition,
      category: input.category,
      looking_for: input.lookingFor.trim(),
      location: input.location.trim(),
      status: "active",
    })
    .select("id")
    .single();
  if (error) throw error;

  const listingId = listing.id as string;
  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i];
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${input.ownerId}/${listingId}/${i}.${ext}`;
    const { error: upErr } = await sb.storage
      .from("listing-photos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;
    const { error: photoErr } = await sb.from("listing_photos").insert({
      listing_id: listingId,
      storage_path: path,
      sort_order: i,
    });
    if (photoErr) throw photoErr;
  }
  return listingId;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProfileStats(userId: string) {
  const sb = requireSupabase();
  const [{ count: listingCount }, { data: reviews }, { count: offersMade }] =
    await Promise.all([
      sb
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId),
      sb.from("reviews").select("rating").eq("to_user_id", userId),
      sb
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("from_user_id", userId)
        .eq("status", "completed"),
    ]);
  const ratings = (reviews ?? []).map((r) => r.rating as number);
  const avg =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
        10
      : 0;
  return {
    listings: listingCount ?? 0,
    reviews: ratings.length,
    rating: avg,
    trades: offersMade ?? ratings.length,
  };
}

export async function fetchReviewsForUser(userId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("reviews")
    .select("*, from_profile:profiles!reviews_from_user_id_fkey(*)")
    .eq("to_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    // Fallback without join alias if FK name differs
    const fallback = await sb
      .from("reviews")
      .select("*")
      .eq("to_user_id", userId)
      .order("created_at", { ascending: false });
    if (fallback.error) throw fallback.error;
    return fallback.data ?? [];
  }
  return data ?? [];
}

export function ratingLabel(rating: number): string {
  if (rating >= 4.8) return "Excellent";
  if (rating >= 4.5) return "Very Good";
  if (rating >= 4) return "Good";
  if (rating > 0) return "Fair";
  return "New";
}
