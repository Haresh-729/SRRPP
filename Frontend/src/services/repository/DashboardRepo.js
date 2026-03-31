// Dashboard Repository
import { apiConnector } from '../Connector.js';
import { dashboardEndpoints } from '../Apis.js';
import { showValidationErrors, showLoadingToast } from '../utils/toastUtils.jsx';
import { toast } from 'react-hot-toast';

const { GET_DASHBOARD } = dashboardEndpoints;

// GET /v1/dashboard
// response: data: { totalProperties, activeAgreements, overduePayments, totalRentalValue, upcomingExpirations, recentTransactions }
export function getDashboard() {
  return async () => {
    const toastId = showLoadingToast('Loading dashboard...');
    try {
      const response = await apiConnector(GET_DASHBOARD.type, GET_DASHBOARD.url);

      if (response.data.success) {
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
