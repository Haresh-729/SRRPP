import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IconRefresh, IconLogout, IconUser, IconShieldCheck } from '@tabler/icons-react';
import { getMe, changePassword, logout } from '../../../services/repository/AuthRepo.js';
import { selectAccount } from '../../../app/DashboardSlice.js';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const account = useSelector(selectAccount);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [logoutSaving, setLogoutSaving] = useState(false);

  const loadProfile = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const data = await dispatch(getMe());
    setProfile(data || null);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadProfile(false);
  }, [dispatch]);

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (passwordSaving) return;

    setPasswordSaving(true);
    const ok = await dispatch(
      changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword,
      ),
    );

    if (ok) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }

    setPasswordSaving(false);
  };

  const onLogout = async () => {
    if (logoutSaving) return;
    setLogoutSaving(true);
    await dispatch(logout(navigate));
    setLogoutSaving(false);
  };

  const name = profile?.name || account?.uname || 'User';
  const email = profile?.email || account?.uemail || '-';
  const role = profile?.role || account?.role || '-';
  const isActive =
    typeof profile?.isActive === 'boolean'
      ? profile.isActive
      : typeof account?.isActive === 'boolean'
        ? account.isActive
        : null;

  const createdAt = useMemo(() => {
    if (!profile?.createdAt) return '-';
    return new Date(profile.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [profile?.createdAt]);

  const updatedAt = useMemo(() => {
    if (!profile?.updatedAt) return '-';
    return new Date(profile.updatedAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [profile?.updatedAt]);

  return (
    <section className="p-6 md:p-8 min-h-full" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Profile</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            View account details and manage your credentials
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadProfile(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium disabled:opacity-70"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
          >
            <IconRefresh size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={onLogout}
            disabled={logoutSaving}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold disabled:opacity-70"
            style={{ backgroundColor: 'var(--danger)', color: 'var(--text-inverse)' }}
          >
            <IconLogout size={16} />
            {logoutSaving ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div
          className="xl:col-span-2 rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <IconUser size={18} style={{ color: 'var(--brand-primary)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Account Information</h2>
          </div>

          {loading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Full Name</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{name}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Email</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{email}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Role</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{role}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Status</p>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor:
                      isActive === null
                        ? 'rgba(120,120,120,0.12)'
                        : isActive
                          ? 'rgba(30,140,74,0.12)'
                          : 'rgba(217,48,37,0.12)',
                    color:
                      isActive === null
                        ? 'var(--text-muted)'
                        : isActive
                          ? 'var(--success)'
                          : 'var(--danger)',
                  }}
                >
                  {isActive === null ? 'Unknown' : isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Created At</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{createdAt}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Last Updated</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{updatedAt}</p>
              </div>
            </div>
          )}
        </div>

        <div
          className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <IconShieldCheck size={18} style={{ color: 'var(--brand-primary)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Security</h2>
          </div>

          <form onSubmit={onChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--surface-border)',
                backgroundColor: 'var(--surface-bg)',
                color: 'var(--text-main)',
              }}
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--surface-border)',
                backgroundColor: 'var(--surface-bg)',
                color: 'var(--text-main)',
              }}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--surface-border)',
                backgroundColor: 'var(--surface-bg)',
                color: 'var(--text-main)',
              }}
              required
            />

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-70"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}
            >
              {passwordSaving ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Profile;
