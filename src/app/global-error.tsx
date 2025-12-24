'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
            <p className="text-gray-600 mb-8">{error.message || 'An unexpected error occurred'}</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-jeffy-orange text-white rounded hover:bg-jeffy-orange/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

