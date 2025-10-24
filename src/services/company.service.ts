/**
 * Company 服务层
 * 封装所有公司/租户管理相关的 API 调用
 *
 * 注意：所有 UserLocation 参数已移除，后端通过 HTTP Header 中的 token 进行鉴权
 */

import apiClient from '@/lib/api-client';
import type { Company, Business, IntoCompanyRequest } from '@/types/company';
import type { ApiResponse } from '@/types/api';

/**
 * 公司管理 API
 */
export const companyService = {
  /**
   * 获取公司列表
   */
  async getCompanyList(): Promise<Company[]> {
    const response = await apiClient.post<ApiResponse<Company[]>>(
      '/Company/GetCompanyList',
      {}
    );

    return response.Result || [];
  },

  /**
   * 进入指定公司
   * @param companyId 公司ID
   * @returns 返回新的 Token
   */
  async intoCompany(companyId: number): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ Token: string }>>(
      '/Company/IntoCompany',
      companyId
    );

    // 更新 Token
    const newToken = response.Result?.Token || '';
    if (newToken) {
      // 保存到 localStorage
      localStorage.setItem('auth_token', newToken);

      // 保存到 cookie（7天有效期）
      document.cookie = `auth-token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }

    return newToken;
  },

  /**
   * 获取当前公司的所有业务列表
   */
  async getCompanyBusinessList(): Promise<Business[]> {
    const response = await apiClient.post<ApiResponse<Business[]>>(
      '/Company/GetCompanyBusinessList'
    );

    return response.Result || [];
  }
};
