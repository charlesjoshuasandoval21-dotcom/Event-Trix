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

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    student_number: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const user = await register({ ...form, student_number: form.student_number || null });
      toast.success('Your account has been created. Welcome to Eventrix!');
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
      title="Create your account"
      subtitle="Join Eventrix to discover and register for IT department events."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-electric-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.form}
          </p>
        )}
        <FormField label="Full name" error={errors.name} required>
          {(p) => <input {...p} type="text" autoComplete="name" value={form.name} onChange={update('name')} />}
        </FormField>
        <FormField label="Email address" error={errors.email} required>
          {(p) => <input {...p} type="email" autoComplete="email" value={form.email} onChange={update('email')} />}
        </FormField>
        <FormField label="Student number" error={errors.student_number} hint="Optional">
          {(p) => <input {...p} type="text" value={form.student_number} onChange={update('student_number')} />}
        </FormField>
        <FormField label="Password" error={errors.password} hint="At least 8 characters, with letters and numbers." required>
          {(p) => (
            <input {...p} type="password" autoComplete="new-password" value={form.password} onChange={update('password')} />
          )}
        </FormField>
        <FormField label="Confirm password" error={errors.password_confirmation} required>
          {(p) => (
            <input
              {...p}
              type="password"
              autoComplete="new-password"
              value={form.password_confirmation}
              onChange={update('password_confirmation')}
            />
          )}
        </FormField>
        <button type="submit" className="btn-primary btn-lg w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}
