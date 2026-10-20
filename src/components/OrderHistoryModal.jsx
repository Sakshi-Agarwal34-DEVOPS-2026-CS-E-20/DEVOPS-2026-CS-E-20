import React from 'react';
import { Package, X, Clock, CheckCircle2, ChevronRight, ShoppingBag, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const OrderHistoryModal = () => {
  const {
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    orders,
    formatPrice,
    setIsTrackingOpen,
    setActiveTrackingOrder,
  } = useShop();

  if (!isOrderHistoryOpen) return null;

  const handleTrackOrder = (order) => {
    setActiveTrackingOrder(order);
    setIsTrackingOpen(true);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsOrderHistoryOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-card"
        style={{ maxWidth: '680px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => setIsOrderHistoryOpen(false)}
          aria-label="Close order history"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <Package size={26} color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Your Orders & Shipments</h2>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Orders Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              You haven't placed any orders yet. Once you complete a purchase, it will appear here with live tracking.
            </p>
            <button
              className="btn-primary"
              onClick={() => setIsOrderHistoryOpen(false)}
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
            {orders.map((order) => (
              <div
                key={order.orderId}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORDER ID</span>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{order.orderId}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        background: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: order.status === 'Delivered' ? 'var(--accent-emerald)' : 'var(--primary)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      ● {order.status}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {order.date}
                    </div>
                  </div>
                </div>

                {/* Ordered Items Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                        alt={item.product?.name}
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, fontSize: '0.88rem' }}>
                        <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} {item.selectedColor ? `&bull; ${item.selectedColor}` : ''}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <button
                    className="btn-secondary"
                    onClick={() => handleTrackOrder(order)}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Truck size={15} /> Track Package
                  </button>

                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                    Total: <span style={{ color: 'var(--accent-emerald)' }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
