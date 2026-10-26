# ✨ LUMEN LUXE — Full-Stack Premium E-Commerce Platform

A production-ready full-stack e-commerce web application featuring high-performance audio, urban streetwear, smart living gear, and luxury accessories. Engineered with **React 19**, **Vite**, **Express 5**, **Node.js**, **MongoDB Atlas**, **Mongoose**, and **Docker**.

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
  - `GET /api/health`: Uptime, database connection status, and system monitor.

### 🍃 MongoDB Atlas & Cloud Persistence
- **Dual-Mode Database Architecture**:
  - Automatically connects to **MongoDB Atlas** when `MONGODB_URI` is provided in environment variables.
  - High-resilience fallback to local JSON file storage if offline or without `MONGODB_URI`.
  - **Auto-Seeding**: Upon first connection to MongoDB, automatically seeds initial products, coupons, and orders from the dataset.
- **Mongoose Models**:
  - `Product`: Catalog items, variant swatches, ratings, specs, and verified reviews.
  - `Order`: Checkout details, customer shipping address, order items, timeline tracking milestones.
  - `Coupon`: Promotional codes with percentage/flat discounts and minimum spend thresholds.
  - `Subscriber`: VIP club member list with awarded coupon codes.

### 🐳 Docker & Containerization
- **Multi-stage Alpine Build**:
  - **Stage 1 (Builder)**: Builds optimized React 19 production bundle with Vite.
  - **Stage 2 (Runner)**: Light-weight Node 22 Alpine image serving both the Express 5 API and compiled frontend assets on a single unified port (`5000`).

---

## 🛠️ Tech Stack

- **Client**: React 19, Vite, Lucide Icons, Canvas Confetti, Vanilla CSS Design System
- **Server**: Node.js, Express 5, CORS, Dotenv, Concurrently
- **Database**: MongoDB Atlas, Mongoose 8 (with fallback to JSON file storage)
- **DevOps**: Docker, Multi-stage Builds, Render Cloud Hosting

---

## 💻 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your MongoDB Atlas URI:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/lumen-luxe?retryWrites=true&w=majority
```
*(If left empty, the application automatically runs using local JSON files).*

### 3. Run Development Mode
Runs both Express backend on port `5000` and Vite frontend on port `5173`:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🐳 Docker Setup & Local Testing

### 1. Build the Docker Image
```bash
docker build -t lumen-luxe .
```

### 2. Run the Container
```bash
docker run -d --name lumen-luxe-app -p 5000:5000 -e MONGODB_URI="your-mongodb-uri-if-any" lumen-luxe
```

### 3. Test in Browser
- Open [http://localhost:5000](http://localhost:5000)
- Check Health API: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Check Container Logs
```bash
docker logs -f lumen-luxe-app
```

### 5. Stop the Container
```bash
docker stop lumen-luxe-app
docker rm lumen-luxe-app
```

---

## ☁️ Deploying to Render (Docker Web Service)

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add Docker and MongoDB configuration"
   git push origin main
   ```

2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository `DEVOPS-2026-CS-E-20`.
5. Configure the deployment settings:
   - **Name**: `lumen-luxe`
   - **Region**: Oregon (US West) or closest region
   - **Branch**: `main`
   - **Language / Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lumen-luxe?retryWrites=true&w=majority` *(optional, for persistent cloud DB)*
7. Click **Deploy Web Service**.
8. Once deployed, Render will provide your public URL (e.g. `https://lumen-luxe.onrender.com`).

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
├── Dockerfile                 # Multi-stage production Docker build
├── .dockerignore              # Ignore unnecessary build context
├── .env.example               # Example environment variables
├── server/
│   ├── server.js              # Express app & static server
│   ├── config/
│   │   ├── db.js              # MongoDB Mongoose connection manager
│   │   └── seed.js            # Initial dataset seeder
│   ├── models/
│   │   ├── Product.js         # Product Mongoose schema
│   │   ├── Order.js           # Order Mongoose schema
│   │   ├── Coupon.js          # Coupon Mongoose schema
│   │   └── Subscriber.js      # Newsletter Mongoose schema
│   ├── data/
│   │   ├── db.js              # JSON file persistence manager (fallback)
│   │   ├── products.json      # Product catalog dataset
│   │   ├── orders.json        # Orders dataset
│   │   ├── coupons.json       # Coupons dataset
│   │   └── subscribers.json   # Newsletter dataset
│   └── routes/
│       ├── productRoutes.js   # Product catalog CRUD & reviews
│       ├── orderRoutes.js     # Order placement & status updates
│       ├── couponRoutes.js    # Promo code validation
│       ├── newsletterRoutes.js# Newsletter subscription
│       ├── adminRoutes.js     # Store operations & analytics
│       └── healthRoutes.js    # Health monitor & DB status
├── src/
│   ├── components/            # UI components (Navbar, Hero, Modals, etc.)
│   ├── context/               # Global state (ShopContext)
│   ├── services/api.js        # API client
│   └── index.css              # Custom styling
└── package.json
```
