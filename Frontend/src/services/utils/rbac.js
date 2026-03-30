export const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  VIEWER: 'VIEWER',
};

const ROLE_ALIAS = {
  super_admin: ROLE_CODES.SUPER_ADMIN,
  admin: ROLE_CODES.ADMIN,
  manager: ROLE_CODES.ACCOUNTANT,
  accountant: ROLE_CODES.ACCOUNTANT,
  executive: ROLE_CODES.ADMIN,
  operator: ROLE_CODES.VIEWER,
  viewer: ROLE_CODES.VIEWER,
};

export const RBAC_PERMISSIONS = {
  [ROLE_CODES.SUPER_ADMIN]: {
    user: ['*'],
    client: ['*'],
    report: ['*'],
    system: ['manage_tenants', 'manage_plans', 'view_all_data', 'system_config'],
    tenant: ['*'],
    invoice: ['*'],
    payment: ['*'],
    subscription: ['*'],
  },
  [ROLE_CODES.ADMIN]: {
    user: ['create', 'read', 'update', 'delete', 'assign_roles'],
    client: ['create', 'read', 'update', 'delete'],
    report: ['view_all', 'export'],
    tenant: ['view', 'update'],
    invoice: ['create', 'read', 'update', 'delete', 'send', 'cancel'],
    payment: ['create', 'read', 'update', 'delete'],
    tax_rate: ['create', 'read', 'update', 'delete'],
    recurring: ['create', 'read', 'update', 'delete'],
    subscription: ['view', 'upgrade', 'cancel'],
    billing_particular: ['create', 'read', 'update', 'delete'],
  },
  [ROLE_CODES.ACCOUNTANT]: {
    client: ['read'],
    report: ['view_all', 'export'],
    invoice: ['create', 'read', 'update', 'send'],
    payment: ['create', 'read', 'update'],
    tax_rate: ['read'],
    recurring: ['read'],
    subscription: ['view'],
    billing_particular: ['read'],
  },
  [ROLE_CODES.VIEWER]: {
    client: ['read'],
    report: ['view_all'],
    invoice: ['read'],
    payment: ['read'],
    tax_rate: ['read'],
    recurring: ['read'],
    subscription: ['view'],
    billing_particular: ['read'],
  },
};

export const normalizeRole = (roleCode) => {
  if (!roleCode) return null;
  const raw = String(roleCode).trim();
  const lower = raw.toLowerCase();
  return ROLE_ALIAS[lower] || raw.toUpperCase();
};

export const hasRoleAccess = (userRole, allowedRoles = []) => {
  const normalizedUserRole = normalizeRole(userRole);
  if (!normalizedUserRole) return false;

  const normalizedAllowed = allowedRoles.map((role) => normalizeRole(role));
  return normalizedAllowed.includes(normalizedUserRole);
};

export const hasPermission = (permissions = {}, resource, action) => {
  const actions = permissions?.[resource] || [];
  return actions.includes('*') || actions.includes(action);
};

export const getProfileRouteByRole = (roleCode) => {
  const role = normalizeRole(roleCode);

  if (role === ROLE_CODES.SUPER_ADMIN) return '/super-admin/profile';
  if (role === ROLE_CODES.ADMIN) return '/admin/profile';
  if (role === ROLE_CODES.ACCOUNTANT) return '/accountant/profile';
  if (role === ROLE_CODES.VIEWER) return '/viewer/profile';

  return '/profile';
};
