const LoadingSpinner = ({ size = 'md', color = 'primary', text = '', overlay = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
      {text && <p className="text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;