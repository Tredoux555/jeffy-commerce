import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jeffy Zone Partners - Earn 50% Profit';
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
          backgroundImage: 'radial-gradient(circle at 50% 75%, #1a2e1a 0%, #0a0a0a 50%)',
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
              fontSize: 50,
              fontWeight: 'bold',
              color: '#22c55e',
              marginBottom: 20,
            }}
          >
            JEFFY ZONE PARTNERS
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 30,
              maxWidth: 900,
            }}
          >
            Build Your Own Business
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#22c55e',
              marginBottom: 20,
              fontWeight: 'bold',
            }}
          >
            Earn 50% Profit Share
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#a1a1aa',
              marginBottom: 40,
            }}
          >
            Low startup cost • Deliver in your zone • Be your own boss
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
