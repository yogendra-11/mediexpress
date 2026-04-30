import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConsultations, updateConsultationStatus } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const Consultations = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try { const { data } = await getConsultations(); setConsultations(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (id, status) => {
    try { await updateConsultationStatus(id, status); fetchData(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-practo-navy">Video Consultations</h1>
          <p className="text-practo-gray text-sm mt-1">
            {user.role === 'user' ? 'Consult with top doctors via video call' : 'Your patient consultations'}
          </p>
        </div>
        {user.role === 'user' && (
          <Link to="/consultations/book" className="px-5 py-2.5 bg-practo-blue hover:bg-practo-blue-dark text-white text-sm font-semibold rounded-xl transition-all shadow-button">
            Book Consultation
          </Link>
        )}
      </div>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <div className="text-5xl mb-4">📹</div>
          <p className="text-practo-navy font-semibold text-lg">No consultations yet</p>
          <p className="text-practo-gray text-sm mt-1">Book a video consultation to get started</p>
          {user.role === 'user' && (
            <Link to="/consultations/book" className="inline-block mt-4 px-6 py-2.5 bg-practo-blue hover:bg-practo-blue-dark text-white text-sm font-semibold rounded-xl transition-all">
              Book Now
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {consultations.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 hover:shadow-card-hover transition-all animate-fadeInUp">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-practo-blue-light flex items-center justify-center text-practo-blue text-xl font-bold flex-shrink-0">
                    {user.role === 'user' ? (c.doctorId?.name?.charAt(0) || 'D') : (c.userId?.name?.charAt(0) || 'P')}
                  </div>
                  <div>
                    <h3 className="text-practo-navy font-semibold">
                      {user.role === 'user' ? `Dr. ${c.doctorId?.name || 'Unknown'}` : (c.userId?.name || 'Unknown Patient')}
                    </h3>
                    <p className="text-sm text-practo-gray mt-0.5">
                      {c.doctorId?.specialization && <span className="text-practo-blue font-medium">{c.doctorId.specialization}</span>}
                      {c.doctorId?.specialization && ' • '}
                      {new Date(c.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Room: {c.jitsiRoomId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <StatusBadge status={c.status} />
                  {c.status !== 'completed' && (
                    <a href={`https://meet.jit.si/${c.jitsiRoomId}`} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 bg-practo-blue hover:bg-practo-blue-dark text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                      Join Call
                    </a>
                  )}
                  {user.role === 'doctor' && c.status === 'scheduled' && (
                    <button onClick={() => handleStatus(c._id, 'in_progress')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl transition-all">Start</button>
                  )}
                  {user.role === 'doctor' && c.status === 'in_progress' && (
                    <>
                      <button onClick={() => handleStatus(c._id, 'completed')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-xl transition-all">Complete</button>
                      <Link to={`/prescriptions/create?userId=${c.userId?._id}&consultationId=${c._id}`} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-xl transition-all">Prescribe</Link>
                    </>
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

export default Consultations;
