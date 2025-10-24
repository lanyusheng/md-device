/**
 * Permission Store - 权限分配状态
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Module, Interface, InterfaceGroup } from '@/types/permission';
import {
  moduleService,
  interfaceService
} from '@/services/permission.service';
import { toast } from 'sonner';

interface PermissionState {
  // 数据
  allModules: Module[];
  allInterfaces: Interface[];
  roleModules: Module[];
  roleInterfaces: Interface[];
  selectedModuleIds: string[];
  selectedInterfaceIds: string[];
  currentRoleId: number | null;
  isLoading: boolean;

  // 操作
  fetchAllModules: () => Promise<void>;
  fetchAllInterfaces: () => Promise<void>;
  fetchRolePermissions: (roleId: number) => Promise<void>;
  toggleModule: (moduleId: string) => void;
  toggleInterface: (interfaceId: string) => void;
  selectAllModules: () => void;
  clearAllModules: () => void;
  selectAllInterfaces: () => void;
  clearAllInterfaces: () => void;
  savePermissions: (roleId: number) => Promise<void>;
  reset: () => void;
}

export const usePermissionStore = create<PermissionState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      allModules: [],
      allInterfaces: [],
      roleModules: [],
      roleInterfaces: [],
      selectedModuleIds: [],
      selectedInterfaceIds: [],
      currentRoleId: null,
      isLoading: false,

      // 获取所有模块
      fetchAllModules: async () => {
        try {
          const modules = await moduleService.getModuleList();
          set({ allModules: modules });
        } catch (error) {
          console.error('Failed to fetch modules:', error);
          toast.error('获取模块列表失败');
        }
      },

      // 获取所有接口
      fetchAllInterfaces: async () => {
        try {
          const interfaces = await interfaceService.getInterfaceList();
          set({ allInterfaces: interfaces });
        } catch (error) {
          console.error('Failed to fetch interfaces:', error);
          toast.error('获取接口列表失败');
        }
      },

      // 获取角色权限
      fetchRolePermissions: async (roleId: number) => {
        set({ isLoading: true, currentRoleId: roleId });
        try {
          const [modules, interfaces] = await Promise.all([
            moduleService.getRoleModuleList(roleId),
            interfaceService.getRoleInterfaceList(roleId)
          ]);

          set({
            roleModules: modules,
            roleInterfaces: interfaces,
            selectedModuleIds: modules.map((m) => m.ModuleID),
            selectedInterfaceIds: interfaces.map((i) => i.InterfaceID),
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to fetch role permissions:', error);
          toast.error('获取角色权限失败');
          set({ isLoading: false });
        }
      },

      // 切换模块选择
      toggleModule: (moduleId: string) => {
        set((state) => {
          const isSelected = state.selectedModuleIds.includes(moduleId);
          return {
            selectedModuleIds: isSelected
              ? state.selectedModuleIds.filter((id) => id !== moduleId)
              : [...state.selectedModuleIds, moduleId]
          };
        });
      },

      // 切换接口选择
      toggleInterface: (interfaceId: string) => {
        set((state) => {
          const isSelected = state.selectedInterfaceIds.includes(interfaceId);
          return {
            selectedInterfaceIds: isSelected
              ? state.selectedInterfaceIds.filter((id) => id !== interfaceId)
              : [...state.selectedInterfaceIds, interfaceId]
          };
        });
      },

      // 全选模块
      selectAllModules: () => {
        set((state) => ({
          selectedModuleIds: state.allModules.map((m) => m.ModuleID)
        }));
      },

      // 清空模块选择
      clearAllModules: () => {
        set({ selectedModuleIds: [] });
      },

      // 全选接口
      selectAllInterfaces: () => {
        set((state) => ({
          selectedInterfaceIds: state.allInterfaces.map((i) => i.InterfaceID)
        }));
      },

      // 清空接口选择
      clearAllInterfaces: () => {
        set({ selectedInterfaceIds: [] });
      },

      // 保存权限
      savePermissions: async (roleId: number) => {
        const { selectedModuleIds, selectedInterfaceIds } = get();

        set({ isLoading: true });
        try {
          await interfaceService.grantRoleModuleAndInterface({
            RoleID: roleId,
            ModuleIDs: selectedModuleIds,
            InterfaceIDs: selectedInterfaceIds
          });

          toast.success('权限保存成功');
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to save permissions:', error);
          toast.error('保存权限失败');
          set({ isLoading: false });
          throw error;
        }
      },

      // 重置状态
      reset: () => {
        set({
          allModules: [],
          allInterfaces: [],
          roleModules: [],
          roleInterfaces: [],
          selectedModuleIds: [],
          selectedInterfaceIds: [],
          currentRoleId: null,
          isLoading: false
        });
      }
    }),
    { name: 'permission-store' }
  )
);
