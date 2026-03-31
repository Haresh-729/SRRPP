// Payment Repository
import { apiConnector } from '../Connector.js';
import { paymentEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const { RECORD_PAYMENT, RECORD_ADVANCE_PAYMENT, LIST_PAYMENTS, GET_PAYMENT_BY_ID, LIST_LEDGERS, GET_LEDGER_BY_ID, GET_LEDGER_PAYMENTS } = paymentEndpoints;

// POST /v1/payments/ledgers/{ledgerId}/record
// body: { amount, paymentDate, paymentMode, chequeNumber?, utrNumber?, notes? }
// response: data: { id, ledgerId, amount, paymentDate, paymentMode, chequeNumber, utrNumber, notes, status, createdAt, updatedAt }
export function recordPayment(ledgerId, formData) {
  return async () => {
    const toastId = showLoadingToast('Recording payment...');
    try {
      const url = RECORD_PAYMENT.url.replace('{ledgerId}', ledgerId);
      const response = await apiConnector(RECORD_PAYMENT.type, url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Payment recorded successfully.');
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

// POST /v1/payments/agreements/{agreementId}/advance
// body: { amount, paymentDate, paymentMode, chequeNumber?, utrNumber?, notes? }
// response: data: { id, agreementId, amount, paymentDate, paymentMode, chequeNumber, utrNumber, notes, isAdvance, status, createdAt, updatedAt }
export function recordAdvancePayment(agreementId, formData) {
  return async () => {
    const toastId = showLoadingToast('Recording advance payment...');
    try {
      const url = RECORD_ADVANCE_PAYMENT.url.replace('{agreementId}', agreementId);
      const response = await apiConnector(RECORD_ADVANCE_PAYMENT.type, url, formData);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Advance payment recorded successfully.');
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

// GET /v1/payments
// query: { page?, limit?, agreementId?, tenantId?, propertyId?, paymentMode?, isAdvance?, fromDate?, toDate? }
// response: { data: [...{ id, agreementId, ledgerId, amount, paymentDate, paymentMode, chequeNumber, utrNumber, notes, isAdvance, status, createdAt, updatedAt, agreement, ledger }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function listPayments({ page, limit, agreementId, tenantId, propertyId, paymentMode, isAdvance, fromDate, toDate } = {}) {
  return async () => {
    try {
      const params = new URLSearchParams();
      if (page !== undefined)                             params.append('page', page);
      if (limit !== undefined)                            params.append('limit', limit);
      if (agreementId !== undefined && agreementId !== '') params.append('agreementId', agreementId);
      if (tenantId !== undefined && tenantId !== '')       params.append('tenantId', tenantId);
      if (propertyId !== undefined && propertyId !== '')   params.append('propertyId', propertyId);
      if (paymentMode !== undefined && paymentMode !== '') params.append('paymentMode', paymentMode);
      if (isAdvance !== undefined)                         params.append('isAdvance', isAdvance);
      if (fromDate !== undefined && fromDate !== '')       params.append('fromDate', fromDate);
      if (toDate !== undefined && toDate !== '')           params.append('toDate', toDate);

      const query = params.toString();
      const url = query ? `${LIST_PAYMENTS.url}?${query}` : LIST_PAYMENTS.url;

      const response = await apiConnector(LIST_PAYMENTS.type, url);

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

// GET /v1/payments/{id}
// response: data: { id, agreementId, ledgerId, amount, paymentDate, paymentMode, chequeNumber, utrNumber, notes, isAdvance, status, createdAt, updatedAt, agreement, ledger }
export function getPaymentById(id) {
  return async () => {
    try {
      const url = GET_PAYMENT_BY_ID.url.replace('{id}', id);
      const response = await apiConnector(GET_PAYMENT_BY_ID.type, url);

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

// GET /v1/payments/ledgers
// query: { page?, limit?, agreementId?, propertyId?, tenantId?, status?, month? }
// response: { data: [...{ id, agreementId, month, year, rentAmount, maintenanceCharges, totalAmount, paidAmount, pendingAmount, status, dueDate, createdAt, updatedAt, agreement, payments }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function listLedgers({ page, limit, agreementId, propertyId, tenantId, status, month } = {}) {
  return async () => {
    try {
      const params = new URLSearchParams();
      if (page !== undefined)                             params.append('page', page);
      if (limit !== undefined)                            params.append('limit', limit);
      if (agreementId !== undefined && agreementId !== '') params.append('agreementId', agreementId);
      if (propertyId !== undefined && propertyId !== '')   params.append('propertyId', propertyId);
      if (tenantId !== undefined && tenantId !== '')       params.append('tenantId', tenantId);
      if (status !== undefined && status !== '')           params.append('status', status);
      if (month !== undefined && month !== '')             params.append('month', month);

      const query = params.toString();
      const url = query ? `${LIST_LEDGERS.url}?${query}` : LIST_LEDGERS.url;

      const response = await apiConnector(LIST_LEDGERS.type, url);

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

// GET /v1/payments/ledgers/{id}
// response: data: { id, agreementId, month, year, rentAmount, maintenanceCharges, totalAmount, paidAmount, pendingAmount, status, dueDate, createdAt, updatedAt, agreement, payments }
export function getLedgerById(id) {
  return async () => {
    try {
      const url = GET_LEDGER_BY_ID.url.replace('{id}', id);
      const response = await apiConnector(GET_LEDGER_BY_ID.type, url);

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

// GET /v1/payments/ledgers/{id}/payments
// response: data: [{ id, ledgerId, amount, paymentDate, paymentMode, chequeNumber, utrNumber, notes, status, createdAt, updatedAt }]
export function getLedgerPayments(id) {
  return async () => {
    try {
      const url = GET_LEDGER_PAYMENTS.url.replace('{id}', id);
      const response = await apiConnector(GET_LEDGER_PAYMENTS.type, url);

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
