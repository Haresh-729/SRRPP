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

  if (normalizedDetails.length > 0) {
    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex flex-col border border-red-100`}
        >
          <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
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
              className="shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
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

          <div className="p-4 max-h-64 overflow-y-auto">
            <ul className="space-y-2">
              {normalizedDetails.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span>
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
    const errorMessage = errorData.message || error.message || 'An error occurred';
    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex items-start border border-red-100`}
        >
          <div className="flex items-center gap-3 p-4 w-full">
            <div className="shrink-0">
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
              className="shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
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
          <div className="shrink-0">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 text-sm text-gray-700">{message}</div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
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
        <div className="animate-spin shrink-0">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582A7 7 0 1016 16.418V11h4V4z" />
          </svg>
        </div>
        <div className="flex-1 text-sm text-gray-700">{message}</div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
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
          <div className="shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 text-sm text-gray-700">{message}</div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
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
 * Display a custom confirmation toast that resolves to true/false.
 * @param {string} message - Confirmation message to display.
 * @param {Object} options - Optional configuration.
 * @param {string} options.title - Toast title.
 * @param {string} options.confirmText - Label for the confirm action.
 * @param {string} options.cancelText - Label for the cancel action.
 * @returns {Promise<boolean>}
 */
export const showConfirmToast = (message, options = {}) => {
  const {
    title = 'Confirm action',
    confirmText = 'Continue',
    cancelText = 'Cancel',
  } = options;

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value, toastId) => {
      if (settled) return;
      settled = true;
      resolve(value);
      toast.dismiss(toastId);
    };

    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-lg pointer-events-auto flex items-start border border-amber-100`}
        >
          <div className="flex items-start gap-3 p-4 w-full">
            <div className="shrink-0 mt-0.5">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-700">{message}</p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => finish(false, t.id)}
                  className="px-3 py-2 rounded-md text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => finish(true, t.id)}
                  className="px-3 py-2 rounded-md text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  {confirmText}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => finish(false, t.id)}
              className="shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Dismiss confirmation"
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
        duration: Infinity,
        position: 'top-right',
      }
    );
  });
};
