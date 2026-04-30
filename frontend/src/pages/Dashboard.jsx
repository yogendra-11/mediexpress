import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConsultations, getPrescriptions, getOrders, getDoctors } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const sampleDoctors = [
  { name: 'Priya Sharma', specialization: 'General Physician', exp: '12 yrs', fee: 'Free', rating: 4.8, reviews: 342 },
  { name: 'Rajesh Kumar', specialization: 'Dermatologist', exp: '8 yrs', fee: 'Free', rating: 4.6, reviews: 218 },
  { name: 'Anjali Mehta', specialization: 'Pediatrician', exp: '15 yrs', fee: 'Free', rating: 4.9, reviews: 506 },
  { name: 'Vikram Singh', specialization: 'Cardiologist', exp: '20 yrs', fee: 'Free', rating: 4.7, reviews: 189 },
  { name: 'Sneha Patel', specialization: 'Gynecologist', exp: '10 yrs', fee: 'Free', rating: 4.8, reviews: 421 },
  { name: 'Amit Gupta', specialization: 'Orthopedic', exp: '14 yrs', fee: 'Free', rating: 4.5, reviews: 167 },
];
const docColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500'];

const Dashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [recentItems, setRecentItems] = useState([]);
  const [dbDoctors, setDbDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = {};
        const items = [];
        if (['user', 'doctor'].includes(user.role)) {
          const { data } = await getConsultations(); results.consultations = data.length;
          items.push(...data.slice(0, 3).map(c => ({ ...c, _type: 'consultation' })));
        }
        if (['user', 'doctor', 'pharmacy'].includes(user.role)) {
          const { data } = await getPrescriptions(); results.prescriptions = data.length;
          items.push(...data.slice(0, 3).map(p => ({ ...p, _type: 'prescription' })));
        }
        if (['user', 'pharmacy', 'delivery'].includes(user.role)) {
          const { data } = await getOrders(); results.orders = data.length;
          items.push(...data.slice(0, 3).map(o => ({ ...o, _type: 'order' })));
        }
        if (user.role === 'user') {
          try { const { data } = await getDoctors(); setDbDoctors(data); } catch {}
        }
        setCounts(results); setRecentItems(items.slice(0, 5));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user.role]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const statCards = {
    user: [
      { key: 'consultations', label: 'Consultations', icon: '📹', color: 'bg-blue-50 border-blue-100' },
      { key: 'prescriptions', label: 'Prescriptions', icon: '📋', color: 'bg-emerald-50 border-emerald-100' },
      { key: 'orders', label: 'Orders', icon: '📦', color: 'bg-purple-50 border-purple-100' },
    ],
    doctor: [
      { key: 'consultations', label: 'Consultations', icon: '📹', color: 'bg-blue-50 border-blue-100' },
      { key: 'prescriptions', label: 'Prescriptions', icon: '📋', color: 'bg-emerald-50 border-emerald-100' },
    ],
    pharmacy: [
      { key: 'prescriptions', label: 'Prescriptions', icon: '📋', color: 'bg-amber-50 border-amber-100' },
      { key: 'orders', label: 'Orders', icon: '📦', color: 'bg-emerald-50 border-emerald-100' },
    ],
    delivery: [{ key: 'orders', label: 'Deliveries', icon: '🚴', color: 'bg-purple-50 border-purple-100' }],
  };

  // Merge DB doctors with sample for display
  const displayDoctors = dbDoctors.length > 0
    ? dbDoctors.map((d, i) => ({ ...d, name: d.name, specialization: d.specialization || 'General Physician', exp: '5+ yrs', fee: 'Free', rating: (4.5 + Math.random() * 0.4).toFixed(1), reviews: 100 + Math.floor(Math.random() * 400), _id: d._id }))
    : sampleDoctors;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-practo-blue to-[#0b8ec4] rounded-2xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <h1 className="text-2xl sm:text-3xl font-bold relative z-10">Hello, {user.name} 👋</h1>
        <p className="text-white/80 mt-1 text-sm relative z-10">
          {user.role === 'user' ? 'Find doctors, buy medicines, and get them delivered to your doorstep' :
           user.role === 'doctor' ? 'Ready for your consultations today?' :
           user.role === 'pharmacy' ? 'Manage your pharmacy orders' : 'Check your delivery assignments'}
        </p>
        {user.role === 'user' && (
          <div className="flex gap-3 mt-4 relative z-10">
            <Link to="/consultations/book" className="px-5 py-2.5 bg-white text-practo-blue font-semibold text-sm rounded-xl hover:bg-blue-50 transition-all">📹 Consult Doctor</Link>
            <Link to="/medicines" className="px-5 py-2.5 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-all border border-white/30">💊 Buy Medicines</Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {(statCards[user.role] || []).map(card => (
          <div key={card.key} className={`bg-white rounded-2xl border p-5 shadow-card hover:shadow-card-hover transition-all ${card.color}`}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-practo-gray">{card.label}</p><p className="text-3xl font-bold text-practo-navy mt-1">{counts[card.key] ?? 0}</p></div>
              <div className="text-3xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctors Section (Patient only) */}
      {user.role === 'user' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-practo-navy">Top Doctors</h2>
              <p className="text-sm text-practo-gray">Consult with experienced doctors via video call</p>
            </div>
            <Link to="/consultations/book" className="text-sm text-practo-blue font-semibold hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayDoctors.slice(0, 6).map((doc, i) => (
              <div key={doc._id || i} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-2xl ${docColors[i % docColors.length]} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                    {doc.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-practo-navy font-semibold truncate">Dr. {doc.name}</h3>
                    <p className="text-sm text-practo-blue font-medium">{doc.specialization}</p>
                    <p className="text-xs text-practo-gray mt-0.5">{doc.exp} experience</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">⭐ {doc.rating}</span>
                      <span className="text-xs text-practo-gray">{doc.reviews} reviews</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <span className="text-sm font-semibold text-practo-green">{doc.fee} Consultation</span>
                  <Link to={doc._id ? `/consultations/book` : '/consultations/book'}
                    className="px-4 py-2 bg-practo-blue hover:bg-practo-blue-dark text-white text-xs font-semibold rounded-xl transition-all">
                    Consult Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {user.role !== 'user' && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-practo-navy mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.role === 'doctor' && <>
              <Link to="/consultations" className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all border-l-4 border-l-practo-blue">
                <div className="text-2xl mb-2">📹</div><h3 className="text-practo-navy font-semibold group-hover:text-practo-blue">My Consultations</h3><p className="text-sm text-practo-gray mt-1">View upcoming patient calls</p>
              </Link>
              <Link to="/prescriptions/create" className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all border-l-4 border-l-emerald-500">
                <div className="text-2xl mb-2">✍️</div><h3 className="text-practo-navy font-semibold group-hover:text-practo-blue">Write Prescription</h3><p className="text-sm text-practo-gray mt-1">Create digital prescription</p>
              </Link>
            </>}
            {user.role === 'pharmacy' && <>
              <Link to="/prescriptions" className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all border-l-4 border-l-amber-500">
                <div className="text-2xl mb-2">📋</div><h3 className="text-practo-navy font-semibold group-hover:text-practo-blue">Review Prescriptions</h3><p className="text-sm text-practo-gray mt-1">Accept or reject prescriptions</p>
              </Link>
              <Link to="/orders" className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all border-l-4 border-l-emerald-500">
                <div className="text-2xl mb-2">📦</div><h3 className="text-practo-navy font-semibold group-hover:text-practo-blue">Manage Orders</h3><p className="text-sm text-practo-gray mt-1">Process and dispatch orders</p>
              </Link>
            </>}
            {user.role === 'delivery' && (
              <Link to="/orders" className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all border-l-4 border-l-purple-500">
                <div className="text-2xl mb-2">🚴</div><h3 className="text-practo-navy font-semibold group-hover:text-practo-blue">Active Deliveries</h3><p className="text-sm text-practo-gray mt-1">View and complete deliveries</p>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentItems.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-practo-navy mb-3">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            {recentItems.map((item, i) => (
              <div key={item._id + item._type} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${i !== recentItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item._type === 'consultation' ? '📹' : item._type === 'prescription' ? '📋' : '📦'}</span>
                  <div>
                    <p className="text-sm font-medium text-practo-navy capitalize">{item._type}</p>
                    <p className="text-xs text-practo-gray">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
