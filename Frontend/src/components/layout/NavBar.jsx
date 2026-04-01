import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCloseDMenu,
  dashboardMenuState,
  selectAccount,
  setDFeature,
  toggleTheme,
  isThemeDark,
} from "../../app/DashboardSlice";
import { logout } from "../../services/repository/AuthRepo.js";
import { getProfileRouteByRole } from "../../services/utils/rbac.js";
import { useNavigate } from "react-router-dom";
import {
  IconInbox,
  IconLogout2,
  IconMenu2,
  IconSettings,
  IconUser,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";

function NavBar() {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const ifDMenuState = useSelector(dashboardMenuState);
  const isDarkMode = useSelector(isThemeDark);
  const user = useSelector(selectAccount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRoute = "/profile";

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    const newTheme = !isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const onMenuToggle = () => {
    dispatch(
      setCloseDMenu({
        dashboardMenuState: !ifDMenuState,
      }),
    );
  };

  const logout = () => {
    dispatch(logout(navigate));
  };

  return (
    <header className="bg-(--surface-card) border-b border-(--surface-border) px-6 py-1 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu Toggle */}
        <div className="flex items-center space-x-4">
          {!ifDMenuState && (
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-(--surface-bg) rounded-lg transition-colors"
            >
              <IconMenu2 className="w-6 h-6 text-(--text-main)" />
            </button>
          )}
        </div>

        {/* Right Section - User Profile */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 hover:bg-(--surface-bg) rounded-lg transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <IconSun className="w-6 h-6 text-(--text-main)" />
            ) : (
              <IconMoon className="w-6 h-6" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            <button
              className="flex items-center space-x-3 p-2 hover:bg-(--surface-bg) rounded-lg transition-colors"
              title="Profile"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-(--text-main)">
                  {user.uname || "User"}
                </span>
                <div className="w-8 h-8 rounded-full bg-(--brand-primary) text-(--text-inverse) flex items-center justify-center font-semibold text-sm">
                  {user.uname ? user.uname.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full pt-2 z-50">
                <div className="bg-(--surface-card) rounded-lg shadow-lg border border-(--surface-border) py-2 min-w-[200px]">
                  <button
                    onClick={() => {
                      navigate(profileRoute);
                      dispatch(
                        setDFeature({
                          dashboardFeature: "Profile",
                        }),
                      );
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-(--text-main) hover:bg-(--surface-bg) transition-colors"
                  >
                    <IconUser className="w-5" />
                    <span>Account</span>
                  </button>
                  {/* <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-(--text-main) hover:bg-(--surface-bg) transition-colors">
                    <IconInbox className="w-5" />
                    <span>Inbox</span>
                  </button> */}
                  <button
                    onClick={() => {
                      navigate(profileRoute);
                      dispatch(
                        setDFeature({
                          dashboardFeature: "Profile",
                        }),
                      );
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-(--text-main) hover:bg-(--surface-bg) transition-colors"
                  >
                    <IconSettings className="w-5" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-(--surface-border) my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-(--text-main) hover:bg-(--surface-bg) transition-colors"
                  >
                    <IconLogout2 className="w-5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
