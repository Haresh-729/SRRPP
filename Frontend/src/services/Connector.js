//This will create an axios instance so no need to create and call the axios functions everywhere just call the function and pass data to this Connector object.
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with a base URL
export const axiosInstance = axios.create({
  baseURL: apiUrl || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Attach bearer token when available.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle empty/null responses
axiosInstance.interceptors.response.use(
  (response) => {
    // If response data is null or undefined, set it to an empty object
    if (response.data === null || response.data === undefined) {
      response.data = { success: true };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API Connector Function
export const apiConnector = (method, url, bodyData, headers, params) => {
  console.log('API Connector: ', method, url, bodyData, headers, params);

  headers = headers || {};

  const token = localStorage.getItem('access_token');
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // If sending FormData, remove any existing Content-Type header so
  // the browser/axios can set multipart/form-data with the proper boundary.
  if (typeof FormData !== 'undefined' && bodyData instanceof FormData) {
    // Remove any Content-Type header from the per-request headers (both cases)
    if (headers['Content-Type']) delete headers['Content-Type'];
    if (headers['content-type']) delete headers['content-type'];
    // Also remove instance default headers in common/post so axios doesn't force JSON
    if (axiosInstance.defaults && axiosInstance.defaults.headers) {
      const defaults = axiosInstance.defaults.headers;
      if (defaults.common) {
        if (defaults.common['Content-Type']) delete defaults.common['Content-Type'];
        if (defaults.common['content-type']) delete defaults.common['content-type'];
      }
      if (defaults.post) {
        if (defaults.post['Content-Type']) delete defaults.post['Content-Type'];
        if (defaults.post['content-type']) delete defaults.post['content-type'];
      }
    }
    // Ensure the config headers explicitly don't set a content-type so the browser sets the boundary
    headers['Content-Type'] = undefined;
  }
  console.log('byee');
  
  // Build axios config - only include data if bodyData is not undefined
  const config = {
    method,
    url,
    headers,
    params: params || undefined,
  };
  
  // Only add data property if bodyData is provided (not undefined)
  if (bodyData !== undefined) {
    config.data = bodyData;
  }
  
  return axiosInstance(config);
};

// Provide a default export for backwards compatibility with existing imports
export default apiConnector;