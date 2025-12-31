import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jeffy - The Future of Retail';
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
          backgroundImage: 'radial-gradient(circle at 30% 30%, #1e293b 0%, #0f172a 50%)',
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
              fontSize: 90,
              fontWeight: 'bold',
              color: '#f59e0b',
              marginBottom: 20,
            }}
          >
            JEFFY
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 30,
              maxWidth: 900,
            }}
          >
            The future of retail starts here.
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#94a3b8',
              marginBottom: 50,
            }}
          >
            This isn&apos;t a store. It&apos;s a movement.
          </div>
          <div
            style={{
              display: 'flex',
              gap: 30,
            }}
          >
            <div
              style={{
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                padding: '16px 32px',
                borderRadius: 12,
                fontSize: 22,
                fontWeight: 'bold',
              }}
            >
              Create a Want
            </div>
            <div
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 12,
                fontSize: 22,
                fontWeight: 'bold',
              }}
            >
              Become a Zone Partner
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
