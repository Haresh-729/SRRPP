import Profile from "../protected/Profile/Profile.jsx";
import { ROLE_CODES } from "../../services/utils/rbac.js";

import {
  IconBuildingSkyscraper,
  IconHome,
  IconSettings,
  IconBuildingBank,
} from "@tabler/icons-react";
import PropertyTypes from "../protected/Masters/PropertyTypes.jsx";
import Users from "../protected/UserAccess/Users.jsx";

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
