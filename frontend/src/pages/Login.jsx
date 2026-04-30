import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';

const portals = [
  { role: 'user', label: 'Patient', icon: '👤', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', desc: 'Book consultations & order medicines' },
  { role: 'doctor', label: 'Doctor', icon: '🩺', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', desc: 'Consult patients & write prescriptions' },
  { role: 'pharmacy', label: 'Pharmacy', icon: '💊', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', desc: 'Manage prescriptions & orders' },
  { role: 'delivery', label: 'Delivery', icon: '🚴', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', desc: 'Deliver medicines to patients' },
];

const Login = () => {
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      // Verify role matches selected portal
      if (data.role !== selectedPortal.role) {
        setError(`This account is registered as "${data.role}". Please use the correct portal.`);
        setLoading(false);
        return;
      }
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Portal selection screen
  if (!selectedPortal) {
    return (
      <div className="min-h-screen bg-practo-gray-bg flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 bg-practo-blue rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <span className="text-3xl font-bold text-practo-navy">MediExpress</span>
          </div>
          <p className="text-practo-gray text-sm">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full">
          {portals.map((p, i) => (
            <button key={p.role} onClick={() => setSelectedPortal(p)}
              className={`group bg-white rounded-2xl border-2 ${p.border} p-6 text-left hover:shadow-card-hover transition-all duration-300 animate-fadeInUp`}
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {p.icon}
              </div>
              <h3 className="text-lg font-bold text-practo-navy">{p.label} Login</h3>
              <p className="text-sm text-practo-gray mt-1">{p.desc}</p>
              <div className={`mt-3 inline-flex items-center text-xs font-semibold ${p.text} group-hover:translate-x-1 transition-transform`}>
                Sign in as {p.label} →
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-practo-gray text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-practo-blue hover:text-practo-blue-dark font-semibold">Create Account</Link>
          </p>
        </div>
      </div>
    );
  }

  // Login form for selected portal
  const p = selectedPortal;
  return (
    <div className="min-h-screen bg-practo-gray-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeInUp">
        {/* Back button */}
        <button onClick={() => { setSelectedPortal(null); setError(''); setForm({ email: '', password: '' }); }}
          className="flex items-center gap-1 text-sm text-practo-gray hover:text-practo-navy mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Back to role selection
        </button>

        {/* Portal header */}
        <div className={`bg-gradient-to-r ${p.color} rounded-2xl p-6 mb-4 text-white text-center`}>
          <div className="text-4xl mb-2">{p.icon}</div>
          <h1 className="text-2xl font-bold">{p.label} Portal</h1>
          <p className="text-white/80 text-sm mt-1">Sign in to your {p.label.toLowerCase()} account</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-practo-navy mb-1.5">Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder={`Enter your ${p.label.toLowerCase()} email`}
                className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-practo-navy mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className={`w-full py-3 bg-gradient-to-r ${p.color} text-white font-semibold rounded-xl transition-all shadow-button disabled:opacity-50 text-sm`}>
              {loading ? 'Signing in...' : `Sign In as ${p.label}`}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-practo-gray text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-practo-blue hover:text-practo-blue-dark font-semibold">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
