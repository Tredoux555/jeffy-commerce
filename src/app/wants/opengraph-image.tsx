import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jeffy Wants - Request Any Product';
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
          backgroundImage: 'radial-gradient(circle at 70% 30%, #1e293b 0%, #0f172a 50%)',
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
              color: '#f59e0b',
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
              color: '#fbbf24',
              marginBottom: 20,
              fontWeight: 'bold',
            }}
          >
            10 votes = We source it
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#94a3b8',
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
