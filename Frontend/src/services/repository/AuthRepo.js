// Authentication Repository
import { apiConnector } from '../Connector.js';
import { authEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';
import { setAccount, setUserAccess, LogOut } from '../../app/DashboardSlice.js';

const { LOGIN, REFRESH_TOKEN, ME, CHANGE_PASSWORD, LOGOUT } = authEndpoints;

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = showLoadingToast('Logging in...');
    try {
      const response = await apiConnector(LOGIN.type, LOGIN.url, { email, password });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        dispatch(
          setAccount({
            id: user.id,
            uname: user.name,
            uemail: user.email,
            role: user.role,
            roleCode: user.role,
            isActive: user.isActive,
            isLoggedIn: true,
          })
        );

        dispatch(
          setUserAccess({
            rolePermissions: {},
            processAccess: [],
            departmentAccess: [],
          })
        );

        showSuccessToast(response.data.message || 'Login successful.');
        navigate('/dashboard');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      showValidationErrors(error);
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function refreshToken(refreshTokenValue) {
  return async (dispatch) => {
    try {
      const response = await apiConnector(REFRESH_TOKEN.type, REFRESH_TOKEN.url, {
        refreshToken: refreshTokenValue,
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        dispatch(
          setAccount({
            id: user.id,
            uname: user.name,
            uemail: user.email,
            role: user.role,
            roleCode: user.role,
            isActive: user.isActive,
            isLoggedIn: true,
          })
        );

        return true;
      }

      throw new Error(response.data.message);
    } catch (error) {
      console.error('Refresh Token Error:', error);
      return false;
    }
  };
}

export function getMe() {
  return async () => {
    const toastId = showLoadingToast('Loading profile...');
    try {
      const response = await apiConnector(ME.type, ME.url);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      console.error('Get Me Error:', error);
      showValidationErrors(error);
      return null;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function changePassword(currentPassword, newPassword, confirmPassword) {
  return async () => {
    const toastId = showLoadingToast('Changing password...');
    try {
      const response = await apiConnector(CHANGE_PASSWORD.type, CHANGE_PASSWORD.url, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Password changed successfully.');
        return true;
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return false;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

export function logout(navigate) {
  return async (dispatch) => {
    const toastId = showLoadingToast('Logging out...');
    try {
      const response = await apiConnector(LOGOUT.type, LOGOUT.url);
      showSuccessToast(response.data?.message || 'Logged out successfully.');
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
      dispatch(LogOut());
      toast.dismiss(toastId);
      navigate('/');
    }
  };
}