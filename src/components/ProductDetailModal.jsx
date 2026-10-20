import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Sparkles,
  Send,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ProductDetailModal = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    addToast,
    addReviewToProduct,
  } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews'

  // Review submission state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setActiveImageIndex(0);
      setQuantity(1);
      setSelectedColor(
        quickViewProduct.colors && quickViewProduct.colors.length > 0
          ? quickViewProduct.colors[0].name
          : null
      );
      setSelectedSize(
        quickViewProduct.sizes && quickViewProduct.sizes.length > 0
          ? quickViewProduct.sizes[0]
          : null
      );
      setReviewsList(quickViewProduct.reviews || []);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isSaved = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, selectedColor, selectedSize);
    setQuickViewProduct(null);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      addToast('Please fill out all review fields', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReviewToProduct(quickViewProduct.id, {
        author: newReviewAuthor.trim(),
        rating: Number(newReviewRating),
        comment: newReviewComment.trim(),
      });
      setReviewsList((prev) => [
        {
          id: `rev-${Date.now()}`,
          author: newReviewAuthor.trim(),
          rating: Number(newReviewRating),
          date: 'Just now',
          comment: newReviewComment.trim(),
        },
        ...prev,
      ]);
      setNewReviewAuthor('');
      setNewReviewComment('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setQuickViewProduct(null)}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close product modal"
        >
          <X size={20} />
        </button>

        <div className="product-detail-grid">
          {/* Left: Gallery */}
          <div>
            <img
              src={quickViewProduct.images[activeImageIndex] || quickViewProduct.images[0]}
              alt={quickViewProduct.name}
              className="gallery-main-img"
            />
            {quickViewProduct.images && quickViewProduct.images.length > 1 && (
              <div className="gallery-thumbs">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`gallery-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt="" className="gallery-thumb-img" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick guarantees */}
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={16} color="var(--primary)" />
                <span>Free shipping on all orders over $100</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--accent-emerald)" />
                <span>2-Year Authentic Manufacturer Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={16} color="var(--accent-cyan)" />
                <span>Hassle-free 30-day exchange window</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Controls */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="product-category-tag" style={{ margin: 0 }}>
                {quickViewProduct.categoryName}
              </span>
              {quickViewProduct.badge && (
                <span className="badge badge-hot">{quickViewProduct.badge}</span>
              )}
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {quickViewProduct.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              {quickViewProduct.tagline}
            </p>

            {/* Rating and Stock */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div className="product-rating" style={{ margin: 0 }}>
                <Star size={16} fill="currentColor" />
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{quickViewProduct.rating}</span>
                <span className="rating-count">({reviewsList.length} verified reviews)</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                ● In Stock ({quickViewProduct.stockCount} units available)
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {formatPrice(quickViewProduct.price)}
              </span>
              {quickViewProduct.originalPrice && (
                <span
                  style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatPrice(quickViewProduct.originalPrice)}
                </span>
              )}
              {quickViewProduct.discount && (
                <span className="badge badge-sale">SAVE {quickViewProduct.discount}%</span>
              )}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {quickViewProduct.description}
            </p>

            {/* Color Swatches */}
            {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
              <div className="swatch-group">
                <div className="swatch-label">
                  COLOR: <strong style={{ color: 'var(--text-primary)' }}>{selectedColor}</strong>
                </div>
                <div className="color-swatches">
                  {quickViewProduct.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`color-swatch ${selectedColor === color.name ? 'active' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
              <div className="swatch-group">
                <div className="swatch-label">
                  SELECT OPTION: <strong style={{ color: 'var(--text-primary)' }}>{selectedSize}</strong>
                </div>
                <div className="size-chips">
                  {quickViewProduct.sizes.map((size, idx) => (
                    <button
                      key={idx}
                      className={`size-chip ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="qty-counter" style={{ padding: '0.2rem' }}>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qty-value" style={{ width: '40px' }}>
                  {quantity}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className="btn-primary"
                style={{ flex: 1, padding: '0.85rem 1.5rem' }}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} />
                <span>Add to Cart &bull; {formatPrice(quickViewProduct.price * quantity)}</span>
              </button>

              <button
                className={`btn-icon ${isSaved ? 'active' : ''}`}
                style={{ width: '48px', height: '48px' }}
                onClick={() => toggleWishlist(quickViewProduct)}
                title="Save to Wishlist"
              >
                <Heart size={20} fill={isSaved ? 'var(--accent-rose)' : 'none'} color={isSaved ? 'var(--accent-rose)' : 'currentColor'} />
              </button>
            </div>

            {/* Detail Tabs */}
            <div className="detail-tabs-header">
              <button
                className={`detail-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Specifications
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({reviewsList.length})
              </button>
            </div>

            {/* Tab: Specs */}
            {activeTab === 'specs' && (
              <table className="specs-table">
                <tbody>
                  {quickViewProduct.specs &&
                    Object.entries(quickViewProduct.specs).map(([key, val]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{val}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="review-item">
                      <div className="review-author-row">
                        <span className="review-author">{rev.author}</span>
                        <span className="review-date">{rev.date}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--accent-amber)', marginBottom: '0.3rem' }}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Write Review Form */}
                <form onSubmit={handleAddReview} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Leave a Verified Customer Review
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="form-input"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                    />
                    <select
                      className="form-input"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    >
                      <option value="5">★★★★★ (5 Stars)</option>
                      <option value="4">★★★★☆ (4 Stars)</option>
                      <option value="3">★★★☆☆ (3 Stars)</option>
                      <option value="2">★★☆☆☆ (2 Stars)</option>
                      <option value="1">★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Share your thoughts about this product..."
                      className="form-input"
                      style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      <Send size={14} /> Post
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
