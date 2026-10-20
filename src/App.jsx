import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ValueProps } from './components/ValueProps';
import { CategoryPills } from './components/CategoryPills';
import { FiltersSidebar } from './components/FiltersSidebar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminModal } from './components/AdminModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { ArrowUpDown, SlidersHorizontal, Sparkles, XCircle } from 'lucide-react';

const MainShopContent = () => {
  const {
    filteredProducts,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    resetFilters,
    selectedCategory,
  } = useShop();

  return (
    <main className="container" id="product-catalog">
      {/* Category Selection Bar */}
      <CategoryPills />

      {/* Catalog Layout */}
      <div className="store-layout">
        {/* Left Filter Sidebar */}
        <FiltersSidebar />

        {/* Right Product Grid Section */}
        <section aria-label="Product Catalog">
          {/* Header Controls: Count & Sort Selector */}
          <div className="store-header-bar">
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Curated Catalog</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  ({filteredProducts.length} items)
                </span>
              </h2>
              {searchQuery && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Results for: "<strong>{searchQuery}</strong>"</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ color: 'var(--accent-rose)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <XCircle size={14} /> Clear
                  </button>
                </div>
              )}
            </div>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ArrowUpDown size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort by:</span>
              <select
                className="currency-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '0.45rem 0.85rem' }}
                aria-label="Sort products"
              >
                <option value="featured">Featured & Best Picks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Drops</option>
              </select>
            </div>
          </div>

          {/* Product Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '4rem 2rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <SlidersHorizontal size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Matching Products Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                Try adjusting your search keywords, category filters, or price range.
              </p>
              <button className="btn-primary" onClick={resetFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <div className="app-root">
        {/* Top Promotional Bar */}
        <AnnouncementBar />

        {/* Navigation */}
        <Navbar />

        {/* Hero Spotlight */}
        <HeroSection />

        {/* Value Propositions / Store Trust Badges */}
        <ValueProps />

        {/* Main Catalog & Shopping Flow */}
        <MainShopContent />

        {/* Global Modals & Drawers */}
        <ProductDetailModal />
        <CartDrawer />
        <WishlistDrawer />
        <CheckoutModal />
        <OrderHistoryModal />
        <OrderTrackingModal />
        <AdminModal />
        <ToastContainer />

        {/* Footer */}
        <Footer />
      </div>
    </ShopProvider>
  );
}
