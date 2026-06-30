import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    // TODO: verify LemonSqueezy signature using LEMONSQUEEZY_WEBHOOK_SECRET
    // For now, log the event and return 200
    console.log('LemonSqueezy webhook:', body)
    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
