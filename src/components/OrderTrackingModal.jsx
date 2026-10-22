import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  MapPin,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import api from '../services/api';

export const OrderTrackingModal = () => {
  const {
    isTrackingOpen,
    setIsTrackingOpen,
    activeTrackingOrder,
    setActiveTrackingOrder,
    orders,
    formatPrice,
    addToast,
  } = useShop();

  const [lookupQuery, setLookupQuery] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (activeTrackingOrder) {
      setCurrentOrder(activeTrackingOrder);
    } else if (orders.length > 0 && !currentOrder) {
      setCurrentOrder(orders[0]);
    }
  }, [activeTrackingOrder, orders]);

  if (!isTrackingOpen) return null;

  const handleCopyTracking = (num) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    addToast('Tracking number copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.getOrderById(lookupQuery.trim());
      if (res.success && res.order) {
        setCurrentOrder(res.order);
        setActiveTrackingOrder(res.order);
        addToast('Order details retrieved successfully', 'success');
      }
    } catch {
      // Look up locally
      const local = orders.find(
        (o) =>
          o.orderId.toLowerCase() === lookupQuery.trim().toLowerCase() ||
          o.trackingNumber?.toLowerCase() === lookupQuery.trim().toLowerCase()
      );
      if (local) {
        setCurrentOrder(local);
        setActiveTrackingOrder(local);
        addToast('Order found in local records', 'success');
      } else {
        addToast(`No order found matching "${lookupQuery}"`, 'error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const steps = currentOrder?.trackingSteps || [
    { status: 'Order Placed', time: currentOrder?.date || 'Today', completed: true },
    { status: 'Processing & Packaging', time: 'In Progress', completed: true, current: true },
    { status: 'Shipped from Fulfillment Hub', time: 'Pending', completed: false },
    { status: 'In Transit', time: 'Pending', completed: false },
    { status: 'Out for Delivery', time: 'Pending', completed: false },
    { status: 'Delivered', time: 'Pending', completed: false },
  ];

  return (
    <div className="modal-backdrop" onClick={() => setIsTrackingOpen(false)} role="dialog" aria-modal="true">
      <div
        className="modal-card"
        style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Live Shipment Tracking
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Real-time carrier logistics & dispatch updates
              </div>
            </div>
          </div>

          <button className="modal-close-btn" style={{ position: 'static' }} onClick={() => setIsTrackingOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Search Order Bar */}
        <form onSubmit={handleSearchOrder} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by Order ID (e.g. ORD-LUX-...) or Tracking #"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}>
            <Search size={16} /> Track
          </button>
        </form>

        {currentOrder ? (
          <div>
            {/* Status Highlight Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CURRENT STATUS
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {currentOrder.status || 'Processing'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Estimated Delivery: <strong style={{ color: 'var(--accent-emerald)' }}>{currentOrder.estimatedDelivery || '3 - 5 Days'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Carrier: {currentOrder.carrier || 'FedEx Express Priority'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <code style={{ background: 'var(--bg-card)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 700 }}>
                      {currentOrder.trackingNumber || 'TRK-984210984'}
                    </code>
                    <button
                      className="nav-icon-btn"
                      style={{ width: '28px', height: '28px' }}
                      onClick={() => handleCopyTracking(currentOrder.trackingNumber || 'TRK-984210984')}
                      title="Copy Tracking #"
                    >
                      {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Progression Timeline */}
            <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Shipment Milestones
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                {steps.map((step, idx) => {
                  const isLast = idx === steps.length - 1;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', position: 'relative' }}>
                      {/* Vertical line */}
                      {!isLast && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '13px',
                            top: '26px',
                            bottom: '-20px',
                            width: '2px',
                            background: step.completed ? 'var(--primary)' : 'var(--border-subtle)',
                            zIndex: 1,
                          }}
                        />
                      )}

                      {/* Step Circle */}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: step.completed
                            ? 'var(--primary)'
                            : 'var(--bg-card-subtle)',
                          color: step.completed ? '#fff' : 'var(--text-muted)',
                          border: step.completed ? 'none' : '2px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          flexShrink: 0,
                          boxShadow: step.current ? '0 0 12px var(--primary)' : 'none',
                        }}
                      >
                        {step.completed ? <Check size={16} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} />}
                      </div>

                      {/* Step Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: step.completed ? 700 : 500, color: step.completed ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.92rem' }}>
                            {step.status}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {step.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Destination Address & Summary */}
            <div style={{ background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <MapPin size={16} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Delivery Address</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {currentOrder.customer?.firstName} {currentOrder.customer?.lastName} &bull; {currentOrder.customer?.address}, {currentOrder.customer?.city}, {currentOrder.customer?.postalCode}, {currentOrder.customer?.country}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Enter an Order ID above to track package location.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingModal;
