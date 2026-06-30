import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ''
    const signature = req.headers.get('x-lemonsqueezy-signature') || ''

    // Basic HMAC verification (LemonSqueezy may use a similar scheme). Compute HMAC-SHA256 of body.
    if (secret) {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const alg = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      const sigBuffer = await crypto.subtle.sign('HMAC', alg, encoder.encode(body))
      const sigHex = Array.from(new Uint8Array(sigBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('')
      if (signature && signature !== sigHex) {
        console.warn('Webhook signature mismatch')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    console.log('Received LemonSqueezy webhook:', body)
    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
