import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  googleAuth: (credential) => API.post('/auth/google', { credential }),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data)
}

export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`)
}

export const cartAPI = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart', data),
  update: (data) => API.put('/cart', data),
  remove: (productId) => API.delete(`/cart/${productId}`),
  clear: () => API.delete('/cart')
}

export const orderAPI = {
  create: (data) => API.post('/orders', data),
  processPayment: (data) => API.post('/orders/payment', data),
  getUserOrders: () => API.get('/orders'),
  getById: (id) => API.get(`/orders/${id}`),
  getAll: () => API.get('/orders/all'),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data)
}

export const reviewAPI = {
  create: (data) => API.post('/reviews', data),
  getByProduct: (productId) => API.get(`/reviews/${productId}`),
  getAllByProduct: (productId) => API.get(`/reviews/admin/${productId}`),
  approve: (id) => API.put(`/reviews/${id}/approve`),
  delete: (id) => API.delete(`/reviews/${id}`)
}

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  updateProductStock: (id, stock) => API.put(`/admin/products/${id}/stock`, { stock }),
  updateProductPrice: (id, price) => API.put(`/admin/products/${id}/price`, { price }),
  updateProductDiscount: (id, discountPercentage) => API.put(`/admin/products/${id}/discount`, { discountPercentage }),
  editProduct: (id, data) => API.put(`/admin/products/${id}/edit`, data),
  getAllProducts: (params) => API.get('/admin/products', { params }),
  getAllOrders: () => API.get('/admin/orders'),
  updateOrderStatus: (id, status) => API.put(`/admin/orders/${id}/status`, { orderStatus: status }),
  updateAllProductRatings: () => API.post('/admin/products/update-ratings')
}

export default API
