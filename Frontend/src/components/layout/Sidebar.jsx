import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  dashboardFeature,
  dashboardMenuState,
  selectAccount,
  setCloseDMenu,
  setDFeature,
} from "../../app/DashboardSlice.js";
import { features } from "../data/registry.jsx";
import { useNavigate } from "react-router-dom";
import { IconChevronDown, IconLayout, IconChevronRight } from "@tabler/icons-react";
import { hasRoleAccess } from "../../services/utils/rbac.js";

const Sidebar = ({ isOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState(["dashboards"]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const ifDMenuState = useSelector(dashboardMenuState);
  const dashboardFeatures = useSelector(dashboardFeature);
  const userAccount = useSelector(selectAccount);
  const currentRole = userAccount?.roleCode || userAccount?.role;

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-0 w-[230px] h-screen bg-(--brand-primary) flex flex-col z-50 border-r border-white/10">
      {/* Logo */}
      <div className="px-5 py-2 flex items-center space-x-3 border-b border-white/10">
        <div className="w-9 h-9">
          <svg fill="white" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"></path>
          </svg>
        </div>
        <span className="text-white text-xl font-black">BMS</span>
        <button
          className="ml-auto w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
          onClick={() => dispatch(setCloseDMenu({ dashboardMenuState: false }))}
        >
          <IconLayout className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {features.map(
            (item, index) =>
              hasRoleAccess(currentRole, item.allowedRoles) && 
              item.showInSidebar !== false && (
                <li key={index}>
                  {item.hasSubmenu ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.displayName)}
                        onMouseEnter={() => setHoveredItem(item.displayName)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white/80 transition-all duration-200 ${
                          hoveredItem === item.displayName
                            ? "bg-white/10 text-white"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.logoUsed className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {item.displayName}
                          </span>
                        </div>
                        {expandedMenus.includes(item.displayName) ? (
                          <IconChevronDown className="w-4 h-4 text-white" />
                        ) : (
                          <IconChevronRight className="w-4 h-4 text-white" />
                        )}
                      </button>
                      {expandedMenus.includes(item.displayName) &&
                        item.submenu && (
                          <ul className="mt-1 ml-4 space-y-1">
                            {item.submenu
                              .filter((subItem) =>
                                hasRoleAccess(currentRole, subItem.allowedRoles)
                              )
                              .map((subItem, subIndex) => (
                                <li key={subIndex}>
                                  <button
                                    onClick={() => {
                                      dispatch(
                                        setDFeature({
                                          dashboardFeature: item.id,
                                        })
                                      );
                                      navigate(subItem.route);
                                    }}
                                    onMouseEnter={() =>
                                      setHoveredItem(subItem.label)
                                    }
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                      window.location.pathname === subItem.route
                                        ? "bg-(--surface-card) text-(--brand-primary) font-medium"
                                        : hoveredItem === subItem.label
                                        ? "bg-white/10 text-white font-medium"
                                        : "text-white/70"
                                    }`}
                                  >
                                    {subItem.label}
                                  </button>
                                </li>
                              ))}
                          </ul>
                        )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(setDFeature({ dashboardFeature: item.id }));
                        navigate(item.route);
                      }}
                      onMouseEnter={() => setHoveredItem(item.displayName)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        window.location.pathname === item.route
                          ? "bg-(--surface-card) text-(--brand-primary) font-medium"
                          : "text-white/80"
                      } ${
                        hoveredItem === item.displayName
                          ? "bg-white/10 text-white"
                          : ""
                      }`}
                    >
                      <item.logoUsed className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {item.displayName}
                      </span>
                    </button>
                  )}
                </li>
              )
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;