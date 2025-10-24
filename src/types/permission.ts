/**
 * 权限管理模块类型定义
 */

import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';

/**
 * 角色
 */
export interface Role {
  RoleID: number;
  RoleName: string;
  Description?: string;
  CreateTime: string;
  UpdateTime?: string;
  TenantID?: number;
  CompanyID?: number;
}

/**
 * 操作员/位置用户
 */
export interface LocationUser {
  UID: string;
  UserName: string;
  MobilePhone: string;
  RoleID: number;
  RoleName: string;
  Status: UserStatus;
  CreateTime: string;
  UpdateTime?: string;
  LocationID?: number;
  CompanyID?: number;
}

/**
 * 用户状态
 */
export type UserStatus = 'active' | 'inactive';

/**
 * 模块
 */
export interface Module {
  ModuleID: string;
  ModuleName: string;
  Description?: string;
  ParentID?: string;
  Sort?: number;
  Icon?: string;
  Path?: string;
  BusinessID?: string;
  IsEnabled: boolean;
}

/**
 * 接口
 */
export interface Interface {
  InterfaceID: string;
  InterfaceName: string;
  InterfaceUrl: string;
  InterfaceMethod: HttpMethod;
  ModuleID: string;
  ModuleName?: string;
  Description?: string;
  Sort?: number;
}

/**
 * HTTP 方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 授权角色模块请求
 */
export interface GrantRoleModuleRequest {
  RoleID: number;
  ModuleIDs: string[];
}

/**
 * 授权角色接口请求
 */
export interface GrantRoleInterfaceRequest {
  RoleID: number;
  InterfaceIDs: string[];
}

/**
 * 授权角色模块和接口请求
 */
export interface GrantRoleModuleAndInterfaceRequest {
  RoleID: number;
  ModuleIDs: string[];
  InterfaceIDs: string[];
}

/**
 * 角色表单值
 */
export interface RoleFormValues {
  RoleName: string;
  Description?: string;
}

/**
 * 操作员表单值
 */
export interface LocationUserFormValues {
  UserName: string;
  MobilePhone: string;
  RoleID: number;
  Password?: string;
}

/**
 * 添加操作员请求
 */
export interface AddLocationUserRequest {
  UserName: string;
  MobilePhone: string;
  RoleID: number;
  Password?: string;
}

/**
 * 角色搜索请求
 */
export interface RoleSearchRequest {
  KeyWord?: string;
  PageObject?: {
    PageIndex: number;
    PageSize: number;
    AskSummary?: boolean;
  };
}

/**
 * 用户状态选项
 */
export const userStatusOptions = [
  {
    label: 'Active',
    value: 'active' as UserStatus,
    icon: IconCircleCheck
  },
  {
    label: 'Inactive',
    value: 'inactive' as UserStatus,
    icon: IconCircleX
  }
] as const;

/**
 * HTTP 方法选项
 */
export const httpMethodOptions = [
  { label: 'GET', value: 'GET' as HttpMethod },
  { label: 'POST', value: 'POST' as HttpMethod },
  { label: 'PUT', value: 'PUT' as HttpMethod },
  { label: 'DELETE', value: 'DELETE' as HttpMethod },
  { label: 'PATCH', value: 'PATCH' as HttpMethod }
] as const;

/**
 * 模块树节点（用于权限分配）
 */
export interface ModuleTreeNode extends Module {
  children?: ModuleTreeNode[];
  checked?: boolean;
  indeterminate?: boolean;
}

/**
 * 接口分组（按模块分组）
 */
export interface InterfaceGroup {
  moduleId: string;
  moduleName: string;
  interfaces: Interface[];
  checkedCount?: number;
  totalCount?: number;
}
