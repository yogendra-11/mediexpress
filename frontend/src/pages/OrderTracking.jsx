import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getOrder } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const createIcon = (emoji, size = 36) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="font-size:${size}px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

const deliveryIcon = createIcon('🛵', 40);
const pharmacyIcon = createIcon('🏥', 36);
const homeIcon = createIcon('🏠', 36);

const PHARMACY_POS = [28.6139, 77.2090];
const HOME_POS = [28.6280, 77.2185];

const generateRoute = (start, end, numPoints = 30) => {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const jLat = Math.sin(t * Math.PI) * 0.002 * (Math.random() - 0.5);
    const jLng = Math.cos(t * Math.PI) * 0.001 * (Math.random() - 0.5);
    points.push([start[0] + (end[0] - start[0]) * t + jLat, start[1] + (end[1] - start[1]) * t + jLng]);
  }
  return points;
};

const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] });
  }, [positions, map]);
  return null;
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryPos, setDeliveryPos] = useState(PHARMACY_POS);
  const [routePoints, setRoutePoints] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [eta, setEta] = useState(12);
  const intervalRef = useRef(null);
  const routeRef = useRef(null);

  // Fetch order and poll for updates
  useEffect(() => {
    const fetchOrder = () => getOrder(orderId).then(({ data }) => setOrder(data)).catch(console.error);
    fetchOrder().finally(() => setLoading(false));
    const poll = setInterval(fetchOrder, 5000);
    return () => clearInterval(poll);
  }, [orderId]);

  // Generate route once
  useEffect(() => {
    if (!routeRef.current) {
      routeRef.current = generateRoute(PHARMACY_POS, HOME_POS, 30);
      setRoutePoints(routeRef.current);
    }
  }, []);

  // Animate delivery partner when out_for_delivery
  useEffect(() => {
    if (!order || !routeRef.current) return;

    if (order.status === 'out_for_delivery') {
      if (intervalRef.current) return; // already running
      const route = routeRef.current;
      setDeliveryPos(route[currentStep]);
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          if (next >= route.length) { clearInterval(intervalRef.current); intervalRef.current = null; return prev; }
          setDeliveryPos(route[next]);
          setEta(Math.max(1, Math.round(12 * (1 - next / route.length))));
          return next;
        });
      }, 2000);
    } else if (order.status === 'delivered') {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      setDeliveryPos(HOME_POS);
      setCurrentStep(routeRef.current.length - 1);
      setEta(0);
    } else {
      // preparing, ready, etc — show at pharmacy
      setDeliveryPos(PHARMACY_POS);
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [order?.status]);

  if (loading) return <LoadingSpinner text="Loading order tracking..." />;
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-10 text-center"><p className="text-practo-gray">Order not found</p></div>;

  const progress = Math.round((currentStep / 30) * 100);
  const isDelivered = order.status === 'delivered';
  const isOutForDelivery = order.status === 'out_for_delivery';

  const statusMessages = {
    pending: { title: 'Order Placed', desc: 'Waiting for pharmacy to confirm', emoji: '📋' },
    confirmed: { title: 'Order Confirmed', desc: 'Pharmacy is reviewing your order', emoji: '✅' },
    preparing: { title: 'Preparing Medicines', desc: 'Pharmacy is packing your order', emoji: '📦' },
    ready: { title: 'Ready for Pickup', desc: 'Delivery partner is being assigned', emoji: '🏥' },
    out_for_delivery: { title: `Arriving in ${eta} mins`, desc: 'Your delivery partner is on the way', emoji: '🛵' },
    delivered: { title: 'Order Delivered!', desc: 'Your medicines have been delivered', emoji: '✅' },
  };
  const msg = statusMessages[order.status] || statusMessages.pending;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link to="/orders" className="text-practo-blue text-sm font-medium hover:underline mb-1 inline-block">← Back to Orders</Link>
          <h1 className="text-2xl font-bold text-practo-navy">Track Your Order</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* ETA Banner */}
      <div className={`rounded-2xl p-4 mb-4 flex items-center gap-4 ${isDelivered ? 'bg-emerald-50 border border-emerald-200' : isOutForDelivery ? 'bg-gradient-to-r from-practo-blue to-[#0b8ec4]' : 'bg-white border border-gray-200 shadow-card'}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isDelivered ? 'bg-emerald-100' : isOutForDelivery ? 'bg-white/20' : 'bg-practo-blue-light'}`}>
          {msg.emoji}
        </div>
        <div className="flex-1">
          <p className={`font-bold text-lg ${isDelivered ? 'text-emerald-800' : isOutForDelivery ? 'text-white' : 'text-practo-navy'}`}>{msg.title}</p>
          <p className={`text-sm ${isDelivered ? 'text-emerald-600' : isOutForDelivery ? 'text-white/80' : 'text-practo-gray'}`}>{msg.desc}</p>
        </div>
        {isOutForDelivery && (
          <div className="text-right flex-shrink-0">
            <p className="text-white/70 text-xs">Distance</p>
            <p className="text-white font-bold">{(1.5 * (1 - progress / 100)).toFixed(1)} km</p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((step, i, arr) => {
            const currentIdx = arr.indexOf(order.status);
            const isComplete = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${isComplete ? 'bg-practo-blue text-white' : 'bg-gray-200 text-gray-400'} ${isCurrent ? 'ring-4 ring-practo-blue/20' : ''}`}>
                  {isComplete ? '✓' : i + 1}
                </div>
                {i < arr.length - 1 && <div className={`h-0.5 flex-1 mx-1 transition-all ${i < currentIdx ? 'bg-practo-blue' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-practo-gray">
          <span>Placed</span><span>Confirmed</span><span>Preparing</span><span>Ready</span><span>On Way</span><span>Delivered</span>
        </div>
      </div>

      {/* Map — show for out_for_delivery, ready, or delivered */}
      {['ready', 'out_for_delivery', 'delivered'].includes(order.status) && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden mb-4" style={{ height: 380 }}>
          <MapContainer center={[28.6200, 77.2130]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitBounds positions={[PHARMACY_POS, HOME_POS, deliveryPos]} />
            <Polyline positions={routePoints} color="#14bef0" weight={4} opacity={0.4} dashArray="10,6" />
            {isOutForDelivery && <Polyline positions={routePoints.slice(0, currentStep + 1)} color="#14bef0" weight={4} opacity={1} />}
            <Marker position={PHARMACY_POS} icon={pharmacyIcon}><Popup><b>Pharmacy</b><br />Connaught Place, Delhi</Popup></Marker>
            <Marker position={HOME_POS} icon={homeIcon}><Popup><b>Your Location</b><br />{order.deliveryAddress || 'Home'}</Popup></Marker>
            <Marker position={deliveryPos} icon={deliveryIcon}><Popup><b>{order.deliveryPartnerId?.name || 'Delivery Partner'}</b><br />{isOutForDelivery ? 'On the way!' : isDelivered ? 'Delivered!' : 'At pharmacy'}</Popup></Marker>
          </MapContainer>
        </div>
      )}

      {/* Waiting for map states */}
      {['pending', 'confirmed', 'preparing'].includes(order.status) && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 mb-4 text-center">
          <div className="text-4xl mb-3">{order.status === 'preparing' ? '📦' : '⏳'}</div>
          <p className="text-practo-navy font-semibold">
            {order.status === 'preparing' ? 'Pharmacy is preparing your medicines...' : 'Waiting for order to be processed...'}
          </p>
          <p className="text-sm text-practo-gray mt-1">Live map tracking will appear once delivery starts</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
          <p className="text-xs font-semibold text-practo-gray uppercase tracking-wider mb-3">Delivery Partner</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg font-bold">
              {order.deliveryPartnerId?.name?.charAt(0) || '🚴'}
            </div>
            <div>
              <p className="text-practo-navy font-semibold">{order.deliveryPartnerId?.name || 'Assigning...'}</p>
              <p className="text-sm text-practo-gray">{order.deliveryPartnerId?.phone || 'Will be assigned when ready'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
          <p className="text-xs font-semibold text-practo-gray uppercase tracking-wider mb-3">Order Details</p>
          <div className="space-y-1.5 text-sm">
            <p className="text-practo-gray">Order ID: <span className="font-mono text-practo-navy">#{order._id?.slice(-8).toUpperCase()}</span></p>
            {order.deliveryAddress && <p className="text-practo-gray">📍 {order.deliveryAddress}</p>}
            {order.totalAmount > 0 && <p className="text-practo-gray">Amount: <span className="text-practo-green font-bold">₹{order.totalAmount}</span></p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
