// User Access Repository
import { apiConnector } from '../Connector.js';
import { userEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const {
  CREATE,
  LIST,
  GET_BY_ID,
  UPDATE,
  RESET_PASSWORD,
  DELETE,
  GET_PROPERTY_ACCESS,
  ASSIGN_PROPERTY_ACCESS,
  UPDATE_PROPERTY_ACCESS,
  REVOKE_PROPERTY_ACCESS,
} = userEndpoints;

// POST /v1/users
// body: { name, email, password }
// response: data: { id, name, email, role, isActive, createdAt }
export function createUser(name, email, password) {
  return async () => {
    const toastId = showLoadingToast('Creating user...');
    try {
      const response = await apiConnector(CREATE.type, CREATE.url, { name, email, password });

      if (response.data.success) {
        showSuccessToast(response.data.message || 'User created successfully.');
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return null;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// GET /v1/users
// query: { search?, isActive?, page?, limit? }
// response: { data: [...{ id, name, email, role, isActive, createdAt, propertyAccess }], meta }
export function listUsers({ search, isActive, page, limit } = {}) {
  return async () => {
    try {
      const params = new URLSearchParams();
      if (search !== undefined && search !== '')  params.append('search', search);
      if (isActive !== undefined && isActive !== '') params.append('isActive', isActive);
      if (page !== undefined)                     params.append('page', page);
      if (limit !== undefined)                    params.append('limit', limit);

      const query = params.toString();
      const url = query ? `${LIST.url}?${query}` : LIST.url;

      const response = await apiConnector(LIST.type, url);

      if (response.data.success) {
        return { data: response.data.data, meta: response.data.meta };
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return null;
    }
  };
}

// GET /v1/users/{id}
// response: data: { id, name, email, role, isActive, createdAt, updatedAt, propertyAccess }
export function getUserById(id) {
  return async () => {
    try {
      const url = GET_BY_ID.url.replace('{id}', id);
      const response = await apiConnector(GET_BY_ID.type, url);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return null;
    }
  };
}

// PATCH /v1/users/{id}
// body: { name?, isActive? }
// response: data: { id, name, email, role, isActive, updatedAt }
export function updateUser(id, { name, isActive } = {}) {
  return async () => {
    const toastId = showLoadingToast('Updating user...');
    try {
      const body = {};
      if (name !== undefined)     body.name = name;
      if (isActive !== undefined) body.isActive = isActive;

      const url = UPDATE.url.replace('{id}', id);
      const response = await apiConnector(UPDATE.type, url, body);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'User updated successfully.');
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return null;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// PATCH /v1/users/{id}/reset-password
// body: { newPassword }
// response: { success, message }
export function resetUserPassword(id, newPassword) {
  return async () => {
    const toastId = showLoadingToast('Resetting password...');
    try {
      const url = RESET_PASSWORD.url.replace('{id}', id);
      const response = await apiConnector(RESET_PASSWORD.type, url, { newPassword });

      if (response.data.success) {
        showSuccessToast(response.data.message || 'User password reset successfully.');
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

// DELETE /v1/users/{id}
// response: { success, message }
export function deleteUser(id) {
  return async () => {
    const toastId = showLoadingToast('Deleting user...');
    try {
      const url = DELETE.url.replace('{id}', id);
      const response = await apiConnector(DELETE.type, url);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'User deleted successfully.');
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

// GET /v1/users/{id}/property-access
// response: data: [{ id, userId, propertyId, validFrom, validTo, isActive, createdAt, updatedAt, property: { id, name, address, status, isActive, propertyType } }]
export function getPropertyAccess(userId) {
  return async () => {
    try {
      const url = GET_PROPERTY_ACCESS.url.replace('{id}', userId);
      const response = await apiConnector(GET_PROPERTY_ACCESS.type, url);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return null;
    }
  };
}

// POST /v1/users/{id}/property-access
// body: { propertyId, validFrom, validTo }
// response: data: { id, userId, propertyId, validFrom, validTo, isActive, createdAt, updatedAt, property: { id, name, status, isActive } }
export function assignPropertyAccess(userId, propertyId, validFrom, validTo) {
  return async () => {
    const toastId = showLoadingToast('Assigning property access...');
    try {
      const url = ASSIGN_PROPERTY_ACCESS.url.replace('{id}', userId);
      const response = await apiConnector(ASSIGN_PROPERTY_ACCESS.type, url, {
        propertyId,
        validFrom,
        validTo,
      });

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property access assigned successfully.');
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return null;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// PATCH /v1/users/property-access/{accessId}
// body: { validTo?, isActive? }
// response: data: { id, userId, propertyId, validFrom, validTo, isActive, createdAt, updatedAt, property: { id, name, status, isActive } }
export function updatePropertyAccess(accessId, { validFrom, validTo, isActive } = {}) {
  return async () => {
    const toastId = showLoadingToast('Updating property access...');
    try {
      const body = {};
      if (validFrom !== undefined) body.validFrom = validFrom;
      if (validTo !== undefined)   body.validTo = validTo;
      if (isActive !== undefined)  body.isActive = isActive;

      const url = UPDATE_PROPERTY_ACCESS.url.replace('{accessId}', accessId);
      const response = await apiConnector(UPDATE_PROPERTY_ACCESS.type, url, body);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property access updated successfully.');
        return response.data.data;
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return null;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// DELETE /v1/users/property-access/{accessId}
// response: { success, message }
export function revokePropertyAccess(accessId) {
  return async () => {
    const toastId = showLoadingToast('Revoking property access...');
    try {
      const url = REVOKE_PROPERTY_ACCESS.url.replace('{accessId}', accessId);
      const response = await apiConnector(REVOKE_PROPERTY_ACCESS.type, url);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property access revoked successfully.');
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