/**
 * User Store - 操作员管理状态
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { LocationUser, AddLocationUserRequest } from '@/types/permission';
import { locationUserService } from '@/services/permission.service';
import { toast } from 'sonner';

interface UserState {
  // 数据
  users: LocationUser[];
  isLoading: boolean;

  // 操作
  fetchUsers: () => Promise<void>;
  addUser: (user: AddLocationUserRequest) => Promise<void>;
  removeUser: (uid: string) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      users: [],
      isLoading: false,

      // 获取操作员列表
      fetchUsers: async () => {
        set({ isLoading: true });
        try {
          const users = await locationUserService.getMyLocationList();
          set({ users, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch users:', error);
          toast.error('获取操作员列表失败');
          set({ isLoading: false });
        }
      },

      // 添加操作员
      addUser: async (user: AddLocationUserRequest) => {
        try {
          await locationUserService.addLocationUser(user);
          toast.success('操作员添加成功');
          // 重新获取列表
          await get().fetchUsers();
        } catch (error) {
          console.error('Failed to add user:', error);
          toast.error('添加操作员失败');
          throw error;
        }
      },

      // 移除操作员
      removeUser: async (uid: string) => {
        try {
          await locationUserService.quitLocationUser(uid);
          toast.success('操作员移除成功');
          // 重新获取列表
          await get().fetchUsers();
        } catch (error) {
          console.error('Failed to remove user:', error);
          toast.error('移除操作员失败');
          throw error;
        }
      },

      // 重置状态
      reset: () => {
        set({
          users: [],
          isLoading: false
        });
      }
    }),
    { name: 'user-store' }
  )
);
