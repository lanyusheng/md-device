import apiClient from '@/lib/api-client';
import {
  ApiResponse,
  DeviceGroup,
  GroupSearchRequest,
  GroupPageResponse,
  AddDeviceGroupRequest,
  UpdateDeviceGroupRequest,
  DeleteDeviceGroupParams
} from '@/types/api';

/**
 * 设备分组管理服务
 */
class GroupService {
  private readonly baseUrl = '/Device';

  /**
   * 获取分组列表
   */
  async getDeviceGroupList(
    request: GroupSearchRequest
  ): Promise<ApiResponse<GroupPageResponse>> {
    return apiClient.post(`${this.baseUrl}/GetDeviceGroupList`, request);
  }

  /**
   * 添加分组
   */
  async addDeviceGroup(
    request: AddDeviceGroupRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/AddDeviceGroup`, request);
  }

  /**
   * 更新分组
   */
  async updateDeviceGroup(
    request: UpdateDeviceGroupRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/UpdateDeviceGroup`, request);
  }

  /**
   * 删除分组
   */
  async deleteDeviceGroup(
    params: DeleteDeviceGroupParams
  ): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseUrl}/DeleteDeviceGroup`, params);
  }
}

// 导出单例
export const groupService = new GroupService();
