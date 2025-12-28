// Client-side error reporter
export async function reportError(options: {
  errorType: string;
  errorMessage: string;
  errorDetails?: any;
  pageUrl?: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  try {
    await fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        pageUrl: options.pageUrl || window.location.href,
      }),
    });
  } catch (e) {
    // Fail silently - don't cause more errors
    console.error('Error reporting failed:', e);
  }
}
