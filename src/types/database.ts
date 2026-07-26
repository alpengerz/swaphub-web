export type Condition = "New" | "Like New" | "Good" | "Used";
export type ListingStatus = "active" | "reserved" | "traded" | "hidden";
export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "completed";
export type TradeStatus = "confirmed" | "completed" | "cancelled";

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  email_verified: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  condition: Condition;
  category: string;
  looking_for: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  image_paths: string[] | null;
  created_at: string;
}

export interface Offer {
  id: string;
  listing_id: string;
  from_user_id: string;
  conversation_id: string | null;
  offered_listing_ids: string[];
  message: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  offer_id: string;
  meeting_method: string;
  meeting_location: string;
  status: TradeStatus;
  created_at: string;
  completed_at: string | null;
}

export interface Review {
  id: string;
  trade_id: string;
  from_user_id: string;
  to_user_id: string;
  rating: number;
  body: string;
  created_at: string;
}

export type ListingWithPhotos = Listing & {
  listing_photos: ListingPhoto[];
  profiles?: Profile | null;
};

export type ConversationWithMeta = Conversation & {
  listings?: Listing & { listing_photos?: ListingPhoto[] };
  buyer?: Profile | null;
  seller?: Profile | null;
  last_message?: Message | null;
  unread?: number;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      listings: {
        Row: Listing;
        Insert: Omit<Listing, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Listing>;
      };
      listing_photos: {
        Row: ListingPhoto;
        Insert: Omit<ListingPhoto, "id" | "created_at"> & { id?: string };
        Update: Partial<ListingPhoto>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at" | "last_message_at"> & {
          id?: string;
        };
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at"> & { id?: string };
        Update: Partial<Message>;
      };
      offers: {
        Row: Offer;
        Insert: Omit<Offer, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Offer>;
      };
      trades: {
        Row: Trade;
        Insert: Omit<Trade, "id" | "created_at" | "completed_at"> & {
          id?: string;
        };
        Update: Partial<Trade>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at"> & { id?: string };
        Update: Partial<Review>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
        };
        Update: Partial<{ reason: string }>;
      };
    };
  };
}
