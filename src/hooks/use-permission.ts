/**
 * 权限检查 Hook
 * 用于检查用户是否有访问特定模块或接口的权限
 *
 * 特殊规则：
 * - admin 用户为超级管理员，拥有所有权限
 * - 权限检查时优先判断是否为 admin 用户
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { moduleService } from '@/services/permission.service';
import { useAuthStore } from '@/stores/auth.store';
import type { Module, Interface } from '@/types/permission';

interface PermissionState {
  // 数据
  modules: Module[];
  interfaces: Interface[];
  isLoading: boolean;
  isInitialized: boolean;

  // 操作
  fetchMyPermissions: () => Promise<void>;
  hasModule: (moduleCode: string) => boolean;
  hasInterface: (interfacePath: string) => boolean;
  hasAnyModule: (moduleCodes: string[]) => boolean;
  hasAnyInterface: (interfacePaths: string[]) => boolean;
  reset: () => void;
}

const usePermissionStore = create<PermissionState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      modules: [],
      interfaces: [],
      isLoading: false,
      isInitialized: false,

      // 获取当前用户的权限
      fetchMyPermissions: async () => {
        if (get().isLoading) return;

        // 如果是超级管理员，跳过权限加载，直接标记为已初始化
        const isSuperAdmin = useAuthStore.getState().checkIsSuperAdmin();
        if (isSuperAdmin) {
          set({
            modules: [],
            isLoading: false,
            isInitialized: true
          });
          console.log('Admin 超级管理员无需加载权限，拥有所有权限');
          return;
        }

        // 普通用户：从后端加载权限
        set({ isLoading: true });
        try {
          const modules = await moduleService.getMyModuleList();
          set({
            modules,
            isLoading: false,
            isInitialized: true
          });
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
          set({
            isLoading: false,
            isInitialized: true
          });
        }
      },

      // 检查是否有特定模块权限
      hasModule: (moduleCode: string) => {
        // 优先检查是否为超级管理员
        const isSuperAdmin = useAuthStore.getState().checkIsSuperAdmin();
        if (isSuperAdmin) {
          return true;
        }

        const { modules } = get();
        return modules.some((m) => m.ModuleCode === moduleCode);
      },

      // 检查是否有特定接口权限
      hasInterface: (interfacePath: string) => {
        // 优先检查是否为超级管理员
        const isSuperAdmin = useAuthStore.getState().checkIsSuperAdmin();
        if (isSuperAdmin) {
          return true;
        }

        const { modules } = get();
        // 遍历所有模块的接口列表
        return modules.some((module) =>
          module.Interfaces?.some((iface) => iface.InterfacePath === interfacePath)
        );
      },

      // 检查是否有任意一个模块权限
      hasAnyModule: (moduleCodes: string[]) => {
        // 优先检查是否为超级管理员
        const isSuperAdmin = useAuthStore.getState().checkIsSuperAdmin();
        if (isSuperAdmin) {
          return true;
        }

        const { hasModule } = get();
        return moduleCodes.some((code) => hasModule(code));
      },

      // 检查是否有任意一个接口权限
      hasAnyInterface: (interfacePaths: string[]) => {
        // 优先检查是否为超级管理员
        const isSuperAdmin = useAuthStore.getState().checkIsSuperAdmin();
        if (isSuperAdmin) {
          return true;
        }

        const { hasInterface } = get();
        return interfacePaths.some((path) => hasInterface(path));
      },

      // 重置状态
      reset: () => {
        set({
          modules: [],
          interfaces: [],
          isLoading: false,
          isInitialized: false
        });
      }
    }),
    { name: 'permission-store' }
  )
);

/**
 * 权限检查 Hook
 * @returns Permission store methods
 */
export function usePermission() {
  return usePermissionStore();
}

/**
 * 检查模块权限的 Hook
 * @param moduleCode 模块代码
 * @returns 是否有权限
 */
export function useHasModule(moduleCode: string): boolean {
  return usePermissionStore((state) => state.hasModule(moduleCode));
}

/**
 * 检查接口权限的 Hook
 * @param interfacePath 接口路径
 * @returns 是否有权限
 */
export function useHasInterface(interfacePath: string): boolean {
  return usePermissionStore((state) => state.hasInterface(interfacePath));
}

/**
 * 检查是否有任意一个模块权限的 Hook
 * @param moduleCodes 模块代码列表
 * @returns 是否有权限
 */
export function useHasAnyModule(moduleCodes: string[]): boolean {
  return usePermissionStore((state) => state.hasAnyModule(moduleCodes));
}

/**
 * 检查是否有任意一个接口权限的 Hook
 * @param interfacePaths 接口路径列表
 * @returns 是否有权限
 */
export function useHasAnyInterface(interfacePaths: string[]): boolean {
  return usePermissionStore((state) => state.hasAnyInterface(interfacePaths));
}
