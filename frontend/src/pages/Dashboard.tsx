import { Link } from 'react-router-dom';
import { Container } from '../components/Layout/Container';
import { ResumeList } from '../components/Dashboard/ResumeList';
import { RoastHistory } from '../components/Dashboard/RoastHistory';
import { useAuth } from '../hooks/useAuth';
import { Upload, FileText, History } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <Upload className="w-4 h-4" />
            Upload New Resume
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Resumes Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">My Resumes</h2>
            </div>
            <ResumeList />
          </section>

          {/* Roast History Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Roast History</h2>
            </div>
            <RoastHistory />
          </section>
        </div>
      </div>
    </Container>
  );
}
