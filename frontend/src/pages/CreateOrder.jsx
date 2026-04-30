import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPrescription, createOrder } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateOrder = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPrescription(prescriptionId).then(({ data }) => setPrescription(data)).catch(console.error).finally(() => setLoading(false));
  }, [prescriptionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await createOrder({ prescriptionId, deliveryAddress }); navigate('/orders'); }
    catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-practo-navy mb-1">Confirm Order</h1>
      <p className="text-practo-gray text-sm mb-6">Review your prescription and place your order</p>

      {prescription && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-4">
          <h2 className="text-xs font-semibold text-practo-gray uppercase tracking-wider mb-3">Prescription Details</h2>
          {prescription.doctorId && <p className="text-sm text-practo-gray mb-2">Prescribed by <span className="text-practo-navy font-semibold">Dr. {prescription.doctorId.name}</span></p>}
          {prescription.medicines?.length > 0 && (
            <div className="space-y-2">
              {prescription.medicines.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-practo-gray-light rounded-xl">
                  <span className="text-practo-blue text-lg">💊</span>
                  <div>
                    <p className="text-practo-navy text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-practo-gray">{m.dosage} • {m.duration}{m.instructions ? ` • ${m.instructions}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {prescription.notes && <p className="text-sm text-practo-gray mt-3 bg-blue-50 p-3 rounded-xl">📝 {prescription.notes}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-practo-navy mb-1.5">📍 Delivery Address</label>
            <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required rows={3} placeholder="Enter your full delivery address..." className="w-full px-4 py-3 bg-practo-gray-light border border-gray-200 rounded-xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm resize-none" />
          </div>
          <div className="bg-practo-blue-light rounded-xl p-3 flex items-center gap-2">
            <span className="text-practo-blue">🚴</span>
            <span className="text-sm text-practo-blue-dark font-medium">Free delivery • Estimated 10-30 mins</span>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-practo-blue hover:bg-practo-blue-dark text-white font-semibold rounded-xl transition-all shadow-button disabled:opacity-50 text-sm">
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
