import PageHeader from '../../components/PageHeader';
import RegistrationsPanel from '../../components/RegistrationsPanel';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Registrations() {
  useDocumentTitle('Registrations');

  return (
    <>
      <PageHeader title="Registrations" description="See who has registered for your events." />
      <RegistrationsPanel />
    </>
  );
}
