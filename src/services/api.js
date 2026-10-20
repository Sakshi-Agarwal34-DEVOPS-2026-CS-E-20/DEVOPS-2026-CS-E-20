// API Client for LUMEN LUXE Full-Stack E-Commerce

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.warn(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${queryString}`);
  },

  getCategories: () => request('/products/categories'),

  getProductById: (id) => request(`/products/${id}`),

  submitReview: (productId, reviewData) =>
    request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },

  getOrderById: (orderId) => request(`/orders/${orderId}`),

  createOrder: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  updateOrderStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Coupons
  validateCoupon: (code, subtotal) =>
    request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),

  getCoupons: () => request('/coupons'),

  // Newsletter
  subscribeNewsletter: (email) =>
    request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Admin & Analytics
  getAdminStats: () => request('/admin/stats'),
};

export default api;
