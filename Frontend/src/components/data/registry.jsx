import Profile from "../protected/Profile/Profile.jsx";
import { ROLE_CODES } from "../../services/utils/rbac.js";

import {
  IconBuildingSkyscraper,
  IconHome,
  IconSettings,
  IconBuildingBank,
  IconWebhook,
  IconFileText,
  IconMoneybag,
  IconChartBar,
  IconUser,
  IconServer,
} from "@tabler/icons-react";
import PropertyTypes from "../protected/Masters/PropertyTypes.jsx";
import Users from "../protected/UserAccess/Users.jsx";
import Properties from "../protected/Properties/Properties.jsx";
import Brokers from "../protected/Brokers/Brokers.jsx";
import Agreements from "../protected/Agreements/Agreements.jsx";
import Payments from "../protected/Payments/Payments.jsx";
import Reports from "../protected/Reports/Reports.jsx";
import Tenants from "../protected/Tenants/Tenants.jsx";
import ServerStatus from "../common/ServerStatus.jsx";

const features = [
  {
    id: "dashboard",
    featureName: null,
    displayName: "Dashboard",
    logoUsed: IconHome,
    route: "/dashboard",
    allowedRoles: [
      ROLE_CODES.SUPER_ADMIN,
      ROLE_CODES.ADMIN,
      ROLE_CODES.ACCOUNTANT,
      ROLE_CODES.VIEWER,
    ],
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "properties",
    featureName: Properties,
    displayName: "Properties",
    logoUsed: IconBuildingBank,
    route: "/properties",
    allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER],
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "brokers",
    featureName: Brokers,
    displayName: "Brokers",
    logoUsed: IconWebhook,
    route: "/brokers",
    allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER],
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "tenants",
    featureName: Tenants,
    displayName: "Tenants",
    logoUsed: IconUser,
    route: "/tenants",
    allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER],
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "agreements",
    featureName: Agreements,
    displayName: "Agreements",
    logoUsed: IconFileText,
    route: "/agreements",
    allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER],
    hasSubmenu: false,
    submenu: [],
  },
    {
    id: "payments",
    featureName: Payments,
    displayName: "Payments",
    logoUsed: IconMoneybag,
    route: "/payments",
    allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER],
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "reports",
    featureName: Reports,
    displayName: "Reports",
    logoUsed: IconChartBar,
    route: "/reports",
    allowedRoles: [ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER],
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "server-status",
    featureName: ServerStatus,
    displayName: "Server Status",
    logoUsed: IconServer,
    route: "/server-status",
    allowedRoles: [
      ROLE_CODES.SUPER_ADMIN,
      ROLE_CODES.ADMIN,
      ROLE_CODES.ACCOUNTANT,
      ROLE_CODES.VIEWER,
    ],
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "masters",
    featureName: null,
    displayName: "Masters",
    logoUsed: IconBuildingSkyscraper,
    route: null,
    allowedRoles: [ROLE_CODES.ADMIN],
    hasSubmenu: true,
    submenu: [
      {
        label: "Property Types",
        route: "/masters/property-types",
        featureName: PropertyTypes,
        allowedRoles: [ROLE_CODES.ADMIN],
      },
    ],
  },
  {
    id: "settings",
    featureName: null,
    displayName: "Settings",
    logoUsed: IconSettings,
    route: null,
    allowedRoles: [
      ROLE_CODES.SUPER_ADMIN,
      ROLE_CODES.ADMIN,
      ROLE_CODES.ACCOUNTANT,
      ROLE_CODES.VIEWER,
    ],
    hasSubmenu: true,
    submenu: [
      {
        label: "Users",
        route: "/settings/users",
        featureName: Users,
        allowedRoles: [ROLE_CODES.ADMIN],
      },
      {
        label: "Account",
        route: "/profile",
        featureName: Profile,
        allowedRoles: [ROLE_CODES.SUPER_ADMIN],
      },
      {
        label: "Account",
        route: "/profile",
        featureName: Profile,
        allowedRoles: [ROLE_CODES.ADMIN],
      },
      {
        label: "Account",
        route: "/profile",
        featureName: Profile,
        allowedRoles: [ROLE_CODES.ACCOUNTANT],
      },
      {
        label: "Account",
        route: "/profile",
        featureName: Profile,
        allowedRoles: [ROLE_CODES.VIEWER],
      },
    ],
  },
];

export { features };
