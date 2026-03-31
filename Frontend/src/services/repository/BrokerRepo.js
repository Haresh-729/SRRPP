// Broker Repository
import { apiConnector } from '../Connector.js';
import { brokerEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const { CREATE, LIST, SUMMARY, GET_BY_ID, UPDATE, DELETE } = brokerEndpoints;

// POST /v1/brokers
// body: { name, email, phone, commissionPercentage, bankAccountNumber, bankIFSC, panNumber }
// response: data: { id, name, email, phone, commissionPercentage, bankAccountNumber, bankIFSC, panNumber, isActive, createdAt, updatedAt }
export function createBroker(formData) {
  return async () => {
    const toastId = showLoadingToast('Creating broker...');
    try {
      const response = await apiConnector(CREATE.type, CREATE.url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Broker created successfully.');
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

// GET /v1/brokers
// query: { search?, isActive?, page?, limit? }
// response: { data: [...{ id, name, email, phone, commissionPercentage, bankAccountNumber, bankIFSC, panNumber, isActive, createdAt, updatedAt, _count }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function listBrokers({ search, isActive, page, limit } = {}) {
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

// GET /v1/brokers/summary
// response: data: { totalBrokers, activeBrokers, inactiveBrokers }
export function getBrokerSummary() {
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

// GET /v1/brokers/{id}
// response: data: { id, name, email, phone, commissionPercentage, bankAccountNumber, bankIFSC, panNumber, isActive, createdAt, updatedAt, agreements }
export function getBrokerById(id) {
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

// PATCH /v1/brokers/{id}
// body: { name?, email?, phone?, commissionPercentage?, bankAccountNumber?, bankIFSC?, panNumber?, isActive? }
// response: data: { id, name, email, phone, commissionPercentage, bankAccountNumber, bankIFSC, panNumber, isActive, createdAt, updatedAt }
export function updateBroker(id, formData) {
  return async () => {
    const toastId = showLoadingToast('Updating broker...');
    try {
      const url = UPDATE.url.replace('{id}', id);
      const response = await apiConnector(UPDATE.type, url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Broker updated successfully.');
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

// DELETE /v1/brokers/{id}
// response: { success, message }
export function deleteBroker(id) {
  return async () => {
    const toastId = showLoadingToast('Deleting broker...');
    try {
      const url = DELETE.url.replace('{id}', id);
      const response = await apiConnector(DELETE.type, url);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Broker deleted successfully.');
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
