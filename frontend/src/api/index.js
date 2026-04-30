import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('mediexpress_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const getDoctors = () => API.get('/auth/doctors');

// Consultations
export const bookConsultation = (data) => API.post('/consultations', data);
export const getConsultations = () => API.get('/consultations');
export const getConsultation = (id) => API.get(`/consultations/${id}`);
export const updateConsultationStatus = (id, status) =>
  API.patch(`/consultations/${id}/status`, { status });

// Prescriptions
export const createPrescription = (data) => API.post('/prescriptions', data);
export const uploadPrescription = (formData) =>
  API.post('/prescriptions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getPrescriptions = () => API.get('/prescriptions');
export const getPrescription = (id) => API.get(`/prescriptions/${id}`);
export const updatePrescriptionStatus = (id, status) =>
  API.patch(`/prescriptions/${id}/status`, { status });

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getOrders = () => API.get('/orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) =>
  API.patch(`/orders/${id}/status`, { status });

export default API;
