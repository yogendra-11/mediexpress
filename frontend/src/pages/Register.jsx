import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

const roles = [
  { value: 'user', label: 'Patient', icon: '👤', desc: 'Book consultations & order medicines' },
  { value: 'doctor', label: 'Doctor', icon: '🩺', desc: 'Consult patients & write prescriptions' },
  { value: 'pharmacy', label: 'Pharmacy', icon: '💊', desc: 'Manage prescriptions & orders' },
  { value: 'delivery', label: 'Delivery', icon: '🚴', desc: 'Deliver medicines to patients' },
];

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', phone: '', specialization: '' });
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
      const { data } = await registerUser(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-practo-gray-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fadeInUp">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-practo-blue rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <span className="text-2xl font-bold text-practo-navy">MediExpress</span>
          </div>
          <p className="text-practo-gray text-sm">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-practo-navy mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${form.role === r.value ? 'border-practo-blue bg-practo-blue-light' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${form.role === r.value ? 'text-practo-blue' : 'text-practo-navy'}`}>{r.label}</p>
                        <p className="text-xs text-practo-gray leading-tight">{r.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-practo-navy mb-1.5">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-practo-navy mb-1.5">Phone</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765..." className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-practo-navy mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-practo-navy mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Min 6 characters" className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm" />
            </div>

            {form.role === 'doctor' && (
              <div className="animate-fadeInUp">
                <label className="block text-sm font-medium text-practo-navy mb-1.5">Specialization</label>
                <input type="text" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. General Physician, Dermatologist" className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm" />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-practo-blue hover:bg-practo-blue-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-button disabled:opacity-50 text-sm">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-practo-gray text-sm mt-5">
            Already have an account? <Link to="/login" className="text-practo-blue hover:text-practo-blue-dark font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
