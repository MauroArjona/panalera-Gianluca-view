# 🛍️ Calzados Shop — Vue 3 + Tailwind eCommerce

A full-featured eCommerce frontend built with **Vue 3**, **Pinia**, **Vue Router**, and **Tailwind CSS**. Inspired by the Calzados Shop template, fully rewritten with modern tooling and a clean, scalable architecture.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 **Home** | Hero carousel, category cards, featured products, trust badges |
| 🛒 **Shop** | Sidebar filters (category, gender), sort, pagination, product grid |
| 🔍 **Product Detail** | Image gallery, size/color selectors, qty, add to cart, related products |
| 🛍️ **Cart** | Persistent (localStorage), qty controls, shipping calculator |
| 💳 **Checkout** | Multi-step form (shipping → review), mock order placement |
| 📦 **Orders** | Order history with status badges |
| ℹ️ **About / Contact** | Team section, contact form |
| 🔐 **Auth Store** | Login/register/logout via Pinia (mock credentials included) |

---

## 🏗️ Architecture

```
src/
├── api/
│   └── client.ts          # Decoupled HTTP layer — toggle USE_MOCK flag
├── data/
│   └── mock.ts            # 12 products, categories, hero slides, mock orders
├── types/
│   └── index.ts           # TypeScript interfaces for all domain models
├── stores/
│   ├── cart.ts            # Pinia cart store with localStorage persistence
│   └── auth.ts            # Pinia auth store (login, register, logout)
├── router/
│   └── index.ts           # Vue Router with lazy-loaded routes + auth guard
├── composables/
│   └── useToast.ts        # Global toast notification composable
├── components/
│   ├── TopBar.vue         # Dark top bar with contact + socials
│   ├── Navbar.vue         # Sticky responsive navbar
│   ├── Footer.vue         # Footer with subscribe
│   ├── HeroCarousel.vue   # Auto-playing hero carousel
│   ├── ProductCard.vue    # Card with hover overlay + quick add
│   ├── CartItem.vue       # Cart item row with qty controls
│   ├── StarRating.vue     # Reusable star rating
│   └── ToastContainer.vue # Portal-based toast notifications
└── views/
    ├── Home.vue
    ├── Shop.vue
    ├── ProductDetail.vue
    ├── Cart.vue
    ├── Checkout.vue
    ├── Orders.vue
    ├── About.vue
    ├── Contact.vue
    └── NotFound.vue
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔌 Connecting to a Real API

The API layer is fully decoupled in `src/api/client.ts`. To switch from mock to real:

1. Open `src/api/client.ts`
2. Set `USE_MOCK = false`
3. Set `VITE_API_URL` in your `.env` file:

```env
VITE_API_URL=https://your-api.com/v1
```

Your backend should match the endpoint shapes defined in the client. Types are in `src/types/index.ts`.

---

## 🔑 Mock Credentials

```
Email:    demo@example.com
Password: demo1234
```

---

## 🎨 Design System

- **Primary color**: `#28a745` (brand green)
- **Font**: Roboto (Google Fonts)
- **Icons**: Font Awesome 6 Free
- **Breakpoints**: Tailwind defaults (sm/md/lg/xl)
- **Custom classes**: `.btn`, `.btn-primary`, `.btn-outline`, `.input` — defined in `src/style.css`

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Vue | 3.4 | UI framework (Composition API) |
| Vite | 5 | Build tool + dev server |
| Pinia | 2.1 | State management |
| Vue Router | 4.3 | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| TypeScript | 5.4 | Type safety |

---

## 📄 License

Free to use for personal and commercial projects.

## Deploy a Vercel
npm i -g vercel
vercel --prod