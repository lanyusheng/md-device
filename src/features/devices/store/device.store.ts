import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Device, DeviceSearchRequest, PageObject, BatchScreenMirroringInfo } from '@/types/api';
import { deviceService } from '@/services/device.service';

interface DeviceState {
  // Data state
  devices: Device[];
  selectedDevice: Device | null;
  totalDevices: number;

  // Pagination state
  pageInfo: PageObject;

  // UI state
  isLoading: boolean;
  isDrawerOpen: boolean;
  drawerMode: 'create' | 'edit' | 'view';
  isScreenMirroringLoading: boolean;
  screenMirroringDeviceName: string;

  // Search state
  searchKeyword: string;

  // Group filter
  selectedGroupId: number | null;

  // Batch screen state
  batchScreenMirroringDevices: BatchScreenMirroringInfo[];
  isBatchScreenMirroringBusy: boolean;
}

interface DeviceActions {
  // 数据操作
  fetchDevices: (request?: Partial<DeviceSearchRequest>) => Promise<void>;
  createDevice: (device: Device) => Promise<void>;
  updateDevice: (deviceId: string, device: Device) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  batchDeleteDevices: (deviceIds: string[]) => Promise<void>;
  batchAssignDevicesToGroup: (deviceIds: string[], groupId: number) => Promise<void>;
  batchUpdateDeviceFields: (deviceIds: string[], fields: Partial<Device>) => Promise<void>;

  // UI 操作
  setSelectedDevice: (device: Device | null) => void;
  openDrawer: (mode: 'create' | 'edit' | 'view', device?: Device) => void;
  closeDrawer: () => void;
  setScreenMirroringLoading: (loading: boolean, deviceName?: string) => void;

