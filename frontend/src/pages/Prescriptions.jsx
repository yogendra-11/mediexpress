import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPrescriptions, updatePrescriptionStatus } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try { const { data } = await getPrescriptions(); setPrescriptions(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (id, status) => {
    try { await updatePrescriptionStatus(id, status); fetchData(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-practo-navy">Prescriptions</h1>
          <p className="text-practo-gray text-sm mt-1">
            {user.role === 'pharmacy' ? 'Review and manage incoming prescriptions' : 'Your medical prescriptions'}
          </p>
        </div>
        <div className="flex gap-2">
          {user.role === 'user' && <Link to="/prescriptions/upload" className="px-5 py-2.5 bg-practo-blue hover:bg-practo-blue-dark text-white text-sm font-semibold rounded-xl transition-all shadow-button">📤 Upload</Link>}
          {user.role === 'doctor' && <Link to="/prescriptions/create" className="px-5 py-2.5 bg-practo-blue hover:bg-practo-blue-dark text-white text-sm font-semibold rounded-xl transition-all shadow-button">✍️ Create</Link>}
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-practo-navy font-semibold text-lg">No prescriptions found</p>
          <p className="text-practo-gray text-sm mt-1">Prescriptions from your consultations will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 hover:shadow-card-hover transition-all animate-fadeInUp">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={p.status} />
                    {p.fileUrl && <span className="text-xs text-practo-gray bg-gray-100 px-2 py-1 rounded-full">📎 File</span>}
                    <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                  {p.doctorId && <p className="text-sm text-practo-gray">Prescribed by <span className="text-practo-navy font-semibold">Dr. {p.doctorId.name}</span> {p.doctorId.specialization && <span className="text-practo-blue">({p.doctorId.specialization})</span>}</p>}
                  {p.userId && user.role !== 'user' && <p className="text-sm text-practo-gray">Patient: <span className="text-practo-navy font-semibold">{p.userId.name}</span></p>}
                  {p.medicines?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {p.medicines.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 bg-practo-gray-light rounded-xl">
                          <span className="text-practo-blue">💊</span>
                          <span className="text-sm font-medium text-practo-navy">{m.name}</span>
                          <span className="text-xs text-practo-gray">• {m.dosage} • {m.duration}</span>
                          {m.instructions && <span className="text-xs text-practo-gray italic">• {m.instructions}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {p.notes && <p className="text-sm text-practo-gray mt-2 italic bg-blue-50 p-2 rounded-lg">📝 {p.notes}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {user.role === 'pharmacy' && p.status === 'submitted' && (
                    <>
                      <button onClick={() => handleStatus(p._id, 'accepted')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all">✓ Accept</button>
                      <button onClick={() => handleStatus(p._id, 'rejected')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">✕ Reject</button>
                    </>
                  )}
                  {user.role === 'user' && p.status === 'accepted' && (
                    <Link to={`/orders/create/${p._id}`} className="px-4 py-2 bg-practo-blue hover:bg-practo-blue-dark text-white text-sm font-semibold rounded-xl transition-all shadow-button">
                      Order Medicines →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
