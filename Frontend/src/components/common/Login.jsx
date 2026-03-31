import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconBuildingSkyscraper,
} from '@tabler/icons-react';
import { login } from '../../services/repository/AuthRepo.js';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await dispatch(login(email, password, navigate));
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--surface-bg)' }}
    >
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-15"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <IconBuildingSkyscraper size={22} color="white" />
          </div>
          <span className="text-white text-xl font-extrabold tracking-tight">
            Raut Rentals
          </span>
        </div>

        {/* Quote */}
        <div className="relative">
          <p className="text-white/90 text-2xl font-semibold leading-snug mb-6">
            "Manage your properties, track every payment, and stay in control — all from one place."
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              RR
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Raut Rentals</p>
              <p className="text-white/60 text-xs">Premium Property Management</p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="relative text-white/50 text-xs">
          © 2025 Raut Rentals. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <IconBuildingSkyscraper size={18} color="white" />
            </div>
            <span className="text-lg font-extrabold" style={{ color: 'var(--text-main)' }}>
              Raut Rentals
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-main)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-main)' }}
              >
                Email address
              </label>
              <div className="relative">
                <IconMail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rautrentals.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                  style={{
                    borderColor: 'var(--surface-border)',
                    backgroundColor: 'var(--surface-card)',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--surface-border)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text-main)' }}
                >
                  Password
                </label>
                <Link
                  to="/reset-password"
                  className="text-xs font-medium transition-opacity hover:opacity-75"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <IconLock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                  style={{
                    borderColor: 'var(--surface-border)',
                    backgroundColor: 'var(--surface-card)',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--surface-border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: 'var(--text-inverse)',
              }}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--surface-border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--surface-border)' }} />
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link
              to="/"
              className="text-sm transition-opacity hover:opacity-75"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;