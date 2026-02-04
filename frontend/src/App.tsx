import { Routes, Route } from 'react-router-dom';
import { Container } from './components/Layout/Container';
import { Navbar } from './components/Layout/Navbar';
import { DropZone } from './components/Upload/DropZone';
import { FilePreview } from './components/Upload/FilePreview';
import { RoastCard } from './components/Roast/RoastCard';
import { ShareButton } from './components/Share/ShareButton';
import { ProcessingStepper } from './components/Processing/ProcessingStepper';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { useFileUpload } from './hooks/useFileUpload';
import { useRoast } from './hooks/useRoast';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { DashboardPage } from './pages/Dashboard';
import { SharedRoastPage } from './pages/SharedRoast';
import { ArrowLeft, AlertCircle, FileSearch } from 'lucide-react';

function HomePage() {
  const { file, error: uploadError, setFile, setUploading, reset: resetFile } = useFileUpload();
  const { roast, isLoading, error: roastError, submitResume, reset: resetRoast } = useRoast();
  const { isAuthenticated } = useAuth();

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setUploading(true);
    await submitResume(uploadedFile);
    setUploading(false);
  };

  const handleReset = () => {
    resetFile();
    resetRoast();
  };

  const error = uploadError || roastError;

  // Transform roast data to include share_url for backwards compatibility
  const transformedRoast = roast ? {
    ...roast,
    share_url: roast.share_url || `${window.location.origin}/r/${roast.share_id}`,
    roast: roast.roast || {
      headline: roast.headline,
      sections: roast.sections,
    },
  } : null;

  return (
    <Container>
      {/* Header */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
          <FileSearch className="w-3.5 h-3.5" />
          AI-Powered Analysis
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Resume Analyzer
        </h1>
        <p className="text-lg text-gray-600 mt-3 max-w-xl mx-auto">
          Get professional feedback and actionable suggestions to improve your resume
          {!isAuthenticated && (
            <span className="block text-sm mt-2 text-blue-600">
              Sign up to save your history and track improvements
            </span>
          )}
        </p>
      </header>

      {!transformedRoast ? (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Show upload UI only when not processing */}
          {!isLoading && (
            <>
              <DropZone onUpload={handleUpload} disabled={isLoading} />

              {file && (
                <FilePreview
                  file={file}
                  onRemove={handleReset}
                  isUploading={isLoading}
                />
              )}
            </>
          )}

          {/* Show processing stepper when analyzing */}
          {isLoading && file && (
            <ProcessingStepper fileName={file.name} isProcessing={isLoading} />
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Something went wrong</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Analyze Another
            </button>
            <ShareButton shareUrl={transformedRoast.share_url} />
          </div>

          <RoastCard roast={transformedRoast} />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center">
        <p className="text-xs text-gray-400">
          Powered by Llama 3.2 running locally via Ollama
        </p>
      </footer>
    </Container>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/r/:shareId" element={<SharedRoastPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
