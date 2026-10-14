import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import FormField from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { resolveRedirect } from '../../utils/redirect';

export default function Login() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(resolveRedirect(location.state?.from, user), { replace: true });
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      else setErrors({ form: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to register for events and manage your activity."
      footer={
        <>
          New to Eventrix?{' '}
          <Link to="/register" state={location.state} className="font-semibold text-electric-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {location.state?.from && (
          <p className="rounded-lg bg-electric-50 px-3 py-2 text-sm text-electric-800">Please log in to continue.</p>
        )}
        {errors.form && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.form}
          </p>
        )}
        <FormField label="Email address" error={errors.email} required>
          {(p) => (
            <input {...p} type="email" autoComplete="email" value={form.email} onChange={update('email')} placeholder="you@school.edu" />
          )}
        </FormField>
        <FormField label="Password" error={errors.password} required>
          {(p) => (
            <input {...p} type="password" autoComplete="current-password" value={form.password} onChange={update('password')} />
          )}
        </FormField>
        <button type="submit" className="btn-primary btn-lg w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Log in
        </button>
      </form>
    </AuthLayout>
  );
}
