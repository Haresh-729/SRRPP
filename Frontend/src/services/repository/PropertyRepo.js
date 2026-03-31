// Property Repository
import { apiConnector } from '../Connector.js';
import { propertyEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const { CREATE, LIST, SUMMARY, GET_BY_ID, UPDATE, DELETE_PURCHASE_AGREEMENT, DELETE } = propertyEndpoints;

// POST /v1/properties
// body: { name, address, city, state, pincode, propertyTypeId, rentalValue, depositValue, maintenanceCharges, furnishedType, bhk, propertyImage, purchaseAgreementPdf }
// response: data: { id, name, address, city, state, pincode, propertyTypeId, rentalValue, depositValue, maintenanceCharges, furnishedType, bhk, status, propertyImage, purchaseAgreementPdf, isActive, createdAt, updatedAt }
export function createProperty(formData) {
  return async () => {
    const toastId = showLoadingToast('Creating property...');
    try {
      const response = await apiConnector(CREATE.type, CREATE.url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property created successfully.');
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

// GET /v1/properties
// query: { search?, status?, propertyTypeId?, isActive?, page?, limit? }
// response: { data: [...{ id, name, address, city, state, pincode, propertyTypeId, rentalValue, depositValue, maintenanceCharges, furnishedType, bhk, status, propertyImage, purchaseAgreementPdf, isActive, createdAt, updatedAt, propertyType, _count }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function listProperties({ search, status, propertyTypeId, isActive, page, limit } = {}) {
  return async () => {
    try {
      const params = new URLSearchParams();
      if (search !== undefined && search !== '')           params.append('search', search);
      if (status !== undefined && status !== '')           params.append('status', status);
      if (propertyTypeId !== undefined && propertyTypeId !== '') params.append('propertyTypeId', propertyTypeId);
      if (isActive !== undefined)                          params.append('isActive', isActive);
      if (page !== undefined)                              params.append('page', page);
      if (limit !== undefined)                             params.append('limit', limit);

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

// GET /v1/properties/summary
// response: data: { totalProperties, totalRentalValue, totalDepositValue, activeLeases, expiringSoon, overduePayments }
export function getPropertySummary() {
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

// GET /v1/properties/{id}
// response: data: { id, name, address, city, state, pincode, propertyTypeId, rentalValue, depositValue, maintenanceCharges, furnishedType, bhk, status, propertyImage, purchaseAgreementPdf, isActive, createdAt, updatedAt, propertyType, agreements, _count }
export function getPropertyById(id) {
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

// PATCH /v1/properties/{id}
// body: { name?, address?, city?, state?, pincode?, propertyTypeId?, rentalValue?, depositValue?, maintenanceCharges?, furnishedType?, bhk?, status?, propertyImage?, purchaseAgreementPdf?, isActive? }
// response: data: { id, name, address, city, state, pincode, propertyTypeId, rentalValue, depositValue, maintenanceCharges, furnishedType, bhk, status, propertyImage, purchaseAgreementPdf, isActive, createdAt, updatedAt }
export function updateProperty(id, formData) {
  return async () => {
    const toastId = showLoadingToast('Updating property...');
    try {
      const url = UPDATE.url.replace('{id}', id);
      const response = await apiConnector(UPDATE.type, url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property updated successfully.');
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

// DELETE /v1/properties/{id}/purchase-agreement-pdf
// response: { success, message }
export function deletePurchaseAgreementPdf(id) {
  return async () => {
    const toastId = showLoadingToast('Deleting purchase agreement pdf...');
    try {
      const url = DELETE_PURCHASE_AGREEMENT.url.replace('{id}', id);
      const response = await apiConnector(DELETE_PURCHASE_AGREEMENT.type, url);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Purchase agreement pdf deleted successfully.');
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

// DELETE /v1/properties/{id}
// response: { success, message }
export function deleteProperty(id) {
  return async () => {
    const toastId = showLoadingToast('Deleting property...');
    try {
      const url = DELETE.url.replace('{id}', id);
      const response = await apiConnector(DELETE.type, url);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property deleted successfully.');
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
