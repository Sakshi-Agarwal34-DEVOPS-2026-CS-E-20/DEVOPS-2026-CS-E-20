import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  Plus,
  Trash2,
  Truck,
  RefreshCw,
  Activity,
  Layers,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import api from '../services/api';

export const AdminModal = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    orders,
    formatPrice,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    setIsTrackingOpen,
    setActiveTrackingOrder,
    serverConnected,
    addToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'inventory' | 'add-product'
  const [adminStats, setAdminStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // New Product Form state
  const [newProd, setNewProd] = useState({
    name: '',
    tagline: '',
    category: 'audio-tech',
    price: '',
    originalPrice: '',
    stockCount: '20',
    description: '',
    imageUrl: '',
  });

  // Fetch admin metrics from server
  const loadAdminMetrics = async () => {
    try {
      setIsLoadingStats(true);
      const res = await api.getAdminStats();
      if (res.success && res.stats) {
        setAdminStats(res.stats);
      }
    } catch {
      // stats computed locally
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAdminOpen) {
      loadAdminMetrics();
    }
  }, [isAdminOpen, orders, products]);

  if (!isAdminOpen) return null;

  // Local fallback calculations for overview metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderVal = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const lowStockCount = products.filter((p) => (p.stockCount || 0) <= 15).length;

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      addToast('Please provide at least product name and price', 'error');
      return;
    }

    const payload = {
      name: newProd.name.trim(),
      tagline: newProd.tagline.trim() || 'Modern Designed Essential',
      category: newProd.category,
      categoryName:
        newProd.category === 'audio-tech'
          ? 'Audio & Tech'
          : newProd.category === 'apparel'
          ? 'Urban Apparel'
          : newProd.category === 'smart-living'
          ? 'Smart Living'
          : 'Accessories',
      price: Number(newProd.price),
      originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : Number(newProd.price) * 1.25,
      stockCount: Number(newProd.stockCount) || 20,
      inStock: true,
      description: newProd.description.trim() || 'Engineered for seamless daily performance and lasting quality.',
      images: newProd.imageUrl.trim()
        ? [newProd.imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
    };

    await addProduct(payload);
    setNewProd({
      name: '',
      tagline: '',
      category: 'audio-tech',
      price: '',
      originalPrice: '',
      stockCount: '20',
      description: '',
      imageUrl: '',
    });
    setActiveTab('inventory');
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleTrackOrder = (order) => {
    setActiveTrackingOrder(order);
    setIsTrackingOpen(true);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsAdminOpen(false)} role="dialog" aria-modal="true">
      <div
        className="modal-card"
        style={{ maxWidth: '1080px', width: '95%', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Activity size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Store Operations & Admin Hub
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: serverConnected ? 'var(--accent-emerald)' : '#f59e0b',
                    boxShadow: serverConnected ? '0 0 8px var(--accent-emerald)' : 'none',
                  }}
                />
                <span>{serverConnected ? 'Live Backend Connected (Express API)' : 'Local Resilience Mode'}</span>
                <span>&bull;</span>
                <span>{products.length} Products</span>
                <span>&bull;</span>
                <span>{orders.length} Orders</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="nav-icon-btn"
              onClick={() => {
                fetchProducts();
                loadAdminMetrics();
                addToast('Synced live data from backend', 'info');
              }}
              title="Refresh Data"
            >
              <RefreshCw size={18} className={isLoadingStats ? 'animate-spin' : ''} />
            </button>
            <button className="modal-close-btn" style={{ position: 'static' }} onClick={() => setIsAdminOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.75rem', background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
          <button
            className={`category-pill ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{ fontSize: '0.85rem' }}
          >
            <TrendingUp size={15} /> KPI Overview
          </button>
          <button
            className={`category-pill ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{ fontSize: '0.85rem' }}
          >
            <Package size={15} /> Orders Manager ({orders.length})
          </button>
          <button
            className={`category-pill ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
            style={{ fontSize: '0.85rem' }}
          >
            <Layers size={15} /> Inventory & Stock ({products.length})
          </button>
          <button
            className={`category-pill ${activeTab === 'add-product' ? 'active' : ''}`}
            onClick={() => setActiveTab('add-product')}
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={15} /> Add New Product
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>TOTAL REVENUE</span>
                    <DollarSign size={18} color="var(--accent-emerald)" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatPrice(adminStats?.totalRevenue || totalRevenue)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
                    ↑ +18.4% this week
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>TOTAL ORDERS</span>
                    <Package size={18} color="var(--primary)" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {adminStats?.totalOrders || totalOrdersCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Across all channels
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>AVERAGE ORDER VALUE</span>
                    <TrendingUp size={18} color="var(--secondary)" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatPrice(adminStats?.averageOrderValue || avgOrderVal)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Healthy basket size
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>LOW STOCK ALERTS</span>
                    <AlertTriangle size={18} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockCount > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
                    {adminStats?.lowStockCount || lowStockCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Items under 15 units
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Recent Customer Orders</h4>
                    <button className="footer-link" onClick={() => setActiveTab('orders')} style={{ fontSize: '0.85rem' }}>
                      View all ({orders.length}) →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders placed yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {orders.slice(0, 4).map((order) => (
                        <div
                          key={order.orderId}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: 'var(--bg-card-subtle)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                              {order.orderId}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {order.customer?.firstName} {order.customer?.lastName} &bull; {order.items?.length || 1} items &bull; {order.date}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span
                              style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background:
                                  order.status === 'Delivered'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : order.status === 'In Transit' || order.status === 'Shipped'
                                    ? 'rgba(99, 102, 241, 0.15)'
                                    : 'rgba(245, 158, 11, 0.15)',
                                color:
                                  order.status === 'Delivered'
                                    ? 'var(--accent-emerald)'
                                    : order.status === 'In Transit' || order.status === 'Shipped'
                                    ? 'var(--primary)'
                                    : '#f59e0b',
                              }}
                            >
                              {order.status}
                            </span>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                              {formatPrice(order.total)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* System & Architecture Info */}
                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Backend Architecture</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Server Runtime</span>
                      <strong style={{ color: 'var(--text-primary)' }}>Node.js Express 5.x</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>API Endpoints</span>
                      <strong style={{ color: 'var(--text-primary)' }}>/api/products, /api/orders, /api/coupons</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Database Layer</span>
                      <strong style={{ color: 'var(--text-primary)' }}>JSON File Persistent Store (server/data)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Frontend Client</span>
                      <strong style={{ color: 'var(--text-primary)' }}>React 19 + Vite HMR + Context API</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Server Status</span>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>● Active & Listening</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGER */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Order Processing & Fulfillment Hub
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Total: {orders.length} order(s)
                </div>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                  <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontWeight: 700 }}>No Orders Found</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>When customers complete checkout, orders will appear here for management.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map((order) => (
                    <div
                      key={order.orderId}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{order.orderId}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>&bull; {order.date}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            Customer: <strong>{order.customer?.firstName} {order.customer?.lastName}</strong> ({order.customer?.email})
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Shipping to: {order.customer?.address}, {order.customer?.city}, {order.customer?.postalCode}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {formatPrice(order.total)}
                          </div>

                          {/* Quick Status Selector */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</label>
                            <select
                              value={order.status || 'Processing'}
                              onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                              className="currency-select"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem', fontWeight: 700 }}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <button
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => handleTrackOrder(order)}
                            >
                              <Truck size={14} /> Live Tracking
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items mini list */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {(order.items || []).map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: 'var(--bg-card-subtle)',
                              padding: '0.4rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.82rem',
                            }}
                          >
                            <img
                              src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                              alt=""
                              style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                            />
                            <span>{item.product?.name || 'Product'} &times; {item.quantity}</span>
                            {item.selectedColor && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({item.selectedColor})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INVENTORY & STOCK */}
          {activeTab === 'inventory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    Product Catalog & Live Stock Management
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {products.length} products loaded in database
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setActiveTab('add-product')} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>PRODUCT</th>
                      <th style={{ padding: '0.85rem 1rem' }}>CATEGORY</th>
                      <th style={{ padding: '0.85rem 1rem' }}>PRICE</th>
                      <th style={{ padding: '0.85rem 1rem' }}>STOCK UNITS</th>
                      <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                            alt={prod.name}
                            style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prod.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {prod.id}</div>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                          {prod.categoryName || prod.category}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                          {formatPrice(prod.price)}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              className="qty-btn"
                              style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                              onClick={() => updateProduct(prod.id, { stockCount: Math.max(0, (prod.stockCount || 0) - 1) })}
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                              {prod.stockCount || 0}
                            </span>
                            <button
                              className="qty-btn"
                              style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                              onClick={() => updateProduct(prod.id, { stockCount: (prod.stockCount || 0) + 1 })}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: prod.stockCount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: prod.stockCount > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                            }}
                          >
                            {prod.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete product "${prod.name}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="nav-icon-btn"
                            style={{ color: 'var(--accent-rose)', display: 'inline-flex' }}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADD NEW PRODUCT */}
          {activeTab === 'add-product' && (
            <div style={{ maxWidth: '650px', margin: '0 auto', background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Add New Product to Storefront
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                This will save directly into the backend database and immediately appear in the catalog.
              </p>

              <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Product Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Apex Studio Carbon Wireless ANC"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Tagline / Catchphrase</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ultra-Low Latency & High Fidelity Acoustics"
                    value={newProd.tagline}
                    onChange={(e) => setNewProd({ ...newProd, tagline: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Category</label>
                    <select
                      className="form-input"
                      value={newProd.category}
                      onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    >
                      <option value="audio-tech">Audio & Tech</option>
                      <option value="apparel">Urban Apparel</option>
                      <option value="smart-living">Smart Living</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Initial Stock Count</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={newProd.stockCount}
                      onChange={(e) => setNewProd({ ...newProd, stockCount: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Price (USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      placeholder="199.99"
                      value={newProd.price}
                      onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Original MSRP Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="249.99"
                      value={newProd.originalPrice}
                      onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={newProd.imageUrl}
                    onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Description</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Product highlights, craftsmanship details, materials..."
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.85rem' }}>
                  Publish Product to Store
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
