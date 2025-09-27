/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Angelise'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'white',
          fontSize: 64,
          fontWeight: 700,
          padding: 60
        }}
      >
        <div style={{ fontSize: 28, color: '#64748b', marginBottom: 16 }}>Angelise</div>
        <div style={{ textAlign: 'center' }}>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
