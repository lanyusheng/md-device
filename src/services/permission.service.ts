/**
 * Permission 服务层
 * 封装所有权限管理相关的 API 调用
 *
 * 注意：所有 UserLocation 参数已注释，后端通过 HTTP Header 中的 token 进行鉴权
 */

import apiClient from '@/lib/api-client';
import type {
  Role,
  RoleSearchRequest,
  LocationUser,
  AddLocationUserRequest,
  Module,
  Interface,
  GrantRoleModuleRequest,
  GrantRoleInterfaceRequest,
  GrantRoleModuleAndInterfaceRequest
} from '@/types/permission';
import type { ApiResponse } from '@/types/api';

/**
 * 角色管理 API
 */
export const roleService = {
  /**
   * 查询角色列表
   */
  async getRoleList(params?: RoleSearchRequest): Promise<Role[]> {
    const response = await apiClient.post<ApiResponse<Role[]>>(
      '/Permission/GetRoleList',
      {
        KeyWord: params?.KeyWord || '',
        PageObject: params?.PageObject || {
          PageIndex: 1,
          PageSize: 100,
          AskSummary: false
        }
      }
    );

    return response.Result || [];
  },

  /**
   * 新增角色
   */
  async addRole(role: { RoleName: string; Description?: string }): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/Permission/AddRole', {
      DataObject: role
    });
  },

  /**
   * 修改角色
   */
  async updateRole(role: Role): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/Permission/UpdateRole', {
      DataObject: role
    });
  },

  /**
   * 删除角色
   */
  async deleteRole(roleId: number): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/Permission/DeleteRole', roleId);
  }
};

/**
 * 操作员管理 API
 */
export const locationUserService = {
  /**
   * 增加操作员
   */
  async addLocationUser(user: AddLocationUserRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/Permission/AddLocationUser', {
      DataObject: user
    });
  },

  /**
   * 移除操作员
   */
  async quitLocationUser(uid: string): Promise<void> {
    await apiClient.get<ApiResponse<void>>(`/Permission/QuitLocationUser?UID=${uid}`);
  },

  /**
   * 查询当前用户拥有权限的位置列表
   */
  async getMyLocationList(): Promise<LocationUser[]> {
    const response = await apiClient.post<ApiResponse<LocationUser[]>>(
      '/Permission/GetMyLocationList',
      {}
    );

    return response.Result || [];
  }
};

/**
 * 模块管理 API
 */
export const moduleService = {
  /**
   * 查询全业务开放模块列表
   */
  async getModuleList(): Promise<Module[]> {
    const response = await apiClient.post<ApiResponse<Module[]>>(
      '/Permission/GetModuleList',
      {}
    );

    return response.Result || [];
  },

  /**
   * 查询指定角色的模块列表
   */
  async getRoleModuleList(roleId: number): Promise<Module[]> {
    const response = await apiClient.post<ApiResponse<Module[]>>(
      '/Permission/GetRoleModuleList',
      roleId
    );

    return response.Result || [];
  },

  /**
   * 查询当前用户的模块列表
   */
  async getMyModuleList(): Promise<Module[]> {
    const response = await apiClient.post<ApiResponse<Module[]>>(
      '/Permission/GetMyModuleList',
      {}
    );

    return response.Result || [];
  },

  /**
   * 向指定角色进行模块授权
   */
  async grantRoleModule(data: GrantRoleModuleRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/Permission/GrantRoleModule', {
      DataObject: data
    });
  }
};

/**
 * 接口管理 API
 */
export const interfaceService = {
  /**
   * 查询全业务开放接口列表
   */
  async getInterfaceList(): Promise<Interface[]> {
    const response = await apiClient.post<ApiResponse<Interface[]>>(
      '/Permission/GetInterfaceList',
      {}
    );

    return response.Result || [];
  },

  /**
   * 查询全业务开放接口列表(根据模块编号分组)
   */
  async getInterfaceListByModuleGroup(): Promise<Record<string, Interface[]>> {
    const response = await apiClient.post<ApiResponse<Record<string, Interface[]>>>(
      '/Permission/GetInterfaceListByModuleGroup',
      {}
    );

    return response.Result || {};
  },

  /**
   * 查询指定角色的接口列表
   */
  async getRoleInterfaceList(roleId: number): Promise<Interface[]> {
    const response = await apiClient.post<ApiResponse<Interface[]>>(
      '/Permission/GetRoleInterfaceList',
      roleId
    );

    return response.Result || [];
  },

  /**
   * 查询指定模块的接口列表
   */
  async getModuleInterfaceList(moduleId: string): Promise<Interface[]> {
    const response = await apiClient.post<ApiResponse<Interface[]>>(
      '/Permission/GetModuleInterfaceList',
      moduleId
    );

    return response.Result || [];
  },

  /**
   * 查询当前用户的接口列表
   */
  async getMyInterfaceList(): Promise<Interface[]> {
    const response = await apiClient.post<ApiResponse<Interface[]>>(
      '/Permission/GetMyInterfaceList',
      {}
    );

    return response.Result || [];
  },

  /**
   * 向指定角色进行接口授权
   */
  async grantRoleInterface(data: GrantRoleInterfaceRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/Permission/GrantRoleInterface', {
      DataObject: data
    });
  },

  /**
   * 向指定角色进行模块和接口授权
   */
  async grantRoleModuleAndInterface(
    data: GrantRoleModuleAndInterfaceRequest
  ): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      '/Permission/GrantRoleModuleAndInterface',
      {
        DataObject: data
      }
    );
  }
};
