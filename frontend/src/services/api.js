import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('customerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getServices = () => api.get('/services');
export const createOrder = (data) => api.post('/orders', data);
export const getOrders = () => api.get('/orders');
export const getMyOrders = () => api.get('/orders/my-orders');
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const createTopUp = (data) => api.post('/topups', data);
export const getTopUps = () => api.get('/topups');
export const updateTopUpStatus = (id, status) => api.patch(`/topups/${id}`, { status });
export const deleteTopUp = (id) => api.delete(`/topups/${id}`);
export const loginAdmin = (data) => api.post('/auth/login', data);
export const registerCustomer = (data) => api.post('/auth/register', data);
export const loginCustomer = (data) => api.post('/auth/customer/login', data);

export default api;
