import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrderStatus } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const statusFlow = {
  pharmacy: { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready' },
  delivery: { ready: 'out_for_delivery', out_for_delivery: 'delivered' },
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try { const { data } = await getOrders(); setOrders(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);

  const handleStatus = async (id, status) => {
    try { await updateOrderStatus(id, status); fetchOrders(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner />;

  const nextStatus = (order) => statusFlow[user.role]?.[order.status];
  const statusLabels = { confirmed: 'Confirm', preparing: 'Start Preparing', ready: 'Mark Ready', out_for_delivery: 'Out for Delivery', delivered: 'Mark Delivered' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-practo-navy">{user.role === 'delivery' ? 'My Deliveries' : 'Orders'}</h1>
        <p className="text-practo-gray text-sm mt-1">
          {user.role === 'user' ? 'Track your medicine orders in real-time' : user.role === 'pharmacy' ? 'Process and manage orders' : 'Your assigned deliveries'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-practo-navy font-semibold text-lg">No orders yet</p>
          <p className="text-practo-gray text-sm mt-1">Orders from accepted prescriptions will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 hover:shadow-card-hover transition-all animate-fadeInUp">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={order.status} />
                    <span className="text-xs text-gray-400 font-mono">#{order._id?.slice(-8).toUpperCase()}</span>
                  </div>

                  {/* Order Progress Bar */}
                  {user.role === 'user' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((step, i, arr) => {
                          const currentIdx = arr.indexOf(order.status);
                          const isComplete = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isComplete ? 'bg-practo-blue text-white' : 'bg-gray-200 text-gray-400'} ${isCurrent ? 'animate-ripple' : ''}`}>
                                {isComplete ? '✓' : i + 1}
                              </div>
                              {i < arr.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? 'bg-practo-blue' : 'bg-gray-200'}`} />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] text-practo-gray">
                        <span>Placed</span><span>Confirmed</span><span>Preparing</span><span>Ready</span><span>On Way</span><span>Delivered</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
                    <p className="text-practo-gray">Patient: <span className="text-practo-navy font-medium">{order.userId?.name || 'N/A'}</span></p>
                    {order.pharmacyId && <p className="text-practo-gray">Pharmacy: <span className="text-practo-navy font-medium">{order.pharmacyId.name}</span></p>}
                    {order.deliveryPartnerId && <p className="text-practo-gray">Delivery: <span className="text-practo-navy font-medium">{order.deliveryPartnerId.name}</span></p>}
                    {order.deliveryAddress && <p className="text-practo-gray">📍 {order.deliveryAddress}</p>}
                    {order.totalAmount > 0 && (
                      <p className="text-practo-gray flex items-center gap-2">
                        Amount: <span className="text-practo-green font-bold">₹{order.totalAmount}</span>
                        {order.paymentStatus === 'paid' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">✅ Paid</span>}
                        {order.paymentStatus === 'cod' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">💵 COD</span>}
                        {order.paymentStatus === 'unpaid' && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Unpaid</span>}
                      </p>
                    )}
                    {order.paymentMethod && order.paymentMethod !== 'none' && (
                      <p className="text-practo-gray text-xs">Payment: <span className="text-practo-navy font-medium capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'upi' ? '📱 UPI Transfer' : 'Online (Razorpay)'}</span>{order.paymentId && <span className="text-gray-400 ml-1">#{order.paymentId}</span>}</p>
                    )}
                  </div>
                  {order.prescriptionId?.medicines?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-practo-gray uppercase tracking-wider mb-1.5">Prescribed Medicines</p>
                      <div className="flex flex-wrap gap-1.5">
                        {order.prescriptionId.medicines.map((m, i) => (
                          <span key={i} className="px-2.5 py-1 bg-practo-blue-light text-practo-blue rounded-full text-xs font-medium">💊 {m.name} {m.dosage && `— ${m.dosage}`}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {order.directMedicines?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-practo-gray uppercase tracking-wider mb-1.5">Ordered Medicines</p>
                      <div className="bg-practo-gray-light rounded-xl p-3 space-y-2">
                        {order.directMedicines.map((m, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">💊</span>
                              <span className="text-practo-navy font-medium">{m.name}</span>
                              <span className="text-practo-gray text-xs">× {m.qty}</span>
                            </div>
                            <span className="text-practo-navy font-semibold">₹{m.price * m.qty}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm">
                          <span className="text-practo-gray font-medium">Total</span>
                          <span className="text-practo-green font-bold">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* Track on Map button for users with active delivery */}
                  {user.role === 'user' && ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status) && (
                    <Link to={`/orders/track/${order._id}`}
                      className="px-4 py-2.5 bg-practo-green hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                      Track Live
                    </Link>
                  )}
                  {nextStatus(order) && (
                    <button onClick={() => handleStatus(order._id, nextStatus(order))}
                      className="px-4 py-2.5 bg-practo-blue hover:bg-practo-blue-dark text-white text-sm font-semibold rounded-xl transition-all">
                      {statusLabels[nextStatus(order)] || nextStatus(order).replace(/_/g, ' ')}
                    </button>
                  )}
                  {user.role === 'pharmacy' && order.status === 'pending' && (
                    <button onClick={() => handleStatus(order._id, 'cancelled')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-xl transition-all">Cancel</button>
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

export default Orders;
