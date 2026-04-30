import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Consultations from './pages/Consultations';
import BookConsultation from './pages/BookConsultation';
import Prescriptions from './pages/Prescriptions';
import CreatePrescription from './pages/CreatePrescription';
import UploadPrescription from './pages/UploadPrescription';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import OrderTracking from './pages/OrderTracking';
import MedicineShop from './pages/MedicineShop';

// Unauthorized page — shown when a user tries to access a page for a different role
const Unauthorized = () => {
  const { user } = useAuth();
  const roleLabels = { user: 'Patient', doctor: 'Doctor', pharmacy: 'Pharmacy', delivery: 'Delivery' };
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center animate-fadeInUp">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
      </div>
      <h1 className="text-2xl font-bold text-practo-navy mb-2">Access Denied</h1>
      <p className="text-practo-gray mb-1">You are logged in as <span className="font-semibold text-practo-navy">{roleLabels[user?.role] || 'Unknown'}</span></p>
      <p className="text-practo-gray text-sm mb-6">This page is not available for your account type.</p>
      <Link to="/dashboard" className="px-6 py-2.5 bg-practo-blue hover:bg-practo-blue-dark text-white font-semibold rounded-xl transition-all text-sm">
        Go to Dashboard
      </Link>
    </div>
  );
};

// Protected route with strict role enforcement
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Unauthorized />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

    {/* All roles — dashboard adapts per role */}
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

    {/* Patient only */}
    <Route path="/medicines" element={<ProtectedRoute roles={['user']}><MedicineShop /></ProtectedRoute>} />
    <Route path="/consultations/book" element={<ProtectedRoute roles={['user']}><BookConsultation /></ProtectedRoute>} />
    <Route path="/prescriptions/upload" element={<ProtectedRoute roles={['user']}><UploadPrescription /></ProtectedRoute>} />
    <Route path="/orders/create/:prescriptionId" element={<ProtectedRoute roles={['user']}><CreateOrder /></ProtectedRoute>} />
    <Route path="/orders/track/:orderId" element={<ProtectedRoute roles={['user']}><OrderTracking /></ProtectedRoute>} />

    {/* Patient + Doctor */}
    <Route path="/consultations" element={<ProtectedRoute roles={['user', 'doctor']}><Consultations /></ProtectedRoute>} />

    {/* Doctor only */}
    <Route path="/prescriptions/create" element={<ProtectedRoute roles={['doctor']}><CreatePrescription /></ProtectedRoute>} />

    {/* Patient + Doctor + Pharmacy */}
    <Route path="/prescriptions" element={<ProtectedRoute roles={['user', 'doctor', 'pharmacy']}><Prescriptions /></ProtectedRoute>} />

    {/* Patient + Pharmacy + Delivery */}
    <Route path="/orders" element={<ProtectedRoute roles={['user', 'pharmacy', 'delivery']}><Orders /></ProtectedRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const AppContent = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-practo-gray-bg">
      {user && <Navbar />}
      <AppRoutes />
      {user && <Chatbot />}
    </div>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
