import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IconMail, IconFileInvoice } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { verifyToken } from '../../services/repository/AuthRepo.js';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setVerifying(false);
      setSuccess(false);
      return;
    }

    const handleVerify = async () => {
      const response = await dispatch(verifyToken(token));
      setSuccess(Boolean(response?.valid));
      setVerifying(false);
    };

    handleVerify();
  }, [dispatch, searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(circle at 82% 12%, rgba(5, 59, 88, 0.18), transparent 24%), var(--surface-bg)',
      }}
    >
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
            <IconFileInvoice className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>BillFlow</span>
        </Link>
      </div>

      {/* Verify Card */}
      <div
        className="w-full max-w-md rounded-2xl shadow-lg p-8 text-center border"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--surface-border)',
        }}
      >
        {verifying ? (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(5, 59, 88, 0.12)' }}>
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }}></div>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Verifying Email</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please wait while we verify your email address...</p>
          </>
        ) : success ? (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(5, 59, 88, 0.12)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Email Verified!</h2>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
              Your email has been successfully verified. You can now access your account.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 text-white rounded-lg transition font-medium"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Continue to Login
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)' }}>
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Verification Failed</h2>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
              The verification link is invalid or has expired. Please try again.
            </p>
            <Link
              to="/register"
              className="inline-block w-full py-3 text-white rounded-lg transition font-medium"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;