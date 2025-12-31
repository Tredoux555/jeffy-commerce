import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jeffy - Request Any Product';
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
          backgroundImage: 'radial-gradient(circle at 75% 25%, #1a1a2e 0%, #0a0a0a 50%)',
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
              fontSize: 60,
              fontWeight: 'bold',
              color: '#22c55e',
              marginBottom: 20,
            }}
          >
            JEFFY WANTS
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
            Request Any Product
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#facc15',
              marginBottom: 20,
              fontWeight: 'bold',
            }}
          >
            50 votes = We source it
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#a1a1aa',
              marginBottom: 40,
            }}
          >
            First requester gets it FREE! 🎁
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
