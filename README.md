# SwapHub Web

A responsive, mobile-first web prototype of **SwapHub** - a barter marketplace where people trade items instead of paying money. This is a front-end prototype: all 10 screens are built with sample data, no backend or login required.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React Router](https://reactrouter.com/) (HashRouter) for navigation
- [lucide-react](https://lucide.dev/) for icons

## Screens

1. Onboarding
2. Home / Feed
3. Search & Filters
4. Item Details
5. Make an Offer
6. Chat / Negotiation
7. Trade Summary
8. Trade Confirmation
9. Profile
10. More / Menu

Plus a Messages inbox and a Post an Item form wired into the bottom navigation.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

The production build is output to `dist/`.

## Deploying

This app is a static SPA and deploys to any static host. It is preconfigured for
[Vercel](https://vercel.com/) via `vercel.json` (framework: Vite, output: `dist`).
Push to GitHub, import the repo in Vercel, and it deploys automatically.

## Notes

- Images are loaded from public placeholder services (picsum.photos, pravatar.cc)
  so the prototype works without bundling assets. Swap these for real assets later.
- All data lives in `src/data/index.ts`. Replace it with a real API when moving
  beyond the prototype stage.
