// Repository for managing authentication-related data in the application. This file contains methods for interacting with authentication data sources.
// Authentication Repository
import { apiConnector } from '../Connector.js';
import { authEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';
import { setAccount, setUserAccess, LogOut } from '../../app/DashboardSlice.js';
import { normalizeRole } from '../utils/rbac.js';

const {
  REGISTER,
  LOGIN,
  LOGOUT,
  REFRESH_TOKEN,
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
  CHANGE_PASSWORD,
  VERIFY_TOKEN,
  GET_PROFILE,
  UPDATE_PROFILE,
} = authEndpoints;

export function register(companyName, email, password, fullName, phone) {
  return async () => {
    const loadingToast = showLoadingToast('Creating account...');
    try {
      const response = await apiConnector(REGISTER.type, REGISTER.url, {
        company_name: companyName,
        email,
        password,
        full_name: fullName,
        phone,
      });

      console.log('Register API response:', response);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Registration Successful!');
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      console.log('Register API Error:', error);
      showValidationErrors(error);
      return null;
    } finally {
      toast.dismiss(loadingToast);
    }
  };
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const loadingToast = showLoadingToast('Logging in...');
    try {
      const response = await apiConnector(LOGIN.type, LOGIN.url, {
        email,
        password,
      });

      console.log('Login API response:', response);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Login Successful!');

        const userData = response.data.data.user;
        const accessToken = response.data.data.access_token;
        const refreshToken = response.data.data.refresh_token;
        const resolvedRole = normalizeRole(userData.roles?.[0]);

        if (accessToken) {
          localStorage.setItem('access_token', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        const temp = {
          id: userData.user_id,
          uname: userData.full_name,
          uemail: userData.email,
          role: resolvedRole,
          roleCode: resolvedRole,
          roles: userData.roles || [],
          tenantId: userData.tenant_id,
          companyName: userData.company_name,
          isLoggedIn: true,
        };

        dispatch(setAccount(temp));

        dispatch(
          setUserAccess({
            rolePermissions: userData.role_permissions || {},
            processAccess: [],
            departmentAccess: [],
          })
        );

        navigate('/dashboard');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.log('Login API Error:', error);
      showValidationErrors(error);
    }
    toast.dismiss(loadingToast);
  };
}

export function getMe() {
  return async () => {
    const loadingToast = showLoadingToast('Loading profile...');
    try {
      const response = await apiConnector(
        GET_PROFILE.type,
        GET_PROFILE.url
      );

      console.log('Get Profile API response:', response);

      if (response.data.success) {
        toast.dismiss(loadingToast);
        showSuccessToast(response.data.message || 'Profile loaded successfully!');
        return response.data.data;
      } else {
        toast.dismiss(loadingToast);
        showValidationErrors(response.data);
        return null;
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Get Me Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load profile';
      toast.error(errorMessage);
      return null;
    }
  };
}

export function updateMe(name, mobile) {
  return async (dispatch, getState) => {
    const toastId = showLoadingToast('Updating profile...');
    try {
      const response = await apiConnector(
        UPDATE_PROFILE.type,
        UPDATE_PROFILE.url,
        { full_name: name, phone: mobile }
      );

      console.log('Update Profile API response:', response);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Profile updated successfully!');

        // Update account state with new profile data
        const currentAccount = getState().dashboard.account;
        const updatedAccount = {
          ...currentAccount,
          uname: response.data.data.full_name,
        };
        dispatch(setAccount(updatedAccount));

        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.log('Update Me API Error:', error);
      showValidationErrors(error);
      return null;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function changePassword(currentPassword, newPassword) {
  return async () => {
    const toastId = showLoadingToast('Changing password...');
    try {
      const response = await apiConnector(
        CHANGE_PASSWORD.type,
        CHANGE_PASSWORD.url,
        { current_password: currentPassword, new_password: newPassword }
      );

      console.log('Change Password API response:', response);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Password changed successfully!');
        return true;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.log('Change Password API Error:', error);
      showValidationErrors(error);
      return false;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function refreshToken(refreshTokenValue) {
  return async () => {
    try {
      const response = await apiConnector(
        REFRESH_TOKEN.type,
        REFRESH_TOKEN.url,
        refreshTokenValue ? { refresh_token: refreshTokenValue } : undefined
      );

      console.log('Refresh Token API response:', response);

      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.log('Refresh Token API Error:', error);
      return false;
    }
  };
}

export function requestPasswordReset(email) {
  return async () => {
    const toastId = showLoadingToast('Sending reset link...');
    try {
      const response = await apiConnector(
        REQUEST_PASSWORD_RESET.type,
        REQUEST_PASSWORD_RESET.url,
        { email }
      );

      console.log('Request Password Reset API response:', response);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Reset link sent successfully!');
        return true;
      }

      throw new Error(response.data.message);
    } catch (error) {
      console.log('Request Password Reset API Error:', error);
      showValidationErrors(error);
      return false;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function resetPassword(token, newPassword) {
  return async () => {
    const toastId = showLoadingToast('Resetting password...');
    try {
      const response = await apiConnector(
        RESET_PASSWORD.type,
        RESET_PASSWORD.url,
        { token, new_password: newPassword }
      );

      console.log('Reset Password API response:', response);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Password reset successfully!');
        return true;
      }

      throw new Error(response.data.message);
    } catch (error) {
      console.log('Reset Password API Error:', error);
      showValidationErrors(error);
      return false;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function verifyToken(token) {
  return async () => {
    try {
      const response = await apiConnector(
        VERIFY_TOKEN.type,
        VERIFY_TOKEN.url,
        { token }
      );

      console.log('Verify Token API response:', response);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      console.log('Verify Token API Error:', error);
      return null;
    }
  };
}

export function logout(navigate) {
  return async (dispatch) => {
    const toastId = showLoadingToast('Logging out...');
    try {
      const response = await apiConnector(LOGOUT.type, LOGOUT.url);
      
      localStorage.removeItem('account');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
      dispatch(LogOut());
      showSuccessToast(response.data?.message || 'Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.log('Logout API Error:', error);
      // Even if logout API fails, clear local data
      localStorage.removeItem('account');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
      dispatch(LogOut());
      navigate('/');
    } finally {
      toast.dismiss(toastId);
    }
  };
}