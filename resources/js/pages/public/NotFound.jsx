import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container-page py-20">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
        }
      />
    </div>
  );
}
