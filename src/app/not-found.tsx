import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-6xl font-bold text-gray-900 mb-4">404</h2>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
