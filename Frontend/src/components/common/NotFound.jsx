import { Link } from 'react-router-dom';
import { IconBuildingSkyscraper, IconHome, IconArrowLeft } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from '../../app/DashboardSlice.js';

const NotFound = () => {
  const loggedIn = useSelector(isUserLoggedIn);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 82% 14%, rgba(5, 59, 88, 0.16), transparent 30%), radial-gradient(circle at 15% 85%, rgba(5, 59, 88, 0.1), transparent 28%), var(--surface-bg)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(5,59,88,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(5,59,88,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div
        className="text-center max-w-2xl w-full rounded-3xl border px-7 py-10 md:px-10 md:py-12 relative"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--surface-border)',
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <IconBuildingSkyscraper className="text-white" size={18} />
          </div>
          <span className="font-semibold" style={{ color: 'var(--text-main)' }}>Raut Rentals</span>
        </div>

        <div className="mb-9">
          <p className="text-xs font-semibold tracking-[0.18em] mb-3" style={{ color: 'var(--danger)' }}>ERROR 404</p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: 'var(--text-main)' }}>Page not found</h2>
          <p className="mb-8 max-w-md mx-auto text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={loggedIn ? '/dashboard' : '/'}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg transition font-semibold w-full sm:w-auto hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <IconHome size={20} />
            {loggedIn ? 'Go to Dashboard' : 'Go to Homepage'}
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border rounded-lg transition font-medium w-full sm:w-auto"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
          >
            <IconArrowLeft size={19} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;