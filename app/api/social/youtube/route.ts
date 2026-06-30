import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Start YouTube OAuth flow placeholder
  const clientId = process.env.YOUTUBE_CLIENT_ID || ''
  const redirectUri = process.env.NEXT_PUBLIC_VERCEL_URL ? `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/social/youtube/callback` : 'https://your-app.com/api/social/youtube/callback'
  const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.email')
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&access_type=offline&prompt=consent`
  return NextResponse.redirect(url)
}
