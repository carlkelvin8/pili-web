import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl font-bold text-gray-300">404</span>
        </div>
        <h2 className="text-lg font-semibold text-[#0a2e2e] mb-2">Page not found</h2>
        <p className="text-sm text-gray-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#0d4d4d] hover:bg-[#1a8a6e] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
