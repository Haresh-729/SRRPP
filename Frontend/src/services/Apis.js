// All API endpoints are declared here for centralized usage across frontend.
const BaseURL = import.meta.env.VITE_API_BASE_URL;

// HEALTH ENDPOINTS
export const healthEndpoints = {
  SERVER_HEALTH: { type: "GET", url: "/health" },
  API_HEALTH: { type: "GET", url: BaseURL + "/health" },
};

// AUTH ENDPOINTS
export const authEndpoints = {
  LOGIN: { type: "POST", url: BaseURL + "/v1/auth/login" },
  REFRESH_TOKEN: { type: "POST", url: BaseURL + "/v1/auth/refresh-token" },
  ME: { type: "GET", url: BaseURL + "/v1/auth/me" },
  CHANGE_PASSWORD: { type: "PATCH", url: BaseURL + "/v1/auth/change-password" },
  LOGOUT: { type: "POST", url: BaseURL + "/v1/auth/logout" },
};
// Total: 5

export const propertyTypeEndpoints = {
  CREATE: { type: "POST", url: BaseURL + "/v1/property-types" },
  LIST: { type: "GET", url: BaseURL + "/v1/property-types" },
  // query: ?search (optional) ?isActive (optional) ?page (optional) ?limit (optional)
  LIST_ACTIVE: { type: "GET", url: BaseURL + "/v1/property-types/active" },
  GET_BY_ID: { type: "GET", url: BaseURL + "/v1/property-types/{id}" },
  UPDATE: { type: "PATCH", url: BaseURL + "/v1/property-types/{id}" },
  DELETE: { type: "DELETE", url: BaseURL + "/v1/property-types/{id}" },
};
// Total: 6

export const userEndpoints = {
  CREATE: { type: "POST", url: BaseURL + "/v1/users" },
  LIST: { type: "GET", url: BaseURL + "/v1/users" },
  // query: ?search (optional) ?isActive (optional) ?page (optional) ?limit (optional)
  GET_BY_ID: { type: "GET", url: BaseURL + "/v1/users/{id}" },
  UPDATE: { type: "PATCH", url: BaseURL + "/v1/users/{id}" },
  RESET_PASSWORD: {
    type: "PATCH",
    url: BaseURL + "/v1/users/{id}/reset-password",
  },
  DELETE: { type: "DELETE", url: BaseURL + "/v1/users/{id}" },
  GET_PROPERTY_ACCESS: {
    type: "GET",
    url: BaseURL + "/v1/users/{id}/property-access",
  },
  ASSIGN_PROPERTY_ACCESS: {
    type: "POST",
    url: BaseURL + "/v1/users/{id}/property-access",
  },
  UPDATE_PROPERTY_ACCESS: {
    type: "PATCH",
    url: BaseURL + "/v1/users/property-access/{accessId}",
  },
  REVOKE_PROPERTY_ACCESS: {
    type: "DELETE",
    url: BaseURL + "/v1/users/property-access/{accessId}",
  },
};
// Total: 10

export const propertyEndpoints = {
  CREATE: { type: "POST", url: BaseURL + "/v1/properties" },
  LIST: { type: "GET", url: BaseURL + "/v1/properties" },
  // query: ?search (optional) ?status (optional) ?propertyTypeId (optional) ?isActive (optional) ?page (optional) ?limit (optional)
  SUMMARY: { type: "GET", url: BaseURL + "/v1/properties/summary" },
  GET_BY_ID: { type: "GET", url: BaseURL + "/v1/properties/{id}" },
  UPDATE: { type: "PATCH", url: BaseURL + "/v1/properties/{id}" },
  DELETE_PURCHASE_AGREEMENT: {
    type: "DELETE",
    url: BaseURL + "/v1/properties/{id}/purchase-agreement-pdf",
  },
  DELETE: { type: "DELETE", url: BaseURL + "/v1/properties/{id}" },
};
// Total: 7

export const tenantEndpoints = {
  CREATE: { type: "POST", url: BaseURL + "/v1/tenants" },
  LIST: { type: "GET", url: BaseURL + "/v1/tenants" },
  // query: ?search (optional) ?isActive (optional) ?page (optional) ?limit (optional)
  SUMMARY: { type: "GET", url: BaseURL + "/v1/tenants/summary" },
  GET_BY_ID: { type: "GET", url: BaseURL + "/v1/tenants/{id}" },
  UPDATE: { type: "PATCH", url: BaseURL + "/v1/tenants/{id}" },
  DELETE_DOC: {
    type: "DELETE",
    url: BaseURL + "/v1/tenants/{id}/documents/{docType}",
  },
  DELETE: { type: "DELETE", url: BaseURL + "/v1/tenants/{id}" },
};
// Total: 7

