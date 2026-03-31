// Tenant Repository
import { apiConnector } from '../Connector.js';
import { tenantEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const { CREATE, LIST, SUMMARY, GET_BY_ID, UPDATE, DELETE_DOC, DELETE } = tenantEndpoints;

// POST /v1/tenants
// body: { name, email, phone, aadharNumber, panNumber, aadharDocument, panDocument, permanentAddress, currentAddress }
// response: data: { id, name, email, phone, aadharNumber, panNumber, aadharDocument, panDocument, permanentAddress, currentAddress, isActive, createdAt, updatedAt }
export function createTenant(formData) {
  return async () => {
    const toastId = showLoadingToast('Creating tenant...');
    try {
      const response = await apiConnector(CREATE.type, CREATE.url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Tenant created successfully.');
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

// GET /v1/tenants
// query: { search?, isActive?, page?, limit? }
// response: { data: [...{ id, name, email, phone, aadharNumber, panNumber, aadharDocument, panDocument, permanentAddress, currentAddress, isActive, createdAt, updatedAt, _count }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function listTenants({ search, isActive, page, limit } = {}) {
  return async () => {
    try {
      const params = new URLSearchParams();
      if (search !== undefined && search !== '')  params.append('search', search);
      if (isActive !== undefined)                 params.append('isActive', isActive);
      if (page !== undefined)                     params.append('page', page);
      if (limit !== undefined)                    params.append('limit', limit);

      const query = params.toString();
      const url = query ? `${LIST.url}?${query}` : LIST.url;

      const response = await apiConnector(LIST.type, url);

      if (response.data.success) {
        return {
          data: response.data.data,
          meta: response.data.meta,
        };
      }

      throw new Error(response.data.message);
    } catch (error) {
      showValidationErrors(error);
      return null;
    }
  };
}

// GET /v1/tenants/summary
// response: data: { totalTenants, activeTenants, inactiveTenants }
export function getTenantSummary() {
  return async () => {
    try {
      const response = await apiConnector(SUMMARY.type, SUMMARY.url);

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

// GET /v1/tenants/{id}
// response: data: { id, name, email, phone, aadharNumber, panNumber, aadharDocument, panDocument, permanentAddress, currentAddress, isActive, createdAt, updatedAt, agreements }
export function getTenantById(id) {
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

// PATCH /v1/tenants/{id}
// body: { name?, email?, phone?, aadharNumber?, panNumber?, aadharDocument?, panDocument?, permanentAddress?, currentAddress?, isActive? }
// response: data: { id, name, email, phone, aadharNumber, panNumber, aadharDocument, panDocument, permanentAddress, currentAddress, isActive, createdAt, updatedAt }
export function updateTenant(id, formData) {
  return async () => {
    const toastId = showLoadingToast('Updating tenant...');
    try {
      const url = UPDATE.url.replace('{id}', id);
      const response = await apiConnector(UPDATE.type, url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Tenant updated successfully.');
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

// DELETE /v1/tenants/{id}/documents/{docType}
// response: { success, message }
export function deleteTenantDocument(id, docType) {
  return async () => {
    const toastId = showLoadingToast('Deleting document...');
    try {
      const url = DELETE_DOC.url.replace('{id}', id).replace('{docType}', docType);
      const response = await apiConnector(DELETE_DOC.type, url);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Document deleted successfully.');
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

// DELETE /v1/tenants/{id}
// response: { success, message }
export function deleteTenant(id) {
  return async () => {
    const toastId = showLoadingToast('Deleting tenant...');
    try {
      const url = DELETE.url.replace('{id}', id);
      const response = await apiConnector(DELETE.type, url);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Tenant deleted successfully.');
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
