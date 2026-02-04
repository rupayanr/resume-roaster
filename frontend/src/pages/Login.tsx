import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/Auth/LoginForm';
import { Container } from '../components/Layout/Container';
import { FileSearch } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <Container>
      <div className="max-w-md mx-auto mt-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
            <FileSearch className="w-3.5 h-3.5" />
            Resume Analyzer
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to access your resume history</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </Container>
  );
}
