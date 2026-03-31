import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, changePassword } from '../../../services/repository/AuthRepo.js';
import { selectAccount } from '../../../app/DashboardSlice.js';

const Profile = () => {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await dispatch(getMe());
      setProfile(data || null);
      setLoading(false);
    };

    loadProfile();
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

  const name = profile?.full_name || profile?.name || account?.uname || 'User';
  const email = profile?.email || account?.uemail || '-';

  return (
    <section className="p-8">
      <h1 className="text-2xl font-semibold">Profile</h1>
      {loading ? (
        <p className="mt-2 text-gray-600">Loading profile...</p>
      ) : (
        <div className="mt-4 space-y-2">
          <p><span className="font-medium">Name:</span> {name}</p>
          <p><span className="font-medium">Email:</span> {email}</p>
        </div>
      )}

      <form onSubmit={onChangePassword} className="mt-8 max-w-xl space-y-3">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <input
          type="password"
          placeholder="Current password"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
          className="w-full rounded-lg border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="New password"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
          className="w-full rounded-lg border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={passwordForm.confirmPassword}
          onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          className="w-full rounded-lg border px-3 py-2"
          required
        />
        <button
          type="submit"
          disabled={passwordSaving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-70"
        >
          {passwordSaving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  );
};

export default Profile;
