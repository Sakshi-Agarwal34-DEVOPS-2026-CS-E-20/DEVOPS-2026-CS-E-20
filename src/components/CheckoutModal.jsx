import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Download,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useShop } from '../context/ShopContext';

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    discountAmount,
    shippingFee,
    estimatedTax,
    cartTotal,
    appliedCoupon,
    placeOrder,
    formatPrice,
    currency,
    setIsTrackingOpen,
    setActiveTrackingOrder,
  } = useShop();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Form states
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });

  const [paymentData, setPaymentData] = useState({
    method: 'Credit Card',
    cardNumber: '4242 •••• •••• 4242',
    cardName: 'ALEXANDER MORGAN',
    expiry: '08/28',
    cvv: '888',
  });

  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleAutofill = () => {
    setShippingData({
      firstName: 'Alexander',
      lastName: 'Morgan',
      email: 'alex.morgan@example.com',
      address: '742 Evergreen Terrace',
      city: 'San Francisco, CA',
      postalCode: '94107',
      country: 'United States',
    });
  };

  const handleNextToPayment = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalPlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessingOrder(true);
    try {
      const order = await placeOrder(shippingData, paymentData);
      setCompletedOrder(order);
      setStep(3);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep(1);
    setCompletedOrder(null);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="modal-close-btn" onClick={handleClose} aria-label="Close checkout">
          <X size={20} />
        </button>

        {/* Step Indicator */}
        <div className="checkout-steps">
          <div className={`checkout-step-node ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
            <span className="step-number">{step > 1 ? <CheckCircle size={16} /> : '1'}</span>
            <span>Shipping</span>
          </div>

          <div style={{ width: '40px', height: '2px', background: step > 1 ? 'var(--accent-emerald)' : 'var(--border-subtle)' }} />

          <div className={`checkout-step-node ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
            <span className="step-number">{step > 2 ? <CheckCircle size={16} /> : '2'}</span>
            <span>Payment</span>
          </div>

          <div style={{ width: '40px', height: '2px', background: step === 3 ? 'var(--accent-emerald)' : 'var(--border-subtle)' }} />

          <div className={`checkout-step-node ${step === 3 ? 'completed active' : ''}`}>
            <span className="step-number">3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* STEP 1: Shipping Details */}
        {step === 1 && (
          <form onSubmit={handleNextToPayment}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Shipping Information</h3>
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                onClick={handleAutofill}
              >
                <Zap size={14} /> Autofill Demo Info
              </button>
            </div>

            <div className="checkout-form-grid">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Alexander"
                  value={shippingData.firstName}
                  onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Morgan"
                  value={shippingData.lastName}
                  onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                />
              </div>

              <div className="form-group-full">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="alex.morgan@example.com"
                  value={shippingData.email}
                  onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                />
              </div>

              <div className="form-group-full">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="742 Evergreen Terrace, Apt 4B"
                  value={shippingData.address}
                  onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">City / State *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="San Francisco, CA"
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">ZIP / Postal Code *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="94107"
                  value={shippingData.postalCode}
                  onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                />
              </div>
            </div>

            {/* Total summary snippet */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.75rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount to Pay</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatPrice(cartTotal)}
                </div>
              </div>

              <button type="submit" className="btn-primary">
                <span>Continue to Payment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Payment */}
        {step === 2 && (
          <form onSubmit={handleFinalPlaceOrder}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Payment Method
            </h3>

            {/* Interactive Card Visualizer */}
            <div className="card-visualizer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  LUMEN VAULT SECURE
                </span>
                <CreditCard size={28} />
              </div>

              <div style={{ fontSize: '1.35rem', letterSpacing: '0.15em', fontWeight: 600, fontFamily: 'monospace', marginBottom: '1.5rem' }}>
                {paymentData.cardNumber}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.75, letterSpacing: '0.05em' }}>CARDHOLDER</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    {paymentData.cardName || 'YOUR NAME'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.75, letterSpacing: '0.05em' }}>EXPIRES</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    {paymentData.expiry}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Fields */}
            <div className="checkout-form-grid">
              <div className="form-group-full">
                <label className="form-label">Name on Card *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group-full">
                <label className="form-label">Card Number *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Expiration Date *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="MM/YY"
                  value={paymentData.expiry}
                  onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">CVV / CVC *</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  className="form-input"
                  placeholder="•••"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={18} /> Back
              </button>

              <button
                type="submit"
                disabled={isProcessingOrder}
                className="btn-primary"
                style={{ padding: '0.85rem 1.75rem', opacity: isProcessingOrder ? 0.7 : 1 }}
              >
                <ShieldCheck size={18} />
                <span>{isProcessingOrder ? 'Securing & Processing Order...' : `Pay ${formatPrice(cartTotal)} Now`}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Order Confirmation & Receipt */}
        {step === 3 && completedOrder && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '2px solid var(--accent-emerald)',
              }}
            >
              <CheckCircle size={40} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Order Confirmed & Placed!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Thank you, <strong>{completedOrder.customer?.firstName}</strong>. Your order has been recorded in the database and sent to fulfillment.
            </p>

            {/* Order details panel */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'left',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER NUMBER</div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>{completedOrder.orderId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TRACKING CODE</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{completedOrder.trackingNumber || 'TRK-984210984'}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  ORDERED ITEMS ({completedOrder.items?.length || 0})
                </div>
                {completedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', margin: '0.35rem 0' }}>
                    <span>{item.quantity}x {item.product?.name}</span>
                    <strong>{formatPrice((item.product?.price || 0) * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--accent-emerald)' }}>{formatPrice(completedOrder.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setActiveTrackingOrder(completedOrder);
                  handleClose();
                  setIsTrackingOpen(true);
                }}
                style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Truck size={18} />
                <span>Track Live Shipment</span>
              </button>

              <button
                className="btn-primary"
                onClick={handleClose}
                style={{ padding: '0.75rem 2rem' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
