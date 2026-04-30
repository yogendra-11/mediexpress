import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPrescription } from '../api';

const CreatePrescription = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);
  const [notes, setNotes] = useState('');
  const [userId, setUserId] = useState(searchParams.get('userId') || '');
  const [consultationId] = useState(searchParams.get('consultationId') || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) => { const u = [...medicines]; u[i][field] = value; setMedicines(u); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await createPrescription({ userId, consultationId: consultationId || undefined, medicines, notes }); navigate('/prescriptions'); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-3 py-2.5 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-practo-navy mb-1">Create Prescription</h1>
      <p className="text-practo-gray text-sm mb-6">Add medicines and dosage instructions for the patient</p>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!searchParams.get('userId') && (
            <div>
              <label className="block text-sm font-semibold text-practo-navy mb-1.5">Patient ID</label>
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required placeholder="Enter patient user ID" className={inputCls} />
            </div>
          )}
          {searchParams.get('userId') && (
            <div className="p-3 bg-practo-blue-light rounded-xl flex items-center gap-2">
              <span className="text-practo-blue">ℹ️</span>
              <span className="text-sm text-practo-blue-dark font-medium">Prescribing for consultation patient</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-practo-navy">Medicines</label>
              <button type="button" onClick={addMedicine} className="text-sm text-practo-blue hover:text-practo-blue-dark font-semibold transition-colors">+ Add Medicine</button>
            </div>
            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div key={i} className="p-4 bg-practo-gray-light rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-practo-gray uppercase tracking-wider">Medicine #{i + 1}</span>
                    {medicines.length > 1 && <button type="button" onClick={() => removeMedicine(i)} className="text-xs text-red-500 hover:text-red-600 font-semibold">Remove</button>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" placeholder="Medicine name" value={med.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)} required className={inputCls} />
                    <input type="text" placeholder="Dosage (500mg)" value={med.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} required className={inputCls} />
                    <input type="text" placeholder="Duration (5 days)" value={med.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} required className={inputCls} />
                  </div>
                  <input type="text" placeholder="Instructions (e.g., after meals, twice daily)" value={med.instructions} onChange={(e) => updateMedicine(i, 'instructions', e.target.value)} className={inputCls} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-practo-navy mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Additional notes or advice for the patient..." className={`${inputCls} resize-none`} />
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3 bg-practo-blue hover:bg-practo-blue-dark text-white font-semibold rounded-xl transition-all shadow-button disabled:opacity-50 text-sm">
            {submitting ? 'Submitting...' : 'Submit Prescription'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePrescription;
