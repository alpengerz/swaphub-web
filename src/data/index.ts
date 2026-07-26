import type { LucideIcon } from "lucide-react";
import {
  Laptop,
  Sofa,
  Shirt,
  Dumbbell,
  Package,
  Wrench,
  Bike,
  Gamepad2,
  Camera,
  BookOpen,
  Home,
  Baby,
  Sparkles,
  Gem,
} from "lucide-react";

export type Condition = "New" | "Like New" | "Good" | "Used";

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface Listing {
  id: string;
  title: string;
  image: string;
  images: string[];
  condition: Condition;
  lookingFor: string;
  distanceKm: number;
  location: string;
  category: string;
  rating: number;
  reviews: number;
  ratingLabel: string;
  description: string;
  ownerId: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  trades: number;
  rating: number;
  reviews: number;
  about: string;
}

export interface ChatMessage {
  id: string;
  fromMe: boolean;
  text?: string;
  images?: string[];
  time: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  time: string;
}

const img = (seed: string) =>
  `https://picsum.photos/seed/${seed}/600/600`;

export const categories: Category[] = [
  { id: "electronics", label: "Electronics", icon: Laptop },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "sports", label: "Sports", icon: Dumbbell },
  { id: "vehicles", label: "Vehicles", icon: Bike },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "home", label: "Home & Garden", icon: Home },
  { id: "kids", label: "Kids & Baby", icon: Baby },
  { id: "beauty", label: "Beauty", icon: Sparkles },
  { id: "collectibles", label: "Collectibles", icon: Gem },
  { id: "other", label: "Other", icon: Package },
];

/** Alias older "more" category id to Other for display/filter. */
export function normalizeCategoryId(id: string | null | undefined): string | null {
  if (!id) return null;
  return id === "more" ? "other" : id;
}

export const users: Record<string, User> = {
  david: {
    id: "david",
    name: "David",
    avatar: "https://i.pravatar.cc/150?img=12",
    verified: true,
    trades: 34,
    rating: 4.8,
    reviews: 21,
    about:
      "Cycling enthusiast and gadget tinkerer. I keep my gear in great shape and love a fair swap.",
  },
  emily: {
    id: "emily",
    name: "Emily Johnson",
    avatar: "https://i.pravatar.cc/150?img=47",
    verified: true,
    trades: 28,
    rating: 4.9,
    reviews: 16,
    about:
      "I love trading items and helping others find what they need. Let's trade!",
  },
  marco: {
    id: "marco",
    name: "Marco",
    avatar: "https://i.pravatar.cc/150?img=33",
    verified: false,
    trades: 12,
    rating: 4.6,
    reviews: 8,
    about: "Furniture flipper and weekend woodworker.",
  },
  sophia: {
    id: "sophia",
    name: "Sophia",
    avatar: "https://i.pravatar.cc/150?img=5",
    verified: true,
    trades: 41,
    rating: 5.0,
    reviews: 30,
    about: "Minimalist always looking to swap rather than buy.",
  },
};

export const currentUser = users.emily;

export const listings: Listing[] = [
  {
    id: "mountain-bike",
    title: "Mountain Bike",
    image: img("mountainbike"),
    images: [img("mountainbike"), img("bike2"), img("bike3"), img("bike4")],
    condition: "Good",
    lookingFor: "Laptop, Guitar or similar",
    distanceKm: 2.4,
    location: "New York, USA",
    category: "vehicles",
    rating: 4.8,
    reviews: 24,
    ratingLabel: "Very Good",
    description:
      "Well maintained mountain bike, 21 speed, aluminum frame, disk brakes. Great condition. Barely used over the last year and always stored indoors.",
    ownerId: "david",
  },
  {
    id: "wireless-headphones",
    title: "Wireless Headphones",
    image: img("headphones"),
    images: [img("headphones"), img("headphones2"), img("headphones3")],
    condition: "Like New",
    lookingFor: "Smartwatch or similar",
    distanceKm: 4.1,
    location: "Brooklyn, NY",
    category: "electronics",
    rating: 4.9,
    reviews: 12,
    ratingLabel: "Excellent",
    description:
      "Noise-cancelling over-ear headphones. Comes with case and cable. Used a handful of times, no scratches.",
    ownerId: "sophia",
  },
  {
    id: "wooden-coffee-table",
    title: "Wooden Coffee Table",
    image: img("coffeetable"),
    images: [img("coffeetable"), img("table2"), img("table3")],
    condition: "Good",
    lookingFor: "Armchair or plants",
    distanceKm: 6.7,
    location: "Queens, NY",
    category: "furniture",
    rating: 4.7,
    reviews: 9,
    ratingLabel: "Very Good",
    description:
      "Solid oak coffee table with a lower shelf. Minor wear on one corner but structurally perfect.",
    ownerId: "marco",
  },
  {
    id: "dslr-camera",
    title: "DSLR Camera",
    image: img("camera"),
    images: [img("camera"), img("camera2"), img("camera3")],
    condition: "Like New",
    lookingFor: "Drone or lenses",
    distanceKm: 3.2,
    location: "Manhattan, NY",
    category: "photography",
    rating: 4.9,
    reviews: 18,
    ratingLabel: "Excellent",
    description:
      "24MP DSLR with kit lens. Shutter count under 5k. Includes battery, charger and strap.",
    ownerId: "sophia",
  },
  {
    id: "acoustic-guitar",
    title: "Acoustic Guitar",
    image: img("guitar"),
    images: [img("guitar"), img("guitar2"), img("guitar3")],
    condition: "Good",
    lookingFor: "Headphones or vinyl",
    distanceKm: 1.9,
    location: "New York, USA",
    category: "more",
    rating: 4.6,
    reviews: 7,
    ratingLabel: "Very Good",
    description:
      "Full-size acoustic guitar with a warm tone. Fresh strings. Small cosmetic scuff near the pickguard.",
    ownerId: "marco",
  },
  {
    id: "smartwatch",
    title: "Smartwatch",
    image: img("smartwatch"),
    images: [img("smartwatch"), img("watch2"), img("watch3")],
    condition: "Like New",
    lookingFor: "Headphones or bike gear",
    distanceKm: 5.0,
    location: "Brooklyn, NY",
    category: "electronics",
    rating: 4.8,
    reviews: 14,
    ratingLabel: "Very Good",
    description:
      "GPS smartwatch with heart-rate tracking. Battery health excellent. Two straps included.",
    ownerId: "emily",
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: "m1",
    fromMe: false,
    text: "Hi Emily! I'm interested in your bike. I can offer these items.",
    time: "10:24 AM",
  },
  {
    id: "m2",
    fromMe: false,
    images: [img("headphones"), img("smartwatch"), img("backpack")],
    time: "10:24 AM",
  },
  {
    id: "m3",
    fromMe: false,
    text: "Let me know what you think.",
    time: "10:25 AM",
  },
  {
    id: "m4",
    fromMe: true,
    text: "Hey! That looks good. Can we start with the watch too?",
    time: "10:32 AM",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    author: "David",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "Smooth trade, item exactly as described. Would swap again!",
    time: "2 weeks ago",
  },
  {
    id: "r2",
    author: "Sophia",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    text: "Super friendly and quick to respond. Highly recommended.",
    time: "1 month ago",
  },
  {
    id: "r3",
    author: "Marco",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 4,
    text: "Good communication, met at a safe public spot. Thanks!",
    time: "2 months ago",
  },
];

export const conditions: Condition[] = ["New", "Like New", "Good", "Used"];

export function getListing(id: string | undefined): Listing {
  return listings.find((l) => l.id === id) ?? listings[0];
}
