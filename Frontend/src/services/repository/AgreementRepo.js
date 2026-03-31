// Agreement Repository
import { apiConnector } from '../Connector.js';
import { agreementEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const { CREATE, LIST, GET_BY_ID, GET_LEDGERS, UPDATE_PDF, TERMINATE, UPDATE_DEPOSIT, UPDATE_BROKERAGE } = agreementEndpoints;

// POST /v1/agreements
// body: { propertyId, tenantId, startDate, endDate, rentalAmount, depositAmount, maintenanceCharges, brokerId?, brokerageType?, brokerageValue? }
// response: data: { id, propertyId, tenantId, startDate, endDate, rentalAmount, depositAmount, maintenanceCharges, brokerId, brokerageType, brokerageValue, status, agreementPdf, isActive, createdAt, updatedAt }
export function createAgreement(formData) {
  return async () => {
    const toastId = showLoadingToast('Creating agreement...');
    try {
      const response = await apiConnector(CREATE.type, CREATE.url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Agreement created successfully.');
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

// GET /v1/agreements
// query: { page?, limit?, status?, propertyId?, tenantId? }
// response: { data: [...{ id, propertyId, tenantId, startDate, endDate, rentalAmount, depositAmount, maintenanceCharges, brokerId, brokerageType, brokerageValue, status, agreementPdf, isActive, createdAt, updatedAt, property, tenant, broker }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function listAgreements({ page, limit, status, propertyId, tenantId } = {}) {
  return async () => {
    try {
      const params = new URLSearchParams();
      if (page !== undefined)                      params.append('page', page);
      if (limit !== undefined)                     params.append('limit', limit);
      if (status !== undefined && status !== '')   params.append('status', status);
      if (propertyId !== undefined && propertyId !== '') params.append('propertyId', propertyId);
      if (tenantId !== undefined && tenantId !== '') params.append('tenantId', tenantId);

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

// GET /v1/agreements/{id}
// response: data: { id, propertyId, tenantId, startDate, endDate, rentalAmount, depositAmount, maintenanceCharges, brokerId, brokerageType, brokerageValue, status, agreementPdf, isActive, createdAt, updatedAt, property, tenant, broker, ledgers }
export function getAgreementById(id) {
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

// GET /v1/agreements/{id}/ledgers
// response: data: [{ id, agreementId, month, year, rentAmount, maintenanceCharges, totalAmount, paidAmount, pendingAmount, status, dueDate, createdAt, updatedAt, payments }]
export function getAgreementLedgers(id) {
  return async () => {
    try {
      const url = GET_LEDGERS.url.replace('{id}', id);
      const response = await apiConnector(GET_LEDGERS.type, url);

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

// PATCH /v1/agreements/{id}/pdf
// body: { agreementPdf }
// response: { success, message }
export function updateAgreementPdf(id, agreementPdf) {
  return async () => {
    const toastId = showLoadingToast('Updating agreement pdf...');
    try {
      const url = UPDATE_PDF.url.replace('{id}', id);
      const response = await apiConnector(UPDATE_PDF.type, url, { agreementPdf });

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Agreement pdf updated successfully.');
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

// PATCH /v1/agreements/{id}/terminate
// body: { terminationDate }
// response: data: { id, status, terminationDate, updatedAt }
export function terminateAgreement(id, terminationDate) {
  return async () => {
    const toastId = showLoadingToast('Terminating agreement...');
    try {
      const url = TERMINATE.url.replace('{id}', id);
      const response = await apiConnector(TERMINATE.type, url, { terminationDate });

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Agreement terminated successfully.');
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

// PUT /v1/agreements/{id}/deposit
// body: { depositAmount, depositDate?, depositMode? }
// response: data: { id, depositAmount, depositDate, depositMode, updatedAt }
export function updateAgreementDeposit(id, formData) {
  return async () => {
    const toastId = showLoadingToast('Updating deposit details...');
    try {
      const url = UPDATE_DEPOSIT.url.replace('{id}', id);
      const response = await apiConnector(UPDATE_DEPOSIT.type, url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Deposit details updated successfully.');
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

// PUT /v1/agreements/{id}/brokerage
// body: { brokerageType, brokerageValue }
// response: data: { id, brokerageType, brokerageValue, updatedAt }
export function updateAgreementBrokerage(id, formData) {
  return async () => {
    const toastId = showLoadingToast('Updating brokerage details...');
    try {
      const url = UPDATE_BROKERAGE.url.replace('{id}', id);
      const response = await apiConnector(UPDATE_BROKERAGE.type, url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Brokerage details updated successfully.');
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
