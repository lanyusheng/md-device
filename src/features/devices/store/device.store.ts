import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Device, DeviceSearchRequest, PageObject } from '@/types/api';
import { deviceService } from '@/services/device.service';

interface DeviceState {
  // 数据状态
  devices: Device[];
  selectedDevice: Device | null;
  totalDevices: number;

  // 分页状态
  pageInfo: PageObject;

  // UI 状态
  isLoading: boolean;
  isDrawerOpen: boolean;
  drawerMode: 'create' | 'edit' | 'view';
  isScreenMirroringLoading: boolean;
  screenMirroringDeviceName: string;

  // 搜索状态
  searchKeyword: string;
}

interface DeviceActions {
  // 数据操作
  fetchDevices: (request?: Partial<DeviceSearchRequest>) => Promise<void>;
  createDevice: (device: Device) => Promise<void>;
  updateDevice: (deviceId: string, device: Device) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  batchDeleteDevices: (deviceIds: string[]) => Promise<void>;

  // UI 操作
  setSelectedDevice: (device: Device | null) => void;
  openDrawer: (mode: 'create' | 'edit' | 'view', device?: Device) => void;
  closeDrawer: () => void;
  setScreenMirroringLoading: (loading: boolean, deviceName?: string) => void;

  // 搜索和分页
  setSearchKeyword: (keyword: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // 工具方法
  refreshDevices: () => Promise<void>;
}

type DeviceStore = DeviceState & DeviceActions;

export const useDeviceStore = create<DeviceStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      devices: [],
      selectedDevice: null,
      totalDevices: 0,
      pageInfo: {
        PageIndex: 1,
        PageSize: 10,
        PageCount: 0,
        RecordCount: 0,
        AskSummary: true,
      },
      isLoading: false,
      isDrawerOpen: false,
      drawerMode: 'create',
      isScreenMirroringLoading: false,
      screenMirroringDeviceName: '',
      searchKeyword: '',

      // 获取设备列表
      fetchDevices: async (request) => {
        set({ isLoading: true });
        try {
          const { pageInfo, searchKeyword } = get();
          const searchRequest: DeviceSearchRequest = {
            KeyWord: request?.KeyWord ?? searchKeyword,
            PageObject: request?.PageObject ?? pageInfo,
          };

          const response = await deviceService.getDevicePage(searchRequest);

          // Code === 0 表示成功
          if (response.Code === 0 && response.Result) {
            set({
              devices: response.Result.ResultList || [],
              totalDevices: response.Result.RecordCount || 0,
              pageInfo: {
                PageIndex: response.Result.PageIndex || 1,
                PageSize: response.Result.PageSize || 10,
                PageCount: response.Result.PageCount || 0,
                RecordCount: response.Result.RecordCount || 0,
                AskSummary: true,
              },
            });
          }
        } catch (error) {
          console.error('Failed to fetch devices:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // 创建设备
      createDevice: async (device) => {
        set({ isLoading: true });
        try {
          await deviceService.addDevice(device);
          await get().refreshDevices();
          get().closeDrawer();
        } catch (error) {
          console.error('Failed to create device:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 更新设备
      updateDevice: async (deviceId, device) => {
        set({ isLoading: true });
        try {
          const data = {
            TenantId: device.TenantID,
            Device: device,
          };
          await deviceService.updateDevice(deviceId, data);
          await get().refreshDevices();
          get().closeDrawer();
        } catch (error) {
          console.error('Failed to update device:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 删除设备
      deleteDevice: async (deviceId) => {
        set({ isLoading: true });
        try {
          await deviceService.deleteDevice(deviceId);
          await get().refreshDevices();
        } catch (error) {
          console.error('Failed to delete device:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 批量删除设备
      batchDeleteDevices: async (deviceIds) => {
        set({ isLoading: true });
        try {
          const { devices } = get();
          const tenantId = devices[0]?.TenantID || 0;

          await deviceService.batchRemoveDevice({
            TenantId: tenantId,
            Uids: deviceIds,
          });
          await get().refreshDevices();
        } catch (error) {
          console.error('Failed to batch delete devices:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 设置选中的设备
      setSelectedDevice: (device) => {
        set({ selectedDevice: device });
      },

      // 打开抽屉
      openDrawer: (mode, device) => {
        set({
          isDrawerOpen: true,
          drawerMode: mode,
          selectedDevice: device || null,
        });
      },

      // 关闭抽屉
      closeDrawer: () => {
        set({
          isDrawerOpen: false,
          selectedDevice: null,
        });
      },

      // 设置投屏 loading 状态
      setScreenMirroringLoading: (loading, deviceName = '') => {
        set({
          isScreenMirroringLoading: loading,
          screenMirroringDeviceName: deviceName,
        });
      },

      // 设置搜索关键词
      setSearchKeyword: (keyword) => {
        set({ searchKeyword: keyword });
      },

      // 设置页码
      setPage: (page) => {
        set((state) => ({
          pageInfo: { ...state.pageInfo, PageIndex: page },
        }));
        get().fetchDevices();
      },

      // 设置每页数量
      setPageSize: (pageSize) => {
        set((state) => ({
          pageInfo: { ...state.pageInfo, PageSize: pageSize, PageIndex: 1 },
        }));
        get().fetchDevices();
      },

      // 刷新设备列表
      refreshDevices: async () => {
        await get().fetchDevices();
      },
    }),
    {
      name: 'device-store',
    }
  )
);
