import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IconLock, IconMail, IconFileInvoice, IconArrowLeft, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { requestPasswordReset, resetPassword as resetPasswordApi } from '../../services/repository/AuthRepo.js';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isTokenMode = Boolean(token);

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const success = await dispatch(requestPasswordReset(email));
    if (success) {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (newPassword !== confirmPassword) {
      toast.error('Password and confirm password must match');
      return;
    }

    setSubmitting(true);
    const success = await dispatch(resetPasswordApi(token, newPassword));
    if (success) {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(circle at 78% 18%, rgba(5, 59, 88, 0.18), transparent 24%), var(--surface-bg)',
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

      {/* Reset Password Card */}
      <div
        className="w-full max-w-md rounded-2xl shadow-lg p-8 border"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--surface-border)',
        }}
      >
        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(5, 59, 88, 0.12)' }}>
                <IconLock size={32} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Reset password</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {isTokenMode
                  ? 'Enter your new password to reset your account password'
                  : 'Enter your email to receive reset instructions'}
              </p>
            </div>

            <form onSubmit={isTokenMode ? handleResetSubmit : handleRequestSubmit} className="space-y-6">
              {isTokenMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                      New password
                    </label>
                    <div className="relative">
                      <IconLock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition"
                        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {showNewPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                      Confirm password
                    </label>
                    <div className="relative">
                      <IconLock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition"
                        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                    Email address
                  </label>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition"
                      style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 text-white rounded-lg transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--brand-primary)' }}
                disabled={submitting}
              >
                {submitting
                  ? isTokenMode
                    ? 'Resetting...'
                    : 'Sending...'
                  : isTokenMode
                    ? 'Reset Password'
                    : 'Send Reset Link'}
              </button>

              {/* Back to Login */}
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm transition"
                style={{ color: 'var(--text-muted)' }}
              >
                <IconArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(5, 59, 88, 0.12)' }}>
              <svg className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Check your email</h2>
            {isTokenMode ? (
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                Your password has been reset successfully. Please log in with your new password.
              </p>
            ) : (
              <>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="font-medium"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    try again
                  </button>
                </p>
              </>
            )}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm transition"
              style={{ color: 'var(--text-muted)' }}
            >
              <IconArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;