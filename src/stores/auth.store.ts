/**
 * 认证状态管理
 * 存储当前登录用户信息
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserInfo {
  uid?: string;
  username?: string;
  mobilePhone?: string;
  roleId?: number;
  roleName?: string;
  /**
   * 是否为超级管理员
   * admin 用户拥有所有权限
   */
  isSuperAdmin?: boolean;
}

interface AuthState {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;

  // 操作
  setUserInfo: (userInfo: UserInfo) => void;
  clearUserInfo: () => void;
  checkIsSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        userInfo: null,
        isAuthenticated: false,

        setUserInfo: (userInfo: UserInfo) => {
          // 判断是否为超级管理员
          const isSuperAdmin = userInfo.username?.toLowerCase() === 'admin';

          set({
            userInfo: {
              ...userInfo,
              isSuperAdmin
            },
            isAuthenticated: true
          });
        },

        clearUserInfo: () => {
          set({
            userInfo: null,
            isAuthenticated: false
          });
        },

        checkIsSuperAdmin: () => {
          const { userInfo } = get();
          return userInfo?.isSuperAdmin === true ||
                 userInfo?.username?.toLowerCase() === 'admin';
        }
      }),
      {
        name: 'auth-storage', // localStorage key
        partialize: (state) => ({
          userInfo: state.userInfo,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'auth-store' }
  )
);
