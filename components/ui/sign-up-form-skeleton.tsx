export default function SignUpFormSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto p-5 rounded-lg shadow-sm border border-gray-100 animate-pulse">
        <div className="grid md:grid-cols-2 gap-2 md:gap-8">
          <div className="flex flex-col">
            <div className="flex items-center text-gray-600 mb-6 w-fit">
              <div className="h-4 w-4 bg-gray-200 rounded mr-2" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="mb-8">
              <div className="h-10 w-20 bg-gray-200 rounded-lg mb-6" />
              <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-64 bg-gray-200 rounded" />
            </div>
            <div className="mt-auto hidden md:block">
              <div className="h-32 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="max-w-md space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
            <div className="flex items-start">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="ml-3 space-y-1">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-lg" />
            <div className="text-center mt-4">
              <div className="h-4 w-48 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
