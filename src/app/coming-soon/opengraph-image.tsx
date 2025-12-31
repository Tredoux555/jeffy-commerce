import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jeffy - Retail is broken. We\'re fixing it.';
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
          backgroundColor: '#030712',
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.2) 0%, transparent 50%)',
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
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(249, 115, 22, 0.2)',
              color: '#fb923c',
              padding: '8px 20px',
              borderRadius: 50,
              fontSize: 16,
              marginBottom: 30,
            }}
          >
            ✨ South Africa&apos;s First Community-Powered Commerce
          </div>

          {/* Logo */}
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: '#f97316',
              marginBottom: 20,
              letterSpacing: -2,
            }}
          >
            JEFFY
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 12,
            }}
          >
            Retail is broken.
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#9ca3af',
              marginBottom: 40,
            }}
          >
            We&apos;re fixing it.
          </div>

          {/* Two paths */}
          <div
            style={{
              display: 'flex',
              gap: 24,
            }}
          >
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: 16,
                padding: '20px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>Create a Want</div>
              <div style={{ color: '#f97316', fontSize: 14 }}>Get products FREE</div>
            </div>
            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: 16,
                padding: '20px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📍</div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>Zone Partner</div>
              <div style={{ color: '#f97316', fontSize: 14 }}>Keep 50% of sales</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
