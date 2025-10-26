import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否访问受保护的路由
  if (pathname.startsWith('/dashboard')) {
    const isAuthenticated = request.cookies.get('auth-token');

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 如果已登录，访问登录页则重定向到设备管理
  if (pathname === '/login') {
    const isAuthenticated = request.cookies.get('auth-token');
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard/devices', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
