const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
      <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-practo-blue animate-spin"></div>
    </div>
    <p className="text-practo-gray mt-4 text-sm">{text}</p>
  </div>
);

export default LoadingSpinner;
