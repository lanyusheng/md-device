/**
 * 权限守卫组件
 * 用于保护需要特定权限才能访问的页面或组件
 *
 * 特殊规则：
 * - admin 用户为超级管理员，拥有所有权限，直接通过所有守卫
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { usePermission } from '@/hooks/use-permission';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

interface PermissionGuardProps {
  children: ReactNode;
  /**
   * 需要的模块权限（任意一个匹配即可）
   */
  moduleCode?: string | string[];
  /**
   * 需要的接口权限（任意一个匹配即可）
   */
  interfacePath?: string | string[];
  /**
   * 无权限时的回退 UI
   */
  fallback?: ReactNode;
  /**
   * 无权限时是否重定向到首页
   */
  redirectOnDenied?: boolean;
  /**
   * 无权限时重定向的路径
   */
  redirectPath?: string;
}

/**
 * 默认的无权限提示 UI
 */
function DefaultFallback() {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center gap-4">
      <div className="text-muted-foreground">您没有权限访问此内容</div>
      <a href="/dashboard" className="text-primary hover:underline">
        返回首页
      </a>
    </div>
  );
}

/**
 * 权限守卫组件
 */
export function PermissionGuard({
  children,
  moduleCode,
  interfacePath,
  fallback,
  redirectOnDenied = false,
  redirectPath = '/dashboard'
}: PermissionGuardProps) {
  const router = useRouter();
  const {
    hasModule,
    hasInterface,
    hasAnyModule,
    hasAnyInterface,
    isInitialized,
    fetchMyPermissions
  } = usePermission();
  const { checkIsSuperAdmin } = useAuthStore();

  // 初始化时加载权限
  useEffect(() => {
    if (!isInitialized) {
      fetchMyPermissions();
    }
  }, [isInitialized, fetchMyPermissions]);

  // 检查权限
  const hasPermission = (() => {
    // 优先检查：如果是超级管理员 (admin)，直接通过
    const isSuperAdmin = checkIsSuperAdmin();
    if (isSuperAdmin) {
      return true;
    }

    // 如果还未初始化，显示加载中
    if (!isInitialized) {
      return null;
    }

    // 如果没有指定任何权限要求，直接通过
    if (!moduleCode && !interfacePath) {
      return true;
    }

    // 检查模块权限
    if (moduleCode) {
      if (Array.isArray(moduleCode)) {
        if (!hasAnyModule(moduleCode)) {
          return false;
        }
      } else {
        if (!hasModule(moduleCode)) {
          return false;
        }
      }
    }

    // 检查接口权限
    if (interfacePath) {
      if (Array.isArray(interfacePath)) {
        if (!hasAnyInterface(interfacePath)) {
          return false;
        }
      } else {
        if (!hasInterface(interfacePath)) {
          return false;
        }
      }
    }

    return true;
  })();

  // 加载中状态
  if (hasPermission === null) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  // 无权限处理
  if (!hasPermission) {
    // 重定向
    if (redirectOnDenied) {
      router.push(redirectPath);
      return null;
    }

    // 显示回退 UI
    return <>{fallback || <DefaultFallback />}</>;
  }

  // 有权限，渲染子组件
  return <>{children}</>;
}

/**
 * 模块权限守卫（简化版）
 */
export function ModuleGuard({
  children,
  moduleCode,
  fallback,
  redirectOnDenied,
  redirectPath
}: Omit<PermissionGuardProps, 'interfacePath'> & {
  moduleCode: string | string[];
}) {
  return (
    <PermissionGuard
      moduleCode={moduleCode}
      fallback={fallback}
      redirectOnDenied={redirectOnDenied}
      redirectPath={redirectPath}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * 接口权限守卫（简化版）
 */
export function InterfaceGuard({
  children,
  interfacePath,
  fallback,
  redirectOnDenied,
  redirectPath
}: Omit<PermissionGuardProps, 'moduleCode'> & {
  interfacePath: string | string[];
}) {
  return (
    <PermissionGuard
      interfacePath={interfacePath}
      fallback={fallback}
      redirectOnDenied={redirectOnDenied}
      redirectPath={redirectPath}
    >
      {children}
    </PermissionGuard>
  );
}
