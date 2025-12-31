import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jeffy - Retail is broken. We\'re building something different.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 30% 40%, #1e293b 0%, #0f172a 60%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #f59e0b, #f97316)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 30,
            }}
          >
            Jeffy
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 16,
            }}
          >
            Retail is broken.
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#94a3b8',
              marginBottom: 50,
            }}
          >
            We&apos;re building something different.
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 4,
            }}
          >
            This isn&apos;t for everyone
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
