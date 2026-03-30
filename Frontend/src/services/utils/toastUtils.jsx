import { toast } from 'react-hot-toast';

/**
 * Display a custom error toast with validation details
 * @param {Object} error - The error object from API response
 */
export const showValidationErrors = (error) => {
  const errorData = error.response?.data?.error || error.response?.data;
  
  if (!errorData) {
    toast.error('An unexpected error occurred. Please try again.');
    return;
  }

  // Normalize validation details from supported backend shapes.
  const normalizedDetails =
    (Array.isArray(errorData.errors) && errorData.errors.length > 0
      ? errorData.errors.map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const fieldPrefix = item.field ? `${item.field}: ` : '';
            return `${fieldPrefix}${item.message || 'Validation error'}`;
          }
          return 'Validation error';
        })
      : []) ||
    (Array.isArray(errorData.details) && errorData.details.length > 0
      ? errorData.details.map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const fieldPrefix = item.field ? `${item.field}: ` : '';
            return `${fieldPrefix}${item.message || 'Validation error'}`;
          }
          return 'Validation error';
        })
      : []);

  // Check if there are validation details
  if (normalizedDetails.length > 0) {
    // Create custom toast with styled validation errors
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex flex-col border border-red-100`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  {errorData.message || 'Validation Failed'}
                </h3>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Error Details List */}
          <div className="p-4 max-h-64 overflow-y-auto">
            <ul className="space-y-2">
              {normalizedDetails.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span>
                  <span className="text-gray-700 flex-1">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  } else {
    // Single error message
    const errorMessage = errorData.message || error.message || 'An error occurred';
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex items-start border border-red-100`}
        >
          <div className="flex items-center gap-3 p-4 w-full">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 text-sm text-gray-700">{errorMessage}</div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ),
      {
        duration: 4000,
        position: 'top-right',
      }
    );
  }
};

/**
 * Display a success toast with custom styling
 * @param {string} message - Success message to display
 */
export const showSuccessToast = (message) => {
  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex items-start border border-green-100`}
      >
        <div className="flex items-center gap-3 p-4 w-full">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 text-sm text-gray-700">{message}</div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: 'top-right',
    }
  );
};

/**
 * Display a loading toast with custom styling
 * @param {string} message - Loading message to display
 * @returns {string} Toast ID
 */
export const showLoadingToast = (message) => {
  return toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex items-center gap-3 border border-gray-100 p-4`}
      >
        <div className="animate-spin">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582A7 7 0 1016 16.418V11h4V4z" />
          </svg>
        </div>
        <div className="flex-1 text-sm text-gray-700">{message}</div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    ),
    {
      position: 'top-right',
      duration: Infinity,
    }
  );
};

/**
 * Display an error toast with custom styling
 * @param {string} message - Error message to display
 */
export const showErrorToast = (message) => {
  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex items-start border border-red-100`}
      >
        <div className="flex items-center gap-3 p-4 w-full">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 text-sm text-gray-700">{message}</div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: 'top-right',
    }
  );
};
