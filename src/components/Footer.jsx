import React, { useState } from 'react';
import { Zap, Send, ShieldCheck, Lock, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer = () => {
  const {
    setSelectedCategory,
    addToast,
    subscribeNewsletter,
    setIsTrackingOpen,
    setIsAdminOpen,
  } = useShop();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [rewardCoupon, setRewardCoupon] = useState('WELCOME15');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast('Please provide a valid email address', 'error');
      return;
    }
    const res = await subscribeNewsletter(email.trim());
    if (res.success) {
      setIsSubscribed(true);
      if (res.coupon) setRewardCoupon(res.coupon);
    }
  };

  const handleCategoryNav = (cat) => {
    setSelectedCategory(cat);
    const el = document.getElementById('product-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '1rem' }}>
              <div className="brand-icon-wrap">
                <Zap size={22} />
              </div>
              <span>
                LUMEN <span className="gradient-text">LUXE</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '320px', marginBottom: '1.25rem' }}>
              Curated everyday essentials, high-performance acoustics, and urban minimalist apparel engineered for the modern standard.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <Lock size={14} color="var(--accent-emerald)" />
              <span>256-bit Encrypted SSL Secure Checkout</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-heading">Collections</h4>
            <ul className="footer-links">
              <li>
                <button className="footer-link" onClick={() => handleCategoryNav('audio-tech')}>
                  Audio & Tech
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => handleCategoryNav('apparel')}>
                  Urban Apparel
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => handleCategoryNav('smart-living')}>
                  Smart Living
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => handleCategoryNav('accessories')}>
                  Luxury Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="footer-heading">Quick Services</h4>
            <ul className="footer-links">
              <li>
                <button className="footer-link" onClick={() => setIsTrackingOpen(true)}>
                  📦 Live Shipment Tracking
                </button>
              </li>
              <li>
                <button className="footer-link" onClick={() => setIsAdminOpen(true)}>
                  ⚙️ Store Operations & Admin
                </button>
              </li>
              <li><a href="#shipping" className="footer-link" onClick={(e) => { e.preventDefault(); addToast('Orders ship worldwide within 24-48 hours with FedEx Express Priority', 'info'); }}>Shipping & Delivery Info</a></li>
              <li><a href="#warranty" className="footer-link" onClick={(e) => { e.preventDefault(); addToast('All products include our 2-Year Comprehensive Warranty', 'info'); }}>2-Year Warranty Portal</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="footer-heading">Stay Connected</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              Join the LUMEN Club for secret drops, 15% off your first order, and priority access.
            </p>

            {isSubscribed ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontWeight: 600 }}>
                ✓ You are on the VIP access list! Use promo code <strong>{rewardCoupon}</strong> at checkout.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="footer-newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="form-input"
                  style={{ padding: '0.65rem 0.85rem', fontSize: '0.88rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1rem' }} aria-label="Subscribe">
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} LUMEN LUXE Inc. All rights reserved. Designed for excellence.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
