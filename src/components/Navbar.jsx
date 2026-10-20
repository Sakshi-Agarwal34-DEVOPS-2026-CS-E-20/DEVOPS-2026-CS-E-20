import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Sun,
  Moon,
  Package,
  X,
  Sparkles,
  Zap,
  Check,
  Truck,
  SlidersHorizontal,
  Activity,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CURRENCIES } from '../data/products';

export const Navbar = () => {
  const {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    totalCartCount,
    wishlist,
    orders,
    products,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsOrderHistoryOpen,
    setIsAdminOpen,
    setIsTrackingOpen,
    serverConnected,
    searchQuery,
    setSearchQuery,
    setQuickViewProduct,
    formatPrice
  } = useShop();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSuggestions = searchQuery.trim()
    ? (products || []).filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="navbar-sticky">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="brand-icon-wrap">
            <Zap size={22} />
          </div>
          <span>
            LUMEN <span className="gradient-text">LUXE</span>
          </span>
        </a>

        {/* Live Search Bar */}
        <div className="search-container" ref={searchRef}>
          <div className="search-input-wrap">
            <Search size={18} className="search-icon-left" />
            <input
              type="text"
              className="search-input"
              placeholder="Search premium audio, fashion, smart gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              aria-label="Search products"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="search-dropdown animate-fade-in">
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                MATCHING PRODUCTS ({searchSuggestions.length})
              </div>
              {searchSuggestions.map((item) => (
                <div
                  key={item.id}
                  className="search-result-item"
                  onClick={() => {
                    setQuickViewProduct(item);
                    setIsSearchFocused(false);
                  }}
                >
                  <img src={item.images[0]} alt={item.name} className="search-result-thumb" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {item.categoryName} &bull; {formatPrice(item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Group */}
        <div className="nav-actions">
          {/* Live Order Tracking Trigger */}
          <button
            className="nav-icon-btn"
            onClick={() => setIsTrackingOpen(true)}
            title="Track Package Shipment"
            aria-label="Track Shipment"
          >
            <Truck size={18} />
          </button>

          {/* Admin Operations Hub */}
          <button
            className="nav-icon-btn"
            onClick={() => setIsAdminOpen(true)}
            title="Store Operations & Admin Hub"
            aria-label="Open Store Admin Hub"
            style={{ position: 'relative' }}
          >
            <SlidersHorizontal size={18} />
            <span
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: serverConnected ? 'var(--accent-emerald)' : '#f59e0b',
                boxShadow: serverConnected ? '0 0 6px var(--accent-emerald)' : 'none',
              }}
            />
          </button>

          {/* Currency Switcher */}
          <select
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Select Currency"
          >
            {Object.keys(CURRENCIES).map((curr) => (
              <option key={curr} value={curr}>
                {CURRENCIES[curr].name}
              </option>
            ))}
          </select>

          {/* Theme Toggle Button */}
          <button
            className="nav-icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Dark/Light Theme"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Order History */}
          <button
            className="nav-icon-btn"
            onClick={() => setIsOrderHistoryOpen(true)}
            title="Order History"
            aria-label="View Order History"
          >
            <Package size={19} />
            {orders.length > 0 && (
              <span className="nav-badge-count" style={{ background: 'var(--accent-emerald)' }}>
                {orders.length}
              </span>
            )}
          </button>

          {/* Wishlist */}
          <button
            className="nav-icon-btn"
            onClick={() => setIsWishlistOpen(true)}
            title="Saved Wishlist"
            aria-label="View Wishlist"
          >
            <Heart size={19} />
            {wishlist.length > 0 && (
              <span className="nav-badge-count">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            className="nav-icon-btn btn-primary"
            style={{ width: 'auto', padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-full)' }}
            onClick={() => setIsCartOpen(true)}
            title="Shopping Cart"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cart</span>
            {totalCartCount > 0 && (
              <span
                style={{
                  background: '#ffffff',
                  color: 'var(--primary)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  marginLeft: '0.25rem'
                }}
              >
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
