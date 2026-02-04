import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/Auth/SignupForm';
import { Container } from '../components/Layout/Container';
import { FileSearch } from 'lucide-react';

export function SignupPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/', { replace: true });
  };

  return (
    <Container>
      <div className="max-w-md mx-auto mt-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
            <FileSearch className="w-3.5 h-3.5" />
            Resume Analyzer
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Save your resume history and roast results</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <SignupForm onSuccess={handleSuccess} />
        </div>
      </div>
    </Container>
  );
}
