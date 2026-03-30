import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { HeroPage } from "./components";
import { dashboardMenuState, selectAccount } from "./app/DashboardSlice";
import { isUserLoggedIn } from "./app/DashboardSlice";

// Protected Components
import NavBar from "./components/layout/NavBar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import { features } from "./components/data/registry.jsx";

// import all the features here no need to create routes manually...
import Login from "./components/common/Login.jsx";
import NotFound from "./components/common/NotFound.jsx";
import VerifyEmail from "./components/common/VerifyEmail.jsx";
import Register from "./components/common/Register.jsx";
import ResetPassword from "./components/common/ResetPassword.jsx";
import { hasRoleAccess } from "./services/utils/rbac.js";
import Profile from "./components/protected/Profile/Profile.jsx";

const TemplateDashboard = () => (
  <section className="p-8">
    <h1 className="text-2xl font-semibold">Dashboard</h1>
    <p className="mt-2 text-gray-600">Template dashboard placeholder.</p>
  </section>
);

const RoutesConfig = () => {
  const isLoggedIn = useSelector(isUserLoggedIn);
  const ifDMenuState = useSelector(dashboardMenuState);

  const userAccount = useSelector(selectAccount);
  const currentRole = userAccount?.roleCode || userAccount?.role;
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route
          path="/"
          key={"home"}
          className="transition-all scrollbar-hide"
          element={<HeroPage />}
        />
        <Route path="/login" key={"login"} element={<Login />} />
        <Route path="/register" key={"register"} element={<Register />} />
        <Route path="/reset-password" key={"reset-password"} element={<ResetPassword />} />
        <Route path="/verify-email" key={"verify-email"} element={<VerifyEmail />} />
        <Route path="/not-found" key={"not-found"} element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  } else {
    return (
      <div className="w-full min-h-screen bg-[#f4f5fa] flex">
        <Sidebar isOpen={ifDMenuState} />
        <div
          className={`flex-1 flex flex-col ${
            ifDMenuState ? "ml-[230px]" : "ml-0"
          } transition-all duration-300`}
        >
          <NavBar />
          <main className="flex-1">
            <Routes>
              {features.map((item, index) => {
                if (!hasRoleAccess(currentRole, item.allowedRoles)) {
                  return null;
                }

                return (
                  <React.Fragment key={index}>
                    {/* Parent route (if it has its own component) */}
                    {item.featureName && item.route && (
                      <Route path={item.route} element={<item.featureName />} />
                    )}

                    {/* Submenu routes */}
                    {item.hasSubmenu &&
                      item.submenu
                        .filter((subItem) =>
                          hasRoleAccess(currentRole, subItem.allowedRoles),
                        )
                        .map((subItem, subIndex) => (
                          <Route
                            key={`${index}-${subIndex}`}
                            path={subItem.route}
                            element={<subItem.featureName />}
                          />
                        ))}
                  </React.Fragment>
                );
              })}
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<TemplateDashboard />} />
              <Route path="/" element={<TemplateDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }
};

export default RoutesConfig;
