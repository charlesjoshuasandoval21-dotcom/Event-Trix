import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { settingsService } from '../services/eventService';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

export default function Settings() {
  useDocumentTitle('Settings');
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    student_number: user.student_number || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const emptyPw = { current_password: '', password: '', password_confirmation: '' };
  const [pw, setPw] = useState(emptyPw);
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileErrors({});
    try {
      const payload = { name: profile.name, email: profile.email };
      if (user.role === 'student') payload.student_number = profile.student_number || null;
      else payload.student_number = user.student_number;
      const updated = await settingsService.update(user.role, payload);
      setUser(updated);
      toast.success('Profile updated.');
    } catch (err) {
      const fields = getFieldErrors(err);
      setProfileErrors(fields);
      if (!Object.keys(fields).length) toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    setPwErrors({});
    try {
      await settingsService.updatePassword(user.role, pw);
      setPw(emptyPw);
      toast.success('Password changed.');
    } catch (err) {
      const fields = getFieldErrors(err);
      setPwErrors(fields);
      if (!Object.keys(fields).length) toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = async () => {
    await logout().catch(() => {});
    navigate('/login');
  };

  const setP = (k) => (e) => setProfile((p) => ({ ...p, [k]: e.target.value }));
  const setW = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and password." />

      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-5 p-6" noValidate>
          <div>
            <h2 className="text-lg font-semibold">Profile</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Signed in as <span className="font-medium capitalize text-navy-800">{user.role}</span>
            </p>
          </div>
          <FormField label="Full name" error={profileErrors.name} required>
            {(p) => <input {...p} type="text" value={profile.name} onChange={setP('name')} />}
          </FormField>
          <FormField label="Email address" error={profileErrors.email} required>
            {(p) => <input {...p} type="email" value={profile.email} onChange={setP('email')} />}
          </FormField>
          {user.role === 'student' && (
            <FormField label="Student number" error={profileErrors.student_number} hint="Optional">
              {(p) => <input {...p} type="text" value={profile.student_number} onChange={setP('student_number')} />}
            </FormField>
          )}
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Save profile
          </button>
        </form>

        <form onSubmit={savePassword} className="card space-y-5 p-6" noValidate>
          <div>
            <h2 className="text-lg font-semibold">Change password</h2>
            <p className="mt-0.5 text-sm text-slate-500">Use at least 8 characters with letters and numbers.</p>
          </div>
          <FormField label="Current password" error={pwErrors.current_password} required>
            {(p) => <input {...p} type="password" autoComplete="current-password" value={pw.current_password} onChange={setW('current_password')} />}
          </FormField>
          <FormField label="New password" error={pwErrors.password} required>
            {(p) => <input {...p} type="password" autoComplete="new-password" value={pw.password} onChange={setW('password')} />}
          </FormField>
          <FormField label="Confirm new password" error={pwErrors.password_confirmation} required>
            {(p) => (
              <input {...p} type="password" autoComplete="new-password" value={pw.password_confirmation} onChange={setW('password_confirmation')} />
            )}
          </FormField>
          <button type="submit" className="btn-primary" disabled={savingPw}>
            {savingPw && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Update password
          </button>
        </form>

        <div className="card flex items-center justify-between gap-4 p-6 lg:col-span-2">
          <div>
            <h2 className="text-lg font-semibold">Log out</h2>
            <p className="text-sm text-slate-500">End your session on this device.</p>
          </div>
          <button className="btn-secondary" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      </div>
    </>
  );
}
