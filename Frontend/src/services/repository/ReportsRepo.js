// Reports Repository
import { apiConnector } from '../Connector.js';
import { reportEndpoints } from '../Apis.js';
import { showValidationErrors, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const { PORTFOLIO, MONTHLY, YEARLY, LIFETIME, EXPIRING_SOON, OVERDUE, PROPERTY_REVENUE, PROPERTY_REPORT, TENANT_REPORT } = reportEndpoints;

// GET /v1/reports/portfolio
// response: data: { totalProperties, totalRentalValue, totalDepositValue, activeAgreements, expiringSoon, overduePayments }
export function getPortfolioReport() {
  return async () => {
    const toastId = showLoadingToast('Loading portfolio report...');
    try {
      const response = await apiConnector(PORTFOLIO.type, PORTFOLIO.url);

      if (response.data.success) {
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

// GET /v1/reports/monthly
// query: { year (required), month (required), propertyId?, page?, limit? }
// response: { data: [...{ agreementId, propertyId, tenantId, rentAmount, maintenanceCharges, totalAmount, paidAmount, pendingAmount, status }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function getMonthlyReport({ year, month, propertyId, page, limit } = {}) {
  return async () => {
    const toastId = showLoadingToast('Loading monthly report...');
    try {
      const params = new URLSearchParams();
      if (year !== undefined)                      params.append('year', year);
      if (month !== undefined)                     params.append('month', month);
      if (propertyId !== undefined && propertyId !== '') params.append('propertyId', propertyId);
      if (page !== undefined)                      params.append('page', page);
      if (limit !== undefined)                     params.append('limit', limit);

      const query = params.toString();
      const url = query ? `${MONTHLY.url}?${query}` : MONTHLY.url;

      const response = await apiConnector(MONTHLY.type, url);

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
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// GET /v1/reports/yearly
// query: { year (required), propertyId? }
// response: data: { year, totalRent, totalMaintenance, totalReceived, totalPending, properties: [...] }
export function getYearlyReport({ year, propertyId } = {}) {
  return async () => {
    const toastId = showLoadingToast('Loading yearly report...');
    try {
      const params = new URLSearchParams();
      if (year !== undefined)                      params.append('year', year);
      if (propertyId !== undefined && propertyId !== '') params.append('propertyId', propertyId);

      const query = params.toString();
      const url = query ? `${YEARLY.url}?${query}` : YEARLY.url;

      const response = await apiConnector(YEARLY.type, url);

      if (response.data.success) {
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

// GET /v1/reports/lifetime
// response: data: { totalRent, totalMaintenance, totalReceived, totalPending, agreements: [...] }
export function getLifetimeReport() {
  return async () => {
    const toastId = showLoadingToast('Loading lifetime report...');
    try {
      const response = await apiConnector(LIFETIME.type, LIFETIME.url);

      if (response.data.success) {
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

// GET /v1/reports/expiring-soon
// query: { days?, page?, limit? }
// response: { data: [...{ agreementId, propertyId, tenantId, endDate, status }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function getExpiringAgreementsReport({ days, page, limit } = {}) {
  return async () => {
    const toastId = showLoadingToast('Loading expiring agreements report...');
    try {
      const params = new URLSearchParams();
      if (days !== undefined)                      params.append('days', days);
      if (page !== undefined)                      params.append('page', page);
      if (limit !== undefined)                     params.append('limit', limit);

      const query = params.toString();
      const url = query ? `${EXPIRING_SOON.url}?${query}` : EXPIRING_SOON.url;

      const response = await apiConnector(EXPIRING_SOON.type, url);

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
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// GET /v1/reports/overdue
// query: { propertyId?, page?, limit? }
// response: { data: [...{ agreementId, propertyId, tenantId, rentAmount, dueDate, daysOverdue, status }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function getOverduePaymentsReport({ propertyId, page, limit } = {}) {
  return async () => {
    const toastId = showLoadingToast('Loading overdue payments report...');
    try {
      const params = new URLSearchParams();
      if (propertyId !== undefined && propertyId !== '') params.append('propertyId', propertyId);
      if (page !== undefined)                      params.append('page', page);
      if (limit !== undefined)                     params.append('limit', limit);

      const query = params.toString();
      const url = query ? `${OVERDUE.url}?${query}` : OVERDUE.url;

      const response = await apiConnector(OVERDUE.type, url);

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
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// GET /v1/reports/property-revenue
// query: { year?, page?, limit? }
// response: { data: [...{ propertyId, propertyName, totalRent, totalMaintenance, totalReceived, totalPending }], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function getPropertyRevenueReport({ year, page, limit } = {}) {
  return async () => {
    const toastId = showLoadingToast('Loading property revenue report...');
    try {
      const params = new URLSearchParams();
      if (year !== undefined)                      params.append('year', year);
      if (page !== undefined)                      params.append('page', page);
      if (limit !== undefined)                     params.append('limit', limit);

      const query = params.toString();
      const url = query ? `${PROPERTY_REVENUE.url}?${query}` : PROPERTY_REVENUE.url;

      const response = await apiConnector(PROPERTY_REVENUE.type, url);

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
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// GET /v1/reports/property/{propertyId}
// response: data: { propertyId, propertyName, address, totalRent, totalMaintenance, totalReceived, totalPending, agreements: [...] }
export function getPropertyReport(propertyId) {
  return async () => {
    const toastId = showLoadingToast('Loading property report...');
    try {
      const url = PROPERTY_REPORT.url.replace('{propertyId}', propertyId);
      const response = await apiConnector(PROPERTY_REPORT.type, url);

      if (response.data.success) {
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

// GET /v1/reports/tenant/{tenantId}
// response: data: { tenantId, tenantName, email, phone, totalRent, totalMaintenance, totalReceived, totalPending, agreements: [...] }
export function getTenantReport(tenantId) {
  return async () => {
    const toastId = showLoadingToast('Loading tenant report...');
    try {
      const url = TENANT_REPORT.url.replace('{tenantId}', tenantId);
      const response = await apiConnector(TENANT_REPORT.type, url);

      if (response.data.success) {
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
