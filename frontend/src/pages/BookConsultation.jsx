import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, bookConsultation } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const BookConsultation = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { getDoctors().then(({ data }) => setDoctors(data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await bookConsultation({ doctorId: selectedDoctor, scheduledAt }); navigate('/consultations'); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-practo-navy mb-1">Book Video Consultation</h1>
      <p className="text-practo-gray text-sm mb-6">Choose a doctor and schedule your video call</p>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-practo-navy mb-3">Select Doctor</label>
            {doctors.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-xl text-center">
                <p className="text-practo-gray">No doctors available. Register a doctor account first.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {doctors.map((doc) => (
                  <label key={doc._id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedDoctor === doc._id ? 'border-practo-blue bg-practo-blue-light shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" name="doctor" value={doc._id} checked={selectedDoctor === doc._id} onChange={(e) => setSelectedDoctor(e.target.value)} className="sr-only" />
                    <div className="w-12 h-12 rounded-2xl bg-practo-blue flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {doc.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-practo-navy font-semibold">Dr. {doc.name}</p>
                      <p className="text-sm text-practo-gray">{doc.specialization || 'General Physician'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Available</span>
                        <span className="text-xs text-practo-gray">• Video Consultation</span>
                      </div>
                    </div>
                    {selectedDoctor === doc._id && (
                      <div className="w-7 h-7 rounded-full bg-practo-blue flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-practo-navy mb-1.5">Schedule Date & Time</label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm" />
          </div>
          <button type="submit" disabled={submitting || !selectedDoctor || !scheduledAt} className="w-full py-3 bg-practo-blue hover:bg-practo-blue-dark text-white font-semibold rounded-xl transition-all shadow-button disabled:opacity-50 text-sm">
            {submitting ? 'Booking...' : 'Book Consultation — Free'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookConsultation;
