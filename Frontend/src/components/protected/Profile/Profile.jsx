import { useSelector } from 'react-redux';
import { selectAccount } from '../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../services/utils/rbac.js';
import SuperAdminProfile from './SuperAdminProfile.jsx';
import AdminProfile from './AdminProfile.jsx';
import AccountantProfile from './AccountantProfile.jsx';
import ViewerProfile from './ViewerProfile.jsx';

const Profile = () => {
  const account = useSelector(selectAccount);
  const role = normalizeRole(account?.roleCode || account?.role);

  if (role === ROLE_CODES.SUPER_ADMIN) {
    return <SuperAdminProfile />;
  }

  if (role === ROLE_CODES.ADMIN) {
    return <AdminProfile />;
  }

  if (role === ROLE_CODES.ACCOUNTANT) {
    return <AccountantProfile />;
  }

  return <ViewerProfile />;
};

export default Profile;
