/**
 * Company Store - 公司管理状态
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Company, Business, CurrentContext } from '@/types/company';
import { companyService } from '@/services/company.service';
import { toast } from 'sonner';

interface CompanyState {
  // 数据
  companies: Company[];
  businesses: Business[];
  currentContext: CurrentContext;
  isLoading: boolean;

  // 操作
  fetchCompanies: () => Promise<void>;
  fetchBusinesses: () => Promise<void>;
  switchCompany: (companyId: number, companyName: string) => Promise<void>;
  setCurrentContext: (context: Partial<CurrentContext>) => void;
  reset: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      companies: [],
      businesses: [],
      currentContext: {},
      isLoading: false,

      // 获取公司列表
      fetchCompanies: async () => {
        set({ isLoading: true });
        try {
          const companies = await companyService.getCompanyList();
          set({ companies, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch companies:', error);
          toast.error('获取公司列表失败');
          set({ isLoading: false });
        }
      },

      // 获取业务列表
      fetchBusinesses: async () => {
        set({ isLoading: true });
        try {
          const businesses = await companyService.getCompanyBusinessList();
          set({ businesses, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch businesses:', error);
          toast.error('获取业务列表失败');
          set({ isLoading: false });
        }
      },

      // 切换公司
      switchCompany: async (companyId: number, companyName: string) => {
        set({ isLoading: true });
        try {
          const newToken = await companyService.intoCompany(companyId);

          if (newToken) {
            // 更新当前上下文
            set({
              currentContext: {
                companyId,
                companyName,
                businessId: undefined,
                businessName: undefined
              },
              isLoading: false
            });

            // 重新获取业务列表
            await get().fetchBusinesses();

            toast.success(`已切换至 ${companyName}`);

            // 刷新页面以重新加载权限
            window.location.reload();
          }
        } catch (error) {
          console.error('Failed to switch company:', error);
          toast.error('切换公司失败');
          set({ isLoading: false });
        }
      },

      // 设置当前上下文
      setCurrentContext: (context: Partial<CurrentContext>) => {
        set((state) => ({
          currentContext: {
            ...state.currentContext,
            ...context
          }
        }));
      },

      // 重置状态
      reset: () => {
        set({
          companies: [],
          businesses: [],
          currentContext: {},
          isLoading: false
        });
      }
    }),
    { name: 'company-store' }
  )
);
