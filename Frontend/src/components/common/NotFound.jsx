import { Link } from 'react-router-dom';
import { IconFileInvoice, IconHome } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from '../../app/DashboardSlice.js';

const NotFound = () => {
  const loggedIn = useSelector(isUserLoggedIn);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(circle at 85% 16%, rgba(5, 59, 88, 0.18), transparent 25%), var(--surface-bg)',
      }}
    >
      <div className="text-center max-w-2xl w-full">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <IconFileInvoice className="text-white" size={18} />
          </div>
          <span className="font-semibold" style={{ color: 'var(--text-main)' }}>BillFlow</span>
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: '#ef4444' }}>ERROR 404</p>
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Page not found</h2>
          <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            to={loggedIn ? '/dashboard' : '/'}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition font-medium"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <IconHome size={20} />
            {loggedIn ? 'Go to Dashboard' : 'Go to Homepage'}
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 border rounded-lg transition font-medium"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
          >
            <IconFileInvoice size={20} />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;