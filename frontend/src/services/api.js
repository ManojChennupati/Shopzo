import axios from 'axios'

const API = axios.create({
  baseURL: '/api'
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
  login: (data) => API.post('/auth/login', data)
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
  approve: (id) => API.put(`/reviews/${id}/approve`)
}

export default API
