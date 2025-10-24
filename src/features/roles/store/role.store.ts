/**
 * Role Store - 角色管理状态
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Role } from '@/types/permission';
import { roleService } from '@/services/permission.service';
import { toast } from 'sonner';

interface RoleState {
  // 数据
  roles: Role[];
  isLoading: boolean;

  // 操作
  fetchRoles: (keyword?: string) => Promise<void>;
  addRole: (role: { RoleName: string; Description?: string }) => Promise<void>;
  updateRole: (role: Role) => Promise<void>;
  deleteRole: (roleId: number) => Promise<void>;
  reset: () => void;
}

export const useRoleStore = create<RoleState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      roles: [],
      isLoading: false,

      // 获取角色列表
      fetchRoles: async (keyword?: string) => {
        set({ isLoading: true });
        try {
          const roles = await roleService.getRoleList({
            KeyWord: keyword,
            PageObject: {
              PageIndex: 1,
              PageSize: 100,
              AskSummary: false
            }
          });
          set({ roles, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch roles:', error);
          toast.error('获取角色列表失败');
          set({ isLoading: false });
        }
      },

      // 添加角色
      addRole: async (role: { RoleName: string; Description?: string }) => {
        try {
          await roleService.addRole(role);
          toast.success('角色创建成功');
          // 重新获取列表
          await get().fetchRoles();
        } catch (error) {
          console.error('Failed to add role:', error);
          toast.error('创建角色失败');
          throw error;
        }
      },

      // 更新角色
      updateRole: async (role: Role) => {
        try {
          await roleService.updateRole(role);
          toast.success('角色更新成功');
          // 重新获取列表
          await get().fetchRoles();
        } catch (error) {
          console.error('Failed to update role:', error);
          toast.error('更新角色失败');
          throw error;
        }
      },

      // 删除角色
      deleteRole: async (roleId: number) => {
        try {
          await roleService.deleteRole(roleId);
          toast.success('角色删除成功');
          // 重新获取列表
          await get().fetchRoles();
        } catch (error) {
          console.error('Failed to delete role:', error);
          toast.error('删除角色失败');
          throw error;
        }
      },

      // 重置状态
      reset: () => {
        set({
          roles: [],
          isLoading: false
        });
      }
    }),
    { name: 'role-store' }
  )
);
