// Property Type Repository
import { apiConnector } from '../Connector.js';
import { propertyTypeEndpoints } from '../Apis.js';
import { showValidationErrors, showSuccessToast, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const { CREATE, LIST, LIST_ACTIVE, GET_BY_ID, UPDATE, DELETE } = propertyTypeEndpoints;

// POST /v1/property-types
// body: { name, description }
// response: data: { id, name, description, is_active, created_at, updated_at }
export function createPropertyType(name, description) {
  return async () => {
    const toastId = showLoadingToast('Creating property type...');
    try {
      const response = await apiConnector(CREATE.type, CREATE.url, { name, description });

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property type created successfully.');
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

// GET /v1/property-types
// query: { search?, isActive?, page?, limit? }
// response: { data: [...], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
export function listPropertyTypes({ search, isActive, page, limit } = {}) {
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

// GET /v1/property-types/active
// response: data: [{ id, name, description }]
export function listActivePropertyTypes() {
  return async () => {
    try {
      const response = await apiConnector(LIST_ACTIVE.type, LIST_ACTIVE.url);

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

// GET /v1/property-types/{id}
// response: data: { id, name, description, is_active, created_at, updated_at, _count: { properties } }
export function getPropertyTypeById(id) {
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

// PATCH /v1/property-types/{id}
// body: { name?, description?, isActive? }
// response: data: { id, name, description, is_active, created_at, updated_at }
export function updatePropertyType(id, { name, description, isActive } = {}) {
  return async () => {
    const toastId = showLoadingToast('Updating property type...');
    try {
      const body = {};
      if (name !== undefined)        body.name = name;
      if (description !== undefined) body.description = description;
      if (isActive !== undefined)    body.isActive = isActive;

      const url = UPDATE.url.replace('{id}', id);
      const response = await apiConnector(UPDATE.type, url, body);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property type updated successfully.');
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

// DELETE /v1/property-types/{id}
// response: { success, message }
export function deletePropertyType(id) {
  return async () => {
    const toastId = showLoadingToast('Deleting property type...');
    try {
      const url = DELETE.url.replace('{id}', id);
      const response = await apiConnector(DELETE.type, url);

      if (response.data.success) {
        showSuccessToast(response.data.message || 'Property type deleted successfully.');
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