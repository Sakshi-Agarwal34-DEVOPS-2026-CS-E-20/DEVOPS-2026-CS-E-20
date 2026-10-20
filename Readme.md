# ✨ LUMEN LUXE — Full-Stack Premium E-Commerce Platform

A production-ready full-stack e-commerce web application featuring high-performance audio, urban streetwear, smart living gear, and luxury accessories. Engineered with **React 19**, **Vite**, **Express 5**, **Node.js**, and persistent RESTful APIs.

---

## 🚀 Key Features

### 🛍️ Frontend Architecture & UI
- **Rich Aesthetic Design**: Glassmorphism, tailored dark/light theme switching, fluid micro-interactions, responsive grids.
- **Dynamic Catalog Filtering**: Search by name/keywords with instant live autocomplete suggestions, category pills, price range slider, star rating filters, and stock availability toggles.
- **Product Details & Verified Reviews**: High-res multi-angle photo gallery, variant selection (color swatches & sizing), expandable specs, and live verified review submission.
- **Shopping Cart & Checkout Flow**: Slide-out cart drawer, promo code redemption (`SAVE20`, `LUMEN10`, `WELCOME15`, `FREESHIP50`, `VIP25`), multi-step checkout with autofill demo option, subtotal/tax/shipping calculations, and confetti celebration.
- **Multi-Currency Converter**: Real-time currency conversions across USD ($), EUR (€), GBP (£), and INR (₹).
- **Wishlist & Saved Items**: Persistent bookmarking with instant feedback toasts.

### ⚡ Express 5 RESTful Backend API
- **Modular Routes**:
  - `GET /api/products`: Filter, sort, paginate, and search product catalog.
  - `GET /api/products/:id`: Fetch individual product details.
  - `POST /api/products/:id/reviews`: Post customer reviews & auto-recalculate average rating.
  - `POST /api/products` & `PUT /api/products/:id` & `DELETE /api/products/:id`: Admin product management.
  - `POST /api/orders`: Secure checkout and order placement with automatic stock reduction.
  - `GET /api/orders` & `GET /api/orders/:orderId`: Retrieve order history and tracking details.
  - `PATCH /api/orders/:orderId/status`: Advance fulfillment status (`Processing` ➔ `Shipped` ➔ `In Transit` ➔ `Out for Delivery` ➔ `Delivered`).
  - `POST /api/coupons/validate`: Validate discount codes against minimum spend thresholds.
  - `POST /api/newsletter/subscribe`: Join VIP list with instant reward promo code.
  - `GET /api/admin/stats`: Real-time sales metrics, total revenue, low-stock alerts, and order breakdown.
  - `GET /api/health`: Uptime and system status check.

### 📦 Live Order Tracking & Operations Hub
- **Milestone Tracking Modal**: Track any shipment by Order ID with realistic visual progress milestones, FedEx carrier tracking number, and delivery estimates.
- **Store Operations & Admin Hub**: Interactive dashboard for managing orders, changing fulfillment status, adding new products, and adjusting live stock inventory.

---

## 🛠️ Tech Stack

- **Client**: React 19, Vite, Lucide Icons, Canvas Confetti, Vanilla CSS Design System
- **Server**: Node.js, Express 5, CORS, Dotenv, Concurrently
- **Data Store**: Persistent JSON storage with fail-safe local resilience

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Full-Stack Development Mode
Runs both Express backend on port `5000` and Vite frontend on port `5173` with proxy:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Production Build & Start
```bash
npm run build
npm start
```

---

## 🎟️ Active Demo Promo Codes

| Promo Code | Discount | Minimum Spend |
| :--- | :--- | :--- |
| `SAVE20` | 20% Off Entire Order | $50 |
| `LUMEN10` | 10% Off Entire Order | $0 |
| `WELCOME15` | 15% Welcome Discount | $0 |
| `FREESHIP50` | $15 Off Shipping | $50 |
| `VIP25` | 25% VIP Club Member Discount | $100 |

---

## 📁 Project Structure

```
fullstackteamproject/
├── server/
│   ├── server.js              # Express app & static server
│   ├── data/
│   │   ├── db.js              # Persistence file manager
│   │   ├── products.json      # Product catalog database
│   │   ├── orders.json        # Orders database
│   │   ├── coupons.json       # Coupons database
│   │   └── subscribers.json   # Newsletter database
│   └── routes/
│       ├── productRoutes.js   # Product catalog CRUD & reviews
│       ├── orderRoutes.js     # Order placement & status updates
│       ├── couponRoutes.js    # Promo code validation
│       ├── newsletterRoutes.js# Newsletter subscription
│       ├── adminRoutes.js     # Store operations & analytics
│       └── healthRoutes.js    # Health monitor
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Sticky header with search & tools
│   │   ├── HeroSection.jsx    # Hero slider & promo banners
│   │   ├── ProductCard.jsx    # Catalog cards with variant preview
│   │   ├── ProductDetailModal.jsx # Gallery & live review posting
│   │   ├── CartDrawer.jsx     # Slide-out cart & coupon bar
│   │   ├── CheckoutModal.jsx  # Multi-step checkout & confetti
│   │   ├── OrderHistoryModal.jsx # Customer order records
│   │   ├── OrderTrackingModal.jsx # Visual milestone step tracker
│   │   ├── AdminModal.jsx     # Store operations & inventory manager
│   │   ├── FiltersSidebar.jsx # Range & category filters
│   │   └── Footer.jsx         # Links, quick services, newsletter
│   ├── context/
│   │   └── ShopContext.jsx    # Fullstack unified state management
│   ├── services/
│   │   └── api.js             # Frontend API client
│   └── index.css              # Custom responsive design system
├── vite.config.js             # Vite proxy & build configuration
└── package.json               # Fullstack scripts & dependencies
```
