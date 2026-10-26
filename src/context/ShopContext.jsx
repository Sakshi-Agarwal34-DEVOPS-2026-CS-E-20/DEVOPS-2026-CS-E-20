import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS, CURRENCIES, COUPONS } from '../data/products';
import api from '../services/api';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lumen_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lumen_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Currency state
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('lumen_currency') || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('lumen_currency', currency);
  }, [currency]);

  const formatPrice = (amountInUSD) => {
    const curr = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = amountInUSD * curr.rate;
    return `${curr.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Backend connection status & products state
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [serverConnected, setServerConnected] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const res = await api.getProducts();
      if (res.success && Array.isArray(res.products) && res.products.length > 0) {
        setProducts(res.products);
        setServerConnected(true);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err) {
      console.warn('Backend server unavailable, running in local resilience mode:', err.message);
      setProducts(INITIAL_PRODUCTS);
      setServerConnected(false);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('lumen_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lumen_cart', JSON.stringify(cart));
  }, [cart]);

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('lumen_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lumen_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Orders state
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('lumen_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lumen_orders', JSON.stringify(orders));
  }, [orders]);

  // Fetch orders from backend on mount if available
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await api.getOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch {
        // use local storage fallback
      }
    };
    loadOrders();
  }, []);

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (product, quantity = 1, color = null, size = null) => {
    const selectedColor = color || (product.colors && product.colors.length > 0 ? product.colors[0].name : null);
    const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
    const itemKey = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.itemKey === itemKey);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            itemKey,
            product,
            quantity,
            selectedColor,
            selectedSize,
          },
        ];
      }
    });

    addToast(`Added "${product.name}" to cart`, 'success');
  };

  const removeFromCart = (itemKey) => {
    setCart((prevCart) => prevCart.filter((item) => item.itemKey !== itemKey));
    addToast('Item removed from cart', 'info');
  };

  const updateQuantity = (itemKey, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.itemKey === itemKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        addToast(`Removed "${product.name}" from wishlist`, 'info');
        return prev.filter((p) => p.id !== product.id);
      } else {
        addToast(`Saved "${product.name}" to wishlist`, 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Coupon handling with backend validation
  const applyCouponCode = async (code) => {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await api.validateCoupon(cleanCode, cartSubtotal);
      if (res.success) {
        setAppliedCoupon({ code: cleanCode, ...res.coupon, computedDiscount: res.discountAmount });
        addToast(res.message || `Promo code "${cleanCode}" applied!`, 'success');
        return { success: true };
      }
    } catch (error) {
      // Check local fallback
      if (COUPONS[cleanCode]) {
        setAppliedCoupon({ code: cleanCode, ...COUPONS[cleanCode] });
        addToast(`Promo code "${cleanCode}" applied successfully!`, 'success');
        return { success: true };
      }
      addToast(error.message || `Invalid promo code: "${code}"`, 'error');
      return { success: false, message: error.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Promo code removed', 'info');
  };

  // Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountPercent) {
      return (cartSubtotal * appliedCoupon.discountPercent) / 100;
    }
    if (appliedCoupon.discountAmount) {
      return Math.min(appliedCoupon.discountAmount, cartSubtotal);
    }
    return 0;
  }, [appliedCoupon, cartSubtotal]);

  const freeShippingThreshold = 100;
  const rawShippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 15;
  const shippingFee = appliedCoupon?.code === 'FREESHIP50' ? 0 : rawShippingFee;
  const estimatedTax = cartSubtotal > 0 ? (cartSubtotal - discountAmount) * 0.08 : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee + estimatedTax);
  const totalCartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Order Placement (Fullstack async integration)
  const placeOrder = async (customerDetails, paymentDetails) => {
    const orderPayload = {
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingFee,
      tax: estimatedTax,
      total: cartTotal,
      currency,
      customer: customerDetails,
      paymentMethod: paymentDetails.method || 'Credit Card (•••• 4242)',
      appliedCoupon: appliedCoupon?.code || null,
    };

    let placedOrder = null;
    try {
      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        placedOrder = res.order;
        setServerConnected(true);
      }
    } catch (err) {
      console.warn('Placing order locally due to offline server:', err.message);
    }

    // Local fallback order if server response was offline
    if (!placedOrder) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderId = `ORD-LUX-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
      const trackingNumber = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const now = new Date();
      placedOrder = {
        orderId,
        trackingNumber,
        date: now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        ...orderPayload,
        status: 'Processing',
        carrier: 'FedEx Express Priority',
        estimatedDelivery: '3 - 5 Business Days',
        trackingSteps: [
          { status: 'Order Placed', time: 'Just now', completed: true },
          { status: 'Processing & Packaging', time: 'In Progress', completed: true, current: true },
          { status: 'Shipped from Fulfillment Hub', time: 'Pending', completed: false },
          { status: 'In Transit', time: 'Pending', completed: false },
          { status: 'Out for Delivery', time: 'Pending', completed: false },
          { status: 'Delivered', time: 'Pending', completed: false },
        ],
      };
    }

    setOrders((prev) => [placedOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    fetchProducts(); // Refresh stock
    return placedOrder;
  };

  // Submit product review (Fullstack async integration)
  const addReviewToProduct = async (productId, reviewData) => {
    try {
      const res = await api.submitReview(productId, reviewData);
      if (res.success && res.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? res.product : p))
        );
        if (quickViewProduct && quickViewProduct.id === productId) {
          setQuickViewProduct(res.product);
        }
        addToast('Thank you! Your verified review was posted.', 'success');
        return { success: true, product: res.product };
      }
    } catch (err) {
      // Local fallback
      const localRev = {
        id: `rev-${Date.now()}`,
        author: reviewData.author,
        rating: Number(reviewData.rating),
        date: 'Just now',
        comment: reviewData.comment,
      };

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const reviews = [localRev, ...(p.reviews || [])];
            const sum = reviews.reduce((a, r) => a + r.rating, 0);
            return {
              ...p,
              reviews,
              reviewCount: reviews.length,
              rating: Number((sum / reviews.length).toFixed(1)),
            };
          }
          return p;
        })
      );

      if (quickViewProduct && quickViewProduct.id === productId) {
        setQuickViewProduct((prev) => {
          const reviews = [localRev, ...(prev.reviews || [])];
          const sum = reviews.reduce((a, r) => a + r.rating, 0);
          return {
            ...prev,
            reviews,
            reviewCount: reviews.length,
            rating: Number((sum / reviews.length).toFixed(1)),
          };
        });
      }

      addToast('Review submitted locally.', 'success');
      return { success: true };
    }
  };

  // Admin: Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? res.order : o))
        );
        if (activeTrackingOrder && activeTrackingOrder.orderId === orderId) {
          setActiveTrackingOrder(res.order);
        }
        addToast(`Order ${orderId} updated to "${newStatus}"`, 'success');
        return { success: true };
      }
    } catch (err) {
      // Local fallback
      setOrders((prev) =>
        prev.map((o) => {
          if (o.orderId === orderId) {
            return {
              ...o,
              status: newStatus,
              trackingSteps: (o.trackingSteps || []).map((s) => ({
                ...s,
                completed: s.status === newStatus || s.completed,
              })),
            };
          }
          return o;
        })
      );
      addToast(`Status updated to ${newStatus}`, 'info');
    }
  };

  // Admin: Add new product
  const addProduct = async (productData) => {
    try {
      const res = await api.createProduct(productData);
      if (res.success && res.product) {
        setProducts((prev) => [res.product, ...prev]);
        addToast(`Product "${res.product.name}" created!`, 'success');
        return { success: true, product: res.product };
      }
    } catch (err) {
      const localProduct = {
        id: `prod-${Date.now().toString(36)}`,
        ...productData,
        price: Number(productData.price),
        stockCount: Number(productData.stockCount) || 20,
        inStock: true,
        rating: 5.0,
        reviewCount: 0,
        badge: 'New Drop',
        badgeType: 'new',
        images: productData.images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      };
      setProducts((prev) => [localProduct, ...prev]);
      addToast(`Product created locally!`, 'success');
      return { success: true, product: localProduct };
    }
  };

  // Admin: Update product stock or info
  const updateProduct = async (productId, updates) => {
    try {
      const res = await api.updateProduct(productId, updates);
      if (res.success && res.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? res.product : p))
        );
        addToast(`Updated ${res.product.name}`, 'success');
        return { success: true };
      }
    } catch (err) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
      );
      addToast('Product updated locally', 'info');
    }
  };

  // Admin: Delete product
  const deleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addToast('Product deleted from inventory', 'info');
    } catch (err) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addToast('Product deleted locally', 'info');
    }
  };

  // Newsletter subscribe
  const subscribeNewsletter = async (email) => {
    try {
      const res = await api.subscribeNewsletter(email);
      addToast(res.message || 'Subscribed! Check your inbox for 15% off code.', 'success');
      return { success: true, coupon: res.coupon || 'WELCOME15' };
    } catch {
      addToast('Subscribed! Check your inbox for 15% off code.', 'success');
      return { success: true, coupon: 'WELCOME15' };
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 500]);
    setMinRating(0);
    setSortBy('featured');
    setInStockOnly(false);
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCategory = product.categoryName?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        const matchesTagline = product.tagline?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc && !matchesTagline) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Rating filter
      if ((product.rating || 0) < minRating) {
        return false;
      }

      // In Stock filter
      if (inStockOnly && (!product.inStock || product.stockCount === 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return (b.badge === 'New Drop' || b.badge === 'New' ? 1 : 0) - (a.badge === 'New Drop' || a.badge === 'New' ? 1 : 0);
      return 0; // 'featured'
    });
  }, [products, searchQuery, selectedCategory, priceRange, minRating, sortBy, inStockOnly]);

  return (
    <ShopContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        formatPrice,
        products,
        isLoadingProducts,
        serverConnected,
        fetchProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        discountAmount,
        shippingFee,
        estimatedTax,
        cartTotal,
        totalCartCount,
        freeShippingThreshold,
        wishlist,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        minRating,
        setMinRating,
        sortBy,
        setSortBy,
        inStockOnly,
        setInStockOnly,
        resetFilters,
        filteredProducts,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        isAdminOpen,
        setIsAdminOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        activeTrackingOrder,
        setActiveTrackingOrder,
        quickViewProduct,
        setQuickViewProduct,
        orders,
        placeOrder,
        addReviewToProduct,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        subscribeNewsletter,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContext;