  // 搜索和分页
  setSearchKeyword: (keyword: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Group filter
  setSelectedGroupId: (groupId: number | null) => void;
  filterDevicesByGroup: (groupId: number | null) => void;

  // 批量投屏操作
  startBatchScreenMirroring: (devices: Device[]) => Promise<void>;
  pauseBatchScreenMirroring: (deviceIds?: string[]) => Promise<void>;
  resumeBatchScreenMirroring: (deviceIds?: string[]) => Promise<void>;
  stopBatchScreenMirroring: (deviceIds?: string[]) => Promise<void>;
  updateBatchScreenDevice: (deviceId: string, updates: Partial<BatchScreenMirroringInfo>) => void;

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
      selectedGroupId: null,
      batchScreenMirroringDevices: [],
      isBatchScreenMirroringBusy: false,

      // 获取设备列表
      fetchDevices: async (request) => {
        console.log('[fetchDevices] START, request:', request);
        set({ isLoading: true });
        try {
          const { pageInfo, searchKeyword } = get();

          const searchRequest: DeviceSearchRequest = {
            KeyWord: request?.KeyWord ?? searchKeyword,
            PageObject: request?.PageObject ?? pageInfo,
          };

          console.log('[fetchDevices] searchRequest:', searchRequest);

          const response = await deviceService.getDevicePage(searchRequest);
          console.log('[fetchDevices] response.Code:', response.Code);
          console.log('[fetchDevices] response.Result:', response.Result);
          console.log('[fetchDevices] response.Result?.ResultList:', response.Result?.ResultList);
          console.log('[fetchDevices] response.Result?.RecordCount:', response.Result?.RecordCount);

          // Code === 0 表示成功
          if (response.Code === 0 && response.Result) {
            const resultList = response.Result.ResultList || [];
            const recordCount = response.Result.RecordCount ?? resultList.length;

            console.log('[fetchDevices] SUCCESS');
            console.log('[fetchDevices] ResultList length:', resultList.length);
            console.log('[fetchDevices] RecordCount from API:', response.Result.RecordCount);
            console.log('[fetchDevices] RecordCount to use:', recordCount);

            set({
              devices: resultList,
              totalDevices: recordCount,
              pageInfo: {
                PageIndex: response.Result.PageIndex || 1,
                PageSize: response.Result.PageSize || 10,
                PageCount: response.Result.PageCount || 0,
                RecordCount: recordCount,
                AskSummary: true,
              },
            });

            console.log('[fetchDevices] State updated, totalDevices should be:', recordCount);
          } else {
            console.log('[fetchDevices] FAILED, response.Code:', response.Code);
          }
        } catch (error) {
          console.error('[fetchDevices] ERROR:', error);
        } finally {
          console.log('[fetchDevices] FINALLY, setting isLoading to false');
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

      // 批量分配设备到分组
      batchAssignDevicesToGroup: async (deviceIds, groupId) => {
        set({ isLoading: true });
        try {
          // 循环调用UpdateDevice接口，只传DeviceID和GroupID
          await Promise.all(
            deviceIds.map(async (deviceId) => {
              const data = {
                DeviceID: deviceId,
                GroupID: groupId
              };
              await deviceService.updateDevice(deviceId, data as any);
            })
          );

          await get().refreshDevices();
        } catch (error) {
          console.error('Failed to batch assign devices to group:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 批量更新设备字段（机箱编号、卡槽编号、备注等）
      batchUpdateDeviceFields: async (deviceIds, fields) => {
        set({ isLoading: true });
        try {
          // 循环调用UpdateDevice接口，只传DeviceID和要更新的字段
          await Promise.all(
            deviceIds.map(async (deviceId) => {
              const data = {
                DeviceID: deviceId,
                ...fields
              };
              await deviceService.updateDevice(deviceId, data as any);
            })
          );

          await get().refreshDevices();
        } catch (error) {
          console.error('Failed to batch update device fields:', error);
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

      // 设置选中的分组ID
      setSelectedGroupId: (groupId) => {
        set({ selectedGroupId: groupId });
      },

      // 按Group filter设备
      filterDevicesByGroup: (groupId) => {
        set({ selectedGroupId: groupId });
        get().fetchDevices();
      },

      // Start batch screen mirroring
      startBatchScreenMirroring: async (devices) => {
        if (!devices || devices.length === 0) {
          set({ batchScreenMirroringDevices: [] });
          return;
        }

        const normalizedDevices: BatchScreenMirroringInfo[] = devices.map((device) => {
          const deviceId = device.DeviceID ?? '';
          const hasDeviceId = deviceId.length > 0;

          return {
            DeviceID: deviceId,
            DeviceName: device.DeviceName ?? '未命名设备',
            ScreenUrl: null,
            isLoading: hasDeviceId,
            status: hasDeviceId ? 'connecting' : 'error',
            error: hasDeviceId ? null : '缺少设备ID',
          };
        });

        set({
          batchScreenMirroringDevices: normalizedDevices,
          isBatchScreenMirroringBusy: true,
        });

        try {
          await Promise.all(
            normalizedDevices.map(async (item) => {
              if (!item.DeviceID || item.status === 'error') {
                return;
              }

              try {
                const response = await deviceService.startScreenMirroring(item.DeviceID);

                if (response.Code === 0 && response.Result) {
                  let url: string = response.Result;
                  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                    url = `http://${url}`;
                  }

                  get().updateBatchScreenDevice(item.DeviceID, {
                    ScreenUrl: url,
                    isLoading: false,
                    status: 'playing',
                    error: null,
                  });
                } else {
                  get().updateBatchScreenDevice(item.DeviceID, {
                    isLoading: false,
                    status: 'error',
                    error: response.Message || '投屏启动失败',
                  });
                }
              } catch (error) {
                console.error('Failed to start screen mirroring:', error);
                get().updateBatchScreenDevice(item.DeviceID, {
                  isLoading: false,
                  status: 'error',
                  error: '投屏失败',
                });
              }
            })
          );
        } finally {
          set({ isBatchScreenMirroringBusy: false });
        }
      },

      // Pause batch screen mirroring
      pauseBatchScreenMirroring: async (deviceIds) => {
        const { batchScreenMirroringDevices } = get();
        const targetDevices = batchScreenMirroringDevices.filter((device) => {
          const inScope = !deviceIds || deviceIds.includes(device.DeviceID);
          return inScope && device.DeviceID && device.status === 'playing';
        });

        if (targetDevices.length === 0) {
          return;
        }

        const targetIds = targetDevices.map((device) => device.DeviceID);

        set((state) => ({
          isBatchScreenMirroringBusy: true,
          batchScreenMirroringDevices: state.batchScreenMirroringDevices.map((device) =>
            targetIds.includes(device.DeviceID)
              ? { ...device, isLoading: true }
              : device
          ),
        }));

        try {
          await Promise.all(
            targetDevices.map(async (device) => {
              try {
                const response = await deviceService.stopScreenMirroring(device.DeviceID);

                if (response.Code === 0) {
                  get().updateBatchScreenDevice(device.DeviceID, {
                    ScreenUrl: null,
                    isLoading: false,
                    status: 'paused',
                    error: null,
                  });
                } else {
                  get().updateBatchScreenDevice(device.DeviceID, {
                    status: 'error',
                    error: response.Message || '暂停失败',
                  });
                }
              } catch (error) {
                console.error('Failed to pause screen mirroring:', error);
                get().updateBatchScreenDevice(device.DeviceID, {
                  status: 'error',
                  error: '暂停失败',
                });
              }
            })
          );
        } finally {
          set({ isBatchScreenMirroringBusy: false });
        }
      },

      // Resume batch screen mirroring
      resumeBatchScreenMirroring: async (deviceIds) => {
        const { batchScreenMirroringDevices } = get();
        const targetDevices = batchScreenMirroringDevices.filter((device) => {
          const inScope = !deviceIds || deviceIds.includes(device.DeviceID);
          return inScope && device.DeviceID && device.status === 'paused';
        });

        if (targetDevices.length === 0) {
          return;
        }

        const targetIds = targetDevices.map((device) => device.DeviceID);

        set((state) => ({
          isBatchScreenMirroringBusy: true,
          batchScreenMirroringDevices: state.batchScreenMirroringDevices.map((device) =>
            targetIds.includes(device.DeviceID)
              ? { ...device, isLoading: true, status: 'connecting', error: null }
              : device
          ),
        }));

        try {
          await Promise.all(
            targetDevices.map(async (device) => {
              try {
                const response = await deviceService.startScreenMirroring(device.DeviceID);

                if (response.Code === 0 && response.Result) {
                  let url: string = response.Result;
                  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                    url = `http://${url}`;
                  }

                  get().updateBatchScreenDevice(device.DeviceID, {
                    ScreenUrl: url,
                    isLoading: false,
                    status: 'playing',
                    error: null,
                  });
                } else {
                  get().updateBatchScreenDevice(device.DeviceID, {
                    isLoading: false,
                    status: 'error',
                    error: response.Message || '恢复失败',
                  });
                }
              } catch (error) {
                console.error('Failed to resume screen mirroring:', error);
                get().updateBatchScreenDevice(device.DeviceID, {
                  isLoading: false,
                  status: 'error',
                  error: '恢复失败',
                });
              }
            })
          );
        } finally {
          set({ isBatchScreenMirroringBusy: false });
        }
      },

      // Stop batch screen mirroring
      stopBatchScreenMirroring: async (deviceIds) => {
        const { batchScreenMirroringDevices } = get();
        const targetDevices = batchScreenMirroringDevices.filter((device) => {
          return !deviceIds || deviceIds.includes(device.DeviceID);
        });

        if (targetDevices.length === 0) {
          set({ batchScreenMirroringDevices: [] });
          return;
        }

        const targetIds = targetDevices.map((device) => device.DeviceID);

        set((state) => ({
          isBatchScreenMirroringBusy: true,
          batchScreenMirroringDevices: state.batchScreenMirroringDevices.map((device) =>
            targetIds.includes(device.DeviceID)
              ? { ...device, isLoading: true }
              : device
          ),
        }));

        try {
          const results = await Promise.all(
            targetDevices.map(async (device) => {
              if (!device.DeviceID) {
                return { id: device.DeviceID, success: true };
              }

              try {
                const response = await deviceService.stopScreenMirroring(device.DeviceID);

                if (response.Code === 0) {
                  return { id: device.DeviceID, success: true };
                }

                return {
                  id: device.DeviceID,
                  success: false,
                  message: response.Message || '关闭失败',
                };
              } catch (error) {
                console.error('Failed to stop screen mirroring:', error);
                return { id: device.DeviceID, success: false, message: '关闭失败' };
              }
            })
          );

          const failedIds = results
            .filter((result) => !result.success && result.id)
            .map((result) => result.id as string);

          if (failedIds.length > 0) {
            set((state) => ({
              batchScreenMirroringDevices: state.batchScreenMirroringDevices.map((device) =>
                failedIds.includes(device.DeviceID)
                  ? {
                      ...device,
                      isLoading: false,
                      status: 'error',
                      error:
                        results.find((result) => result.id === device.DeviceID)?.message ||
                        '关闭失败',
                    }
                  : device
              ),
            }));
          } else {
            set((state) => ({
              batchScreenMirroringDevices: state.batchScreenMirroringDevices.filter(
                (device) => !targetIds.includes(device.DeviceID)
              ),
            }));
          }
        } finally {
          set({ isBatchScreenMirroringBusy: false });
        }
      },

      // Update batch screen device status
      updateBatchScreenDevice: (deviceId, updates) => {
        set((state) => ({
          batchScreenMirroringDevices: state.batchScreenMirroringDevices.map((device) =>
            device.DeviceID === deviceId
              ? { ...device, ...updates }
              : device
          ),
        }));
      },
    }),
    {
      name: 'device-store',
    }
  )
);
