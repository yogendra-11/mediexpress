import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import medicines, { categories, categoryColors } from '../data/medicines';
import { createOrder, createPaymentOrder, verifyPayment } from '../api';
import { useAuth } from '../context/AuthContext';

const MedicineShop = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [address, setAddress] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi_qr');
  const [paymentError, setPaymentError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [upiTxnId, setUpiTxnId] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const filtered = medicines.filter(m => {
    const matchCat = category === 'All' || m.category === category;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (med) => setCart(prev => ({ ...prev, [med.id]: (prev[med.id] || 0) + 1 }));
  const removeFromCart = (id) => setCart(prev => { const n = { ...prev }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });
  const cartItems = Object.entries(cart).map(([id, qty]) => ({ ...medicines.find(m => m.id === +id), qty })).filter(Boolean);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) { resolve(true); return; }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Razorpay online payment
  const handleRazorpayPayment = async (orderData) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) { setPaymentError('Failed to load payment gateway'); setOrdering(false); return; }
    try {
      const { data: dbOrder } = await createOrder({ ...orderData, paymentMethod: 'razorpay', paymentStatus: 'unpaid' });
      const { data: rzpOrder } = await createPaymentOrder({ amount: total, orderId: dbOrder._id });
      const options = {
        key: rzpOrder.key, amount: rzpOrder.amount, currency: rzpOrder.currency,
        name: 'MediExpress', description: `Medicine Order — ${cartItems.length} items`,
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            await verifyPayment({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, orderId: dbOrder._id });
            setOrdered(true); setCart({}); setTimeout(() => navigate('/orders'), 2000);
          } catch { setPaymentError('Payment verification failed'); setOrdering(false); }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#14bef0' },
        modal: { ondismiss: () => { setOrdering(false); } },
        method: { upi: true, card: true, netbanking: true, wallet: true, qr: true },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment gateway error. Try QR or COD.');
      setOrdering(false);
    }
  };

  // Handle UPI QR / UPI ID payment (manual confirmation)
  const handleUPIPayment = async () => {
    if (!address.trim()) return;
    setShowQR(true);
  };

  const confirmUPIPayment = async () => {
    if (!upiTxnId.trim()) { setPaymentError('Please enter your UPI transaction ID'); return; }
    setOrdering(true);
    setPaymentError('');
    try {
      await createOrder({
        deliveryAddress: address,
        totalAmount: total,
        directMedicines: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        paymentId: upiTxnId,
      });
      setOrdered(true); setCart({}); setShowQR(false);
      setTimeout(() => navigate('/orders'), 2000);
    } catch { setPaymentError('Failed to place order'); setOrdering(false); }
  };

  // Handle COD
  const handleCODOrder = async (orderData) => {
    try {
      await createOrder({ ...orderData, paymentMethod: 'cod', paymentStatus: 'cod' });
      setOrdered(true); setCart({}); setTimeout(() => navigate('/orders'), 2000);
    } catch { setPaymentError('Failed to place order'); setOrdering(false); }
  };

  // Main handler
  const handleOrder = async () => {
    if (!address.trim()) return;
    setOrdering(true); setPaymentError('');
    const orderData = { deliveryAddress: address, totalAmount: total, directMedicines: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })) };
    if (paymentMethod === 'cod') await handleCODOrder(orderData);
    else if (paymentMethod === 'razorpay') await handleRazorpayPayment(orderData);
    else if (paymentMethod === 'upi_qr') { setOrdering(false); handleUPIPayment(); }
  };

  // Success screen
  if (ordered) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center animate-fadeInUp">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-practo-navy mb-2">Order Placed!</h2>
      <p className="text-practo-gray">
        {paymentMethod === 'cod' ? 'Pay on delivery. ' : paymentMethod === 'upi_qr' ? 'UPI payment confirmed! ' : 'Payment successful! '}
        Redirecting to orders...
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-practo-navy">Medicine Shop</h1>
        <p className="text-practo-gray text-sm mt-1">Buy over-the-counter medicines without prescription</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 focus:border-practo-blue transition-all text-sm shadow-card" />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === cat ? 'bg-practo-blue text-white shadow-button' : 'bg-white text-practo-gray border border-gray-200 hover:border-practo-blue hover:text-practo-blue'}`}>
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-practo-gray mb-4">{filtered.length} medicines found</p>

      {/* Medicine Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map(med => {
          const cc = categoryColors[med.category] || {};
          const inCart = cart[med.id] || 0;
          return (
            <div key={med.id} className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all p-4 flex flex-col">
              <div className={`w-full h-20 rounded-xl ${cc.bg || 'bg-gray-50'} flex items-center justify-center text-3xl mb-3`}>{med.emoji}</div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${cc.text || 'text-gray-500'} mb-1`}>{med.category}</span>
              <h3 className="text-sm font-semibold text-practo-navy leading-tight">{med.name}</h3>
              <p className="text-xs text-practo-gray mt-0.5 flex-1">{med.desc}</p>
              <p className="text-[10px] text-gray-400 mt-1">{med.strip}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-practo-navy font-bold">₹{med.price}</span>
                {inCart > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => removeFromCart(med.id)} className="w-7 h-7 rounded-lg bg-gray-100 text-practo-navy font-bold text-sm hover:bg-gray-200 transition-colors">−</button>
                    <span className="text-sm font-semibold text-practo-navy w-5 text-center">{inCart}</span>
                    <button onClick={() => addToCart(med)} className="w-7 h-7 rounded-lg bg-practo-blue text-white font-bold text-sm hover:bg-practo-blue-dark transition-colors">+</button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(med)} className="px-3 py-1.5 bg-practo-blue-light text-practo-blue text-xs font-semibold rounded-lg hover:bg-practo-blue hover:text-white transition-all">Add</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
          <button onClick={() => setShowCart(true)} className="flex items-center gap-3 px-6 py-3.5 bg-practo-blue hover:bg-practo-blue-dark text-white rounded-2xl shadow-lg shadow-practo-blue/30 transition-all">
            <span className="font-semibold">{cartCount} items</span>
            <span className="w-px h-5 bg-white/30"></span>
            <span className="font-bold">₹{total}</span>
            <span>→ View Cart</span>
          </button>
        </div>
      )}

      {/* ===== QR PAYMENT MODAL ===== */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => { setShowQR(false); setPaymentError(''); }}>
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden animate-fadeInUp" onClick={e => e.stopPropagation()}>
            {/* Purple gradient header */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-6 py-5 text-white text-center">
              <p className="text-sm opacity-80">Pay to MediExpress</p>
              <p className="text-3xl font-bold mt-1">₹{total}</p>
            </div>

            <div className="p-6">
              {/* QR Code */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
                <img src="/assets/payment-qr.png" alt="Scan to Pay — PhonePe QR" className="w-full max-w-[220px] mx-auto rounded-lg" />
                <p className="text-center text-xs text-practo-gray mt-3">Scan with <span className="font-bold text-purple-600">PhonePe</span>, <span className="font-bold text-blue-600">GPay</span>, <span className="font-bold text-indigo-600">Paytm</span> or any UPI app</p>
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-practo-gray font-medium">OR PAY VIA UPI ID</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* UPI ID display */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4 border border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-xs">UPI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-practo-gray">Send ₹{total} to</p>
                  <p className="text-sm font-bold text-practo-navy tracking-wide">yogendra11@ybl</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText('yogendra11@ybl'); }}
                  className="px-2.5 py-1 bg-practo-blue text-white text-xs font-semibold rounded-lg hover:bg-practo-blue-dark transition-all">
                  Copy
                </button>
              </div>

              {/* Transaction ID input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-practo-navy mb-1.5">Enter UPI Transaction ID / UTR Number</label>
                <input type="text" value={upiTxnId} onChange={e => setUpiTxnId(e.target.value)} placeholder="e.g. 412345678901" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all" />
                <p className="text-[10px] text-practo-gray mt-1">You'll find the UTR/Transaction ID in your UPI app's payment receipt</p>
              </div>

              {/* Error */}
              {paymentError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                  <span>⚠️</span>{paymentError}
                </div>
              )}

              {/* Confirm button */}
              <button onClick={confirmUPIPayment} disabled={ordering || !upiTxnId.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-200 disabled:opacity-50 text-sm">
                {ordering ? 'Confirming Payment...' : `✓ I've Paid ₹${total}`}
              </button>

              <button onClick={() => { setShowQR(false); setPaymentError(''); }} className="w-full mt-2 py-2 text-sm text-practo-gray hover:text-practo-navy transition-all">
                ← Back to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CART MODAL ===== */}
      {showCart && !showQR && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-practo-navy">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-practo-gray-light rounded-xl">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-practo-navy truncate">{item.name}</p>
                      <p className="text-xs text-practo-gray">₹{item.price} × {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded bg-gray-200 text-xs font-bold">−</button>
                      <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                      <button onClick={() => addToCart(item)} className="w-6 h-6 rounded bg-practo-blue text-white text-xs font-bold">+</button>
                    </div>
                    <span className="text-sm font-bold text-practo-navy">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-1"><span className="text-practo-gray">Subtotal</span><span className="font-semibold">₹{total}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-practo-gray">Delivery</span><span className="text-practo-green font-semibold">FREE</span></div>
                <div className="flex justify-between text-lg font-bold mt-2"><span>Total</span><span>₹{total}</span></div>
              </div>

              {/* Delivery Address */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-practo-navy mb-1.5">📍 Delivery Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Enter delivery address..." className="w-full px-3 py-2.5 bg-practo-gray-light border border-gray-200 rounded-xl text-sm text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 resize-none" />
              </div>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-practo-navy mb-2">💳 Payment Method</label>
                <div className="space-y-2">

                  {/* UPI / QR Code Scan */}
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'upi_qr' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="upi_qr" checked={paymentMethod === 'upi_qr'} onChange={() => setPaymentMethod('upi_qr')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'upi_qr' ? 'border-purple-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'upi_qr' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-practo-navy">UPI / QR Code</p>
                      <p className="text-xs text-practo-gray">Scan QR or pay via PhonePe, GPay, Paytm UPI</p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0 text-base">
                      <span>📱</span><span>🔲</span>
                    </div>
                  </label>

                  {/* Razorpay Online */}
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-practo-blue bg-practo-blue-light' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'razorpay' ? 'border-practo-blue' : 'border-gray-300'}`}>
                      {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-practo-blue"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-practo-navy">Pay Online (Razorpay)</p>
                      <p className="text-xs text-practo-gray">Cards • Net Banking • Wallets</p>
                    </div>
                    <span className="text-base flex-shrink-0">💳</span>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'cod' ? 'border-emerald-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-practo-navy">Cash on Delivery</p>
                      <p className="text-xs text-practo-gray">Pay in cash when your order arrives</p>
                    </div>
                    <span className="text-base flex-shrink-0">💵</span>
                  </label>

                </div>
              </div>

              {/* Error */}
              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <span>⚠️</span>{paymentError}
                </div>
              )}

              {/* Order Button - changes by payment method */}
              <button onClick={handleOrder} disabled={ordering || !address.trim()}
                className={`w-full py-3.5 font-semibold rounded-xl transition-all shadow-button disabled:opacity-50 text-sm ${
                  paymentMethod === 'upi_qr' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                  : paymentMethod === 'razorpay' ? 'bg-gradient-to-r from-practo-blue to-[#0b8ec4] hover:from-[#0b8ec4] hover:to-practo-blue text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                }`}>
                {ordering ? 'Processing...'
                  : paymentMethod === 'upi_qr' ? `Pay ₹${total} — Scan QR / UPI`
                  : paymentMethod === 'razorpay' ? `Pay ₹${total} — Card / Net Banking`
                  : `Place COD Order — ₹${total}`
                }
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-practo-gray">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                <span>100% Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineShop;
