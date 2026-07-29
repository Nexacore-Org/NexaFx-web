export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <h2 className="mb-4 text-4xl font-bold text-gray-900">404</h2>
      <p className="mb-8 text-lg text-gray-600">Page Not Found</p>
      <a
        href="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Return Home
      </a>
    </div>
  );
}
