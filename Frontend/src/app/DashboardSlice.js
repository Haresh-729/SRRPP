import { createSlice } from '@reduxjs/toolkit';

// Safely parse localStorage data
const getLocalStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item && item !== 'undefined' && item !== 'null' ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return null;
  }
};

const localData = getLocalStorageItem('account');
const Dstate = getLocalStorageItem('dState');
const localUserAccess = getLocalStorageItem('userAccess');

const initialState = {
  dashboardMenuState: true,
  dashboardFeature: Dstate || 'dashboard',
  isThemeDark: false,
  account: localData || null, //{role:"admin", name:"Admin User", email:"admin@gmail.com"}
  isLoggedIn: localData?.isLoggedIn ?? false,
  userAccess: localUserAccess || {
    rolePermissions: {},
    processAccess: [],
    departmentAccess: [],
  },
  profileData: [],
  dashboardData: {
    welcome: {
      temperature: 28,
      weather: 'Sunny Day',
      weatherDescription: 'Beautiful Day',
    },
  },
};

const DashboardSlice = createSlice({
  initialState,
  name: 'dashboard',
  reducers: {
    setOpenDMenu: (state, action) => {
      state.dashboardMenuState = action.payload.dashboardMenuState;
    },
    setCloseDMenu: (state, action) => {
      state.dashboardMenuState = action.payload.dashboardMenuState;
    },
    setDFeature: (state, action) => {
      state.dashboardFeature = action.payload.dashboardFeature;
      localStorage.setItem(
        'dState',
        JSON.stringify(action.payload.dashboardFeature),
      );
    },
    setAccount: (state, action) => {
      state.account = action.payload;
      state.isLoggedIn = true;
      const temp = { ...state.account, isLoggedIn: state.isLoggedIn };
      localStorage.setItem('account', JSON.stringify(temp));
    },
    setUserAccess: (state, action) => {
      state.userAccess = {
        rolePermissions: action.payload.rolePermissions || {},
        processAccess: action.payload.processAccess || [],
        departmentAccess: action.payload.departmentAccess || [],
      };
      localStorage.setItem('userAccess', JSON.stringify(state.userAccess));
    },
    LogOut: (state, action) => {
      state.account = [];
      state.profileData = [];
      state.isLoggedIn = false;
      state.dashboardMenuState = false;
      state.dashboardFeature = 'dashboard';
      localStorage.clear();
    },
    setAccountAfterRegister: (state, action) => {
      state.account = action.payload;
      state.isLoggedIn = false;
      const temp1 = { ...state.account, isLoggedIn: state.isLoggedIn };
      localStorage.setItem('account', JSON.stringify(temp1));
    },
    toggleTheme: (state) => {
      state.isThemeDark = !state.isThemeDark;
    },
  },
});

export const {
  setOpenDMenu,
  setCloseDMenu,
  setDFeature,
  setAccount,
  setUserAccess,
  setAccountAfterRegister,
  toggleTheme,
  LogOut,
} = DashboardSlice.actions;

export const dashboardMenuState = (state) => state.dashboard.dashboardMenuState;
export const dashboardFeature = (state) => state.dashboard.dashboardFeature;
export const isThemeDark = (state) => state.dashboard.isThemeDark;
export const isUserLoggedIn = (state) => state.dashboard.isLoggedIn;
export const selectAccount = (state) => state.dashboard.account;
export const selectUserAccess = (state) => state.dashboard.userAccess;
export const selectRolePermissions = (state) => state.dashboard.userAccess.rolePermissions;
export const selectProcessAccess = (state) => state.dashboard.userAccess.processAccess;
export const selectDepartmentAccess = (state) => state.dashboard.userAccess.departmentAccess;
export const selectProfileData = (state) => state.dashboard.profileData;
export const selectDashboardData = (state) => state.dashboard.dashboardData;

export default DashboardSlice.reducer;
