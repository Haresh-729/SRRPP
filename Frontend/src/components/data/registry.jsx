import SuperAdminProfile from "../protected/Profile/SuperAdminProfile.jsx";
import AdminProfile from "../protected/Profile/AdminProfile.jsx";
import AccountantProfile from "../protected/Profile/AccountantProfile.jsx";
import ViewerProfile from "../protected/Profile/ViewerProfile.jsx";
import { ROLE_CODES } from "../../services/utils/rbac.js";

import { IconBuildingSkyscraper, IconHome, IconSettings, IconBuildingBank } from "@tabler/icons-react";

const features = [
  {
    id: "dashboard",
    featureName: null,
    displayName: "Dashboard",
    logoUsed: IconHome,
    route: "/dashboard",
    allowedRoles: [ROLE_CODES.SUPER_ADMIN, ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER],
    hasSubmenu: false,
    submenu: [],
  },
  {
    id: "settings",
    featureName: null,
    displayName: "Settings",
    logoUsed: IconSettings,
    route: null,
    allowedRoles: [ROLE_CODES.SUPER_ADMIN, ROLE_CODES.ADMIN, ROLE_CODES.ACCOUNTANT, ROLE_CODES.VIEWER],
    hasSubmenu: true,
    submenu: [
      {
        label: "Account",
        route: "/super-admin/profile",
        featureName: SuperAdminProfile,
        allowedRoles: [ROLE_CODES.SUPER_ADMIN],
      },
      {
        label: "Account",
        route: "/admin/profile",
        featureName: AdminProfile,
        allowedRoles: [ROLE_CODES.ADMIN],
      },
      {
        label: "Account",
        route: "/accountant/profile",
        featureName: AccountantProfile,
        allowedRoles: [ROLE_CODES.ACCOUNTANT],
      },
      {
        label: "Account",
        route: "/viewer/profile",
        featureName: ViewerProfile,
        allowedRoles: [ROLE_CODES.VIEWER],
      },
    ],
  },
];

export { features };
