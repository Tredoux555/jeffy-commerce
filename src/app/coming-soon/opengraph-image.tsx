import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jeffy - Quality Products at China Prices';
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
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a2e 0%, #0a0a0a 50%)',
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
              fontSize: 80,
              fontWeight: 'bold',
              color: '#22c55e',
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
            Quality Products at China Prices
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#a1a1aa',
              marginBottom: 40,
              maxWidth: 800,
            }}
          >
            Skip the middleman. Every purchase funds free schools.
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#22c55e',
              color: '#0a0a0a',
              padding: '16px 40px',
              borderRadius: 12,
              fontSize: 28,
              fontWeight: 'bold',
            }}
          >
            🚀 Launching January 20, 2025
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