export const brokerEndpoints = {
  CREATE: { type: "POST", url: BaseURL + "/v1/brokers" },
  LIST: { type: "GET", url: BaseURL + "/v1/brokers" },
  // query: ?search (optional) ?isActive (optional) ?page (optional) ?limit (optional)
  SUMMARY: { type: "GET", url: BaseURL + "/v1/brokers/summary" },
  GET_BY_ID: { type: "GET", url: BaseURL + "/v1/brokers/{id}" },
  UPDATE: { type: "PATCH", url: BaseURL + "/v1/brokers/{id}" },
  DELETE: { type: "DELETE", url: BaseURL + "/v1/brokers/{id}" },
};
// Total: 6

export const agreementEndpoints = {
  CREATE: { type: "POST", url: BaseURL + "/v1/agreements" },
  LIST: { type: "GET", url: BaseURL + "/v1/agreements" },
  // query: ?page (optional) ?limit (optional) ?status (optional) ?propertyId (optional) ?tenantId (optional)
  GET_BY_ID: { type: "GET", url: BaseURL + "/v1/agreements/{id}" },
  GET_LEDGERS: { type: "GET", url: BaseURL + "/v1/agreements/{id}/ledgers" },
  UPDATE_PDF: { type: "PATCH", url: BaseURL + "/v1/agreements/{id}/pdf" },
  TERMINATE: { type: "PATCH", url: BaseURL + "/v1/agreements/{id}/terminate" },
  UPDATE_DEPOSIT: { type: "PUT", url: BaseURL + "/v1/agreements/{id}/deposit" },
  UPDATE_BROKERAGE: {
    type: "PUT",
    url: BaseURL + "/v1/agreements/{id}/brokerage",
  },
};
// Total: 8

export const paymentEndpoints = {
  RECORD_PAYMENT: {
    type: "POST",
    url: BaseURL + "/v1/payments/ledgers/{ledgerId}/record",
  },
  RECORD_ADVANCE_PAYMENT: {
    type: "POST",
    url: BaseURL + "/v1/payments/agreements/{agreementId}/advance",
  },
  LIST_PAYMENTS: { type: "GET", url: BaseURL + "/v1/payments" },
  // query: ?page (optional) ?limit (optional) ?agreementId (optional) ?tenantId (optional) ?propertyId (optional) ?paymentMode (optional) ?isAdvance (optional) ?fromDate (optional) ?toDate (optional)
  GET_PAYMENT_BY_ID: { type: "GET", url: BaseURL + "/v1/payments/{id}" },
  LIST_LEDGERS: { type: "GET", url: BaseURL + "/v1/payments/ledgers" },
  // query: ?page (optional) ?limit (optional) ?agreementId (optional) ?propertyId (optional) ?tenantId (optional) ?status (optional) ?month (optional)
  GET_LEDGER_BY_ID: { type: "GET", url: BaseURL + "/v1/payments/ledgers/{id}" },
  GET_LEDGER_PAYMENTS: {
    type: "GET",
    url: BaseURL + "/v1/payments/ledgers/{id}/payments",
  },
};
// Total: 7

export const reportEndpoints = {
  PORTFOLIO: { type: "GET", url: BaseURL + "/v1/reports/portfolio" },
  MONTHLY: { type: "GET", url: BaseURL + "/v1/reports/monthly" },
  // query: ?year (required) ?month (required) ?propertyId (optional) ?page (optional) ?limit (optional)
  YEARLY: { type: "GET", url: BaseURL + "/v1/reports/yearly" },
  // query: ?year (required) ?propertyId (optional)
  LIFETIME: { type: "GET", url: BaseURL + "/v1/reports/lifetime" },
  EXPIRING_SOON: { type: "GET", url: BaseURL + "/v1/reports/expiring-soon" },
  // query: ?days (optional) ?page (optional) ?limit (optional)
  OVERDUE: { type: "GET", url: BaseURL + "/v1/reports/overdue" },
  // query: ?propertyId (optional) ?page (optional) ?limit (optional)
  PROPERTY_REVENUE: {
    type: "GET",
    url: BaseURL + "/v1/reports/property-revenue",
  },
  // query: ?year (optional) ?page (optional) ?limit (optional)
  PROPERTY_REPORT: {
    type: "GET",
    url: BaseURL + "/v1/reports/property/{propertyId}",
  },
  TENANT_REPORT: {
    type: "GET",
    url: BaseURL + "/v1/reports/tenant/{tenantId}",
  },
};
// Total: 9

export const dashboardEndpoints = {
  GET_DASHBOARD: { type: "GET", url: BaseURL + "/v1/dashboard" },
};
// Total: 1

// Grand Total: 5+6+10+7+7+6+8+7+9+1 = 66
