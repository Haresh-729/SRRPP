import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconBuilding, IconMail, IconLock, IconEye, IconEyeOff, IconFileInvoice, IconPhone, IconUser } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { register } from '../../services/repository/AuthRepo.js';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password and confirm password must match');
      return;
    }

    setSubmitting(true);
    const result = await dispatch(
      register(
        formData.companyName,
        formData.email,
        formData.password,
        formData.companyName,
        formData.phone
      )
    );

    if (result) {
      navigate('/login');
    }
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(circle at 85% 12%, rgba(5, 59, 88, 0.18), transparent 25%), var(--surface-bg)',
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

      {/* Register Card */}
      <div
        className="w-full max-w-lg rounded-2xl shadow-lg p-8 border"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--surface-border)',
        }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(5, 59, 88, 0.12)' }}>
            <IconBuilding size={32} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Create your account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Start managing your billing efficiently today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
              Company Name *
            </label>
            <div className="relative">
              <IconBuilding className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Your Company Ltd"
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
              Email Address *
            </label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
              Phone Number
            </label>
            <div className="relative">
              <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
              Password *
            </label>
            <div className="relative">
              <IconLock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
              Confirm Password *
            </label>
            <div className="relative">
              <IconLock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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

          {/* Terms Checkbox */}
          <div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="font-medium" style={{ color: 'var(--brand-primary)' }}>
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium" style={{ color: 'var(--brand-primary)' }}>
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-white rounded-lg transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--brand-primary)' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--brand-primary)' }}>
            Login
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        © 2023 BillFlow SaaS. All rights reserved.
      </div>
    </div>
  );
};

export default Register;