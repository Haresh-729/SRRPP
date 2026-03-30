// All API endpoints are declared here for centralized usage across frontend.
const BaseURL = import.meta.env.VITE_API_BASE_URL;

// HEALTH ENDPOINTS
export const healthEndpoints = {
  SERVER_HEALTH: { type: 'GET', url: '/health' },
  API_HEALTH: { type: 'GET', url: BaseURL + '/health' }
};

// AUTH ENDPOINTS
export const authEndpoints = {
  REGISTER: { type: 'POST', url: BaseURL + '/v1/auth/register' },
  LOGIN: { type: 'POST', url: BaseURL + '/v1/auth/login' },
  LOGOUT: { type: 'POST', url: BaseURL + '/v1/auth/logout' },
  REFRESH_TOKEN: { type: 'POST', url: BaseURL + '/v1/auth/refresh-token' },
  REQUEST_PASSWORD_RESET: { type: 'POST', url: BaseURL + '/v1/auth/request-password-reset' },
  RESET_PASSWORD: { type: 'POST', url: BaseURL + '/v1/auth/reset-password' },
  CHANGE_PASSWORD: { type: 'POST', url: BaseURL + '/v1/auth/change-password' },
  VERIFY_TOKEN: { type: 'POST', url: BaseURL + '/v1/auth/verify-token' },
  GET_PROFILE: { type: 'GET', url: BaseURL + '/v1/auth/profile' },
  UPDATE_PROFILE: { type: 'PUT', url: BaseURL + '/v1/auth/profile' }
};