import { AlertCircle, RefreshCw } from "lucide-react";

interface AsyncBoundaryProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingSkeleton?: React.ReactNode;
  children: React.ReactNode;
}

export function AsyncBoundary({
  loading,
  error,
  onRetry,
  loadingSkeleton,
  children,
}: AsyncBoundaryProps) {
  if (loading) {
    return <>{loadingSkeleton ?? (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F39A00]" />
      </div>
    )}</>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto mt-10">
        <div className="flex items-center justify-center mb-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
