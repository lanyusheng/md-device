/**
 * 公司/租户管理模块类型定义
 */

import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';

/**
 * 公司
 */
export interface Company {
  CompanyID: number;
  CompanyName: string;
  TenantID: number;
  Status: CompanyStatus;
  CreateTime: string;
  UpdateTime?: string;
  Description?: string;
  ContactPerson?: string;
  ContactPhone?: string;
  Address?: string;
}

/**
 * 公司状态
 */
export type CompanyStatus = 'active' | 'inactive';

/**
 * 业务
 */
export interface Business {
  BusinessID: string;
  BusinessName: string;
  CompanyID: number;
  CompanyName?: string;
  Description?: string;
  Status: BusinessStatus;
  CreateTime?: string;
  UpdateTime?: string;
  Sort?: number;
}

/**
 * 业务状态
 */
export type BusinessStatus = 'active' | 'inactive';

/**
 * 进入公司请求
 */
export interface IntoCompanyRequest {
  CompanyID: number;
}

/**
 * 公司搜索请求
 */
export interface CompanySearchRequest {
  KeyWord?: string;
  Status?: CompanyStatus;
  PageObject?: {
    PageIndex: number;
    PageSize: number;
    AskSummary?: boolean;
  };
}

/**
 * 公司状态选项
 */
export const companyStatusOptions = [
  {
    label: 'Active',
    value: 'active' as CompanyStatus,
    icon: IconCircleCheck
  },
  {
    label: 'Inactive',
    value: 'inactive' as CompanyStatus,
    icon: IconCircleX
  }
] as const;

/**
 * 业务状态选项
 */
export const businessStatusOptions = [
  {
    label: 'Active',
    value: 'active' as BusinessStatus,
    icon: IconCircleCheck
  },
  {
    label: 'Inactive',
    value: 'inactive' as BusinessStatus,
    icon: IconCircleX
  }
] as const;

/**
 * 当前上下文（当前所在的公司和业务）
 */
export interface CurrentContext {
  companyId?: number;
  companyName?: string;
  businessId?: string;
  businessName?: string;
}
