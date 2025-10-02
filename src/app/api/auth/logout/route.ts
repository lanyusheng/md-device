import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // 删除认证 cookie
  response.cookies.delete('auth-token');

  return response;
}
