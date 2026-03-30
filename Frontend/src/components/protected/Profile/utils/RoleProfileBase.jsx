import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconBuilding, IconDeviceFloppy, IconEdit, IconMail, IconPhone, IconShieldCheck, IconUser } from '@tabler/icons-react';
import { getMe, updateMe } from '../../../../services/repository/AuthRepo.js';
import { selectAccount, selectRolePermissions } from '../../../../app/DashboardSlice.js';

const formatLabel = (text) =>
  String(text || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const getValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== '') {
      return source[key];
    }
  }
  return fallback;
};

const RoleProfileBase = ({ roleTitle, roleCode }) => {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const rolePermissions = useSelector(selectRolePermissions);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const data = await dispatch(getMe());

      const fallbackProfile = {
        full_name: account?.uname || '',
        phone: account?.phone || '',
        email: account?.uemail || '',
        company_name: account?.companyName || '',
        roles: account?.roles || [],
      };

      const resolved = data || fallbackProfile;
      setProfile(resolved);
      setForm({
        full_name: getValue(resolved, ['full_name', 'name'], fallbackProfile.full_name),
        phone: getValue(resolved, ['phone', 'mobile'], fallbackProfile.phone),
      });
      setLoading(false);
    };

    fetchProfile();
  }, [account?.companyName, account?.roles, account?.uemail, account?.uname, dispatch]);

  const permissionEntries = useMemo(() => Object.entries(rolePermissions || {}), [rolePermissions]);

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    const updated = await dispatch(updateMe(form.full_name, form.phone));
    if (updated) {
      setProfile((prev) => ({
        ...prev,
        full_name: getValue(updated, ['full_name', 'name'], form.full_name),
        phone: getValue(updated, ['phone', 'mobile'], form.phone),
      }));
      setEditing(false);
    }
    setSaving(false);
  };

  return (
    <section className="w-full min-h-full p-6 md:p-8" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>PROFILE</p>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{roleTitle}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account details and view role-based access.</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11, 92, 171, 0.1)', color: 'var(--brand-primary)' }}>
              <IconShieldCheck size={18} />
              <span className="text-sm font-semibold">{formatLabel(roleCode)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Account Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                  style={{ color: 'var(--brand-primary)', backgroundColor: 'rgba(11, 92, 171, 0.08)' }}
                >
                  <IconEdit size={16} />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-70"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  <IconDeviceFloppy size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Full Name</span>
                  <div className="relative">
                    <IconUser size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      value={form.full_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                      disabled={!editing}
                      className="w-full rounded-lg border py-2.5 pl-10 pr-3 outline-none"
                      style={{
                        borderColor: 'var(--surface-border)',
                        color: 'var(--text-main)',
                        backgroundColor: editing ? 'var(--surface-card)' : 'var(--surface-bg)',
                      }}
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Phone</span>
                  <div className="relative">
                    <IconPhone size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      value={form.phone || ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      disabled={!editing}
                      className="w-full rounded-lg border py-2.5 pl-10 pr-3 outline-none"
                      style={{
                        borderColor: 'var(--surface-border)',
                        color: 'var(--text-main)',
                        backgroundColor: editing ? 'var(--surface-card)' : 'var(--surface-bg)',
                      }}
                    />
                  </div>
                </label>

                <div className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Email</span>
                  <div className="relative">
                    <IconMail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      value={getValue(profile, ['email'], account?.uemail || '')}
                      disabled
                      className="w-full rounded-lg border py-2.5 pl-10 pr-3"
                      style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)', backgroundColor: 'var(--surface-bg)' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Company</span>
                  <div className="relative">
                    <IconBuilding size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      value={getValue(profile, ['company_name'], account?.companyName || '')}
                      disabled
                      className="w-full rounded-lg border py-2.5 pl-10 pr-3"
                      style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)', backgroundColor: 'var(--surface-bg)' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Permission Snapshot</h2>

            {permissionEntries.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No permission map received for this user.</p>
            ) : (
              <div className="space-y-4">
                {permissionEntries.map(([module, actions]) => (
                  <div key={module}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                      {formatLabel(module)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(actions || []).map((action) => (
                        <span
                          key={`${module}-${action}`}
                          className="rounded-md px-2 py-1 text-xs font-medium"
                          style={{ backgroundColor: 'rgba(11, 92, 171, 0.1)', color: 'var(--brand-primary)' }}
                        >
                          {action === '*' ? 'ALL' : formatLabel(action)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleProfileBase;
