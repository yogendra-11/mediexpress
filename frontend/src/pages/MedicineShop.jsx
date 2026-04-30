import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import medicines, { categories, categoryColors } from '../data/medicines';
import { createOrder } from '../api';

const MedicineShop = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [address, setAddress] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
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

  const handleOrder = async () => {
    if (!address.trim()) return;
    setOrdering(true);
    try {
      await createOrder({ deliveryAddress: address, totalAmount: total, directMedicines: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })) });
      setOrdered(true);
      setCart({});
      setTimeout(() => navigate('/orders'), 2000);
    } catch { setOrdering(false); }
  };

  if (ordered) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center animate-fadeInUp">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-practo-navy mb-2">Order Placed!</h2>
      <p className="text-practo-gray">Your medicines are on the way. Redirecting to orders...</p>
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

      {/* Results count */}
      <p className="text-sm text-practo-gray mb-4">{filtered.length} medicines found</p>

      {/* Medicine Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map(med => {
          const cc = categoryColors[med.category] || {};
          const inCart = cart[med.id] || 0;
          return (
            <div key={med.id} className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all p-4 flex flex-col">
              <div className={`w-full h-20 rounded-xl ${cc.bg || 'bg-gray-50'} flex items-center justify-center text-3xl mb-3`}>
                {med.emoji}
              </div>
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
                  <button onClick={() => addToCart(med)} className="px-3 py-1.5 bg-practo-blue-light text-practo-blue text-xs font-semibold rounded-lg hover:bg-practo-blue hover:text-white transition-all">
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
          <button onClick={() => setShowCart(true)}
            className="flex items-center gap-3 px-6 py-3.5 bg-practo-blue hover:bg-practo-blue-dark text-white rounded-2xl shadow-lg shadow-practo-blue/30 transition-all">
            <span className="font-semibold">{cartCount} items</span>
            <span className="w-px h-5 bg-white/30"></span>
            <span className="font-bold">₹{total}</span>
            <span>→ View Cart</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-practo-navy">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
              </div>
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
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-1"><span className="text-practo-gray">Subtotal</span><span className="font-semibold">₹{total}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-practo-gray">Delivery</span><span className="text-practo-green font-semibold">FREE</span></div>
                <div className="flex justify-between text-lg font-bold mt-2"><span>Total</span><span>₹{total}</span></div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-practo-navy mb-1.5">📍 Delivery Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Enter delivery address..." className="w-full px-3 py-2.5 bg-practo-gray-light border border-gray-200 rounded-xl text-sm text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30 resize-none" />
              </div>
              <button onClick={handleOrder} disabled={ordering || !address.trim()} className="w-full py-3 bg-practo-blue hover:bg-practo-blue-dark text-white font-semibold rounded-xl transition-all shadow-button disabled:opacity-50 text-sm">
                {ordering ? 'Placing Order...' : `Place Order — ₹${total}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineShop;
