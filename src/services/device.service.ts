import apiClient from '@/lib/api-client';
import {
  ApiResponse,
  Device,
  DeviceState,
  DeviceSearchRequest,
  DevicePageResponse,
  RemoveDeviceDto,
  DeviceProfileState,
  InstallApkRequest,
  UninstallApkRequest,
  BatchShellRequest,
  BatchShellResult
} from '@/types/api';

/**
 * 设备管理服务
 */
class DeviceService {
  private readonly baseUrl = '/Device';

  /**
   * 创建设备
   */
  async addDevice(device: Device): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/AddDevice`, device);
  }

  /**
   * 删除设备
   */
  async deleteDevice(deviceId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseUrl}/DeleteDevice`, {
      DeviceID: deviceId
    });
  }

  /**
   * 批量移除设备
   */
  async batchRemoveDevice(dto: RemoveDeviceDto): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/BatchRemoveDevice`, dto);
  }

  /**
   * 修改设备资料
   */
  async updateDevice(
    deviceId: string,
    data: DeviceProfileState
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      `${this.baseUrl}/UpdateDevice`,
      data
    );
  }

  /**
   * 修改设备状态
   */
  async updateDeviceState(state: DeviceState): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/UpdateDeviceState`, state);
  }

  /**
   * 分页搜索设备列表
   */
  async getDevicePage(
    request: DeviceSearchRequest
  ): Promise<ApiResponse<DevicePageResponse>> {
    return apiClient.post(`${this.baseUrl}/GetDevicePage`, request);
  }

  /**
   * 安装应用
   */
  async installApk(request: InstallApkRequest): Promise<ApiResponse<any>> {
    //request.ApkUrl='http://file.xkdevice.com/apk/WifiFTP.1.9.4.apk';
    return apiClient.post(`${this.baseUrl}/InstallApk`, request);
  }

  /**
   * 卸载应用
   */
  async uninstallApk(request: UninstallApkRequest): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/UninstallApk`, request);
  }

  /**
   * 获取应用列表
   */
  async getPackageList(deviceId: string): Promise<ApiResponse<string[]>> {
    return apiClient.get(`${this.baseUrl}/GetPackageList`, {
      DeviceID: deviceId
    });
  }

  /**
   * 开始投屏
   */
  async startScreenMirroring(deviceId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseUrl}/StartScreenMirroring`, {
      DeviceID: deviceId
    });
  }

  /**
   * 停止投屏
   */
  async stopScreenMirroring(deviceId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseUrl}/StopScreenMirroring`, {
      DeviceID: deviceId
    });
  }

  /**
   * 上报设备状态
   */
  async reportDeviceState(state: DeviceState): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/ReportDeviceState`, state);
  }

  /**
   * 批量执行Shell命令
   */
  async batchShell(
    request: BatchShellRequest
  ): Promise<ApiResponse<Record<string, BatchShellResult>>> {
    return apiClient.post(`${this.baseUrl}/BatchShell`, request);
  }
}

// 导出单例
export const deviceService = new DeviceService();
