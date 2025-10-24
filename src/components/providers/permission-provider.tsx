/**
 * 权限提供者组件
 * 在应用启动时初始化用户权限
 */

'use client';

import { useEffect } from 'react';
import { usePermission } from '@/hooks/use-permission';
import { usePathname } from 'next/navigation';

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { fetchMyPermissions, isInitialized } = usePermission();
  const pathname = usePathname();

  useEffect(() => {
    // 只在登录后的页面（dashboard）加载权限
    const isDashboard = pathname?.startsWith('/dashboard');

    if (isDashboard && !isInitialized) {
      fetchMyPermissions();
    }
  }, [pathname, isInitialized, fetchMyPermissions]);

  return <>{children}</>;
}
