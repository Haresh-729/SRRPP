import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconLock, IconMail, IconEye, IconEyeOff, IconFileInvoice } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { login } from '../../services/repository/AuthRepo.js';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    await dispatch(login(formData.email, formData.password, navigate));
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(circle at 80% 10%, rgba(5, 59, 88, 0.18), transparent 24%), var(--surface-bg)',
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

      <div className="absolute top-6 right-6">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Help & Support</span>
      </div>

      {/* Login Card */}
      <div
        className="w-full max-w-md rounded-2xl shadow-lg p-8 border"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--surface-border)',
        }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(5, 59, 88, 0.12)' }}>
            <IconLock size={32} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
              Email address
            </label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition"
                style={{
                  borderColor: 'var(--surface-border)',
                  color: 'var(--text-main)',
                }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
              Password
            </label>
            <div className="relative">
              <IconLock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition"
                style={{
                  borderColor: 'var(--surface-border)',
                  color: 'var(--text-main)',
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Remember me</span>
            </label>
            <Link to="/reset-password" className="text-sm font-medium" style={{ color: 'var(--brand-primary)' }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-white rounded-lg transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--brand-primary)' }}
            disabled={submitting}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ backgroundColor: 'var(--surface-card)', color: 'var(--text-muted)' }}>Or continue with</span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition"
              style={{ borderColor: 'var(--surface-border)' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Google</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition"
              style={{ borderColor: 'var(--surface-border)' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Microsoft</span>
            </button>
          </div>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium" style={{ color: 'var(--brand-primary)' }}>
            Register now
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        © 2023 BillFlow SaaS. All rights reserved. • 
        <a href="#" className="hover:text-gray-700 ml-2">Privacy Policy</a> • 
        <a href="#" className="hover:text-gray-700 ml-2">Terms of Service</a>
      </div>
    </div>
  );
};

export default Login;