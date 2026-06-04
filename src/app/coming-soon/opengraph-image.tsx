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
          backgroundImage: 'radial-gradient(circle at 25% 35%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 65%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
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
          {/* Logo */}
          <div
            style={{
              fontSize: 90,
              fontWeight: 900,
              background: 'linear-gradient(to right, #fbbf24, #f97316)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 30,
              letterSpacing: -2,
            }}
          >
            Jeffy
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 12,
            }}
          >
            Retail is broken.
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#94a3b8',
              marginBottom: 50,
            }}
          >
            We&apos;re building something different.
          </div>

          {/* Two paths */}
          <div
            style={{
              display: 'flex',
              gap: 30,
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                borderRadius: 20,
                padding: '24px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: 22 }}>Make a Wish</div>
              <div style={{ color: '#fbbf24', fontSize: 16, marginTop: 4 }}>One granted free monthly</div>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                borderRadius: 20,
                padding: '24px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>📍</div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: 22 }}>Zone Partner</div>
              <div style={{ color: '#34d399', fontSize: 16, marginTop: 4 }}>Own your territory</div>
            </div>
          </div>

          {/* Bottom tag */}
          <div
            style={{
              marginTop: 50,
              fontSize: 14,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            ✦ This isn&apos;t for everyone ✦
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
