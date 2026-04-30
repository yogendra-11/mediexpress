const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200' },
    submitted: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', border: 'border-blue-200' },
    accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', border: 'border-red-200' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', border: 'border-blue-200' },
    preparing: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-200' },
    ready: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-400', border: 'border-teal-200' },
    out_for_delivery: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400 animate-pulse', border: 'border-purple-200' },
    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', border: 'border-gray-200' },
    scheduled: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400', border: 'border-sky-200' },
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400 animate-pulse', border: 'border-amber-200' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200' },
  };

  const s = config[status] || config.pending;
  const label = status?.replace(/_/g, ' ') || 'unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s.dot}`}></span>
      {label}
    </span>
  );
};

export default StatusBadge;
