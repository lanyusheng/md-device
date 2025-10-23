import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DeviceGroup, GroupSearchRequest, PageObject } from '@/types/api';
import { groupService } from '@/services/group.service';

interface GroupState {
  // 数据状态
  groups: DeviceGroup[];
  selectedGroup: DeviceGroup | null;
  totalGroups: number;

  // 分页状态
  pageInfo: PageObject;

  // UI 状态
  isLoading: boolean;
  isDrawerOpen: boolean;
  drawerMode: 'create' | 'edit';

  // 搜索状态
  searchKeyword: string;
}

interface GroupActions {
  // 数据操作
  fetchGroups: (request?: Partial<GroupSearchRequest>) => Promise<void>;
  createGroup: (groupName: string) => Promise<void>;
  updateGroup: (groupId: number, groupName: string) => Promise<void>;
  deleteGroup: (groupId: number) => Promise<void>;

  // UI 操作
  setSelectedGroup: (group: DeviceGroup | null) => void;
  openDrawer: (mode: 'create' | 'edit', group?: DeviceGroup) => void;
  closeDrawer: () => void;

  // 搜索和分页
  setSearchKeyword: (keyword: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // 工具方法
  refreshGroups: () => Promise<void>;
}

type GroupStore = GroupState & GroupActions;

export const useGroupStore = create<GroupStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      groups: [],
      selectedGroup: null,
      totalGroups: 0,
      pageInfo: {
        PageIndex: 1,
        PageSize: 10000, // 一次性取完所有分组
        PageCount: 0,
        RecordCount: 0,
        AskSummary: true,
      },
      isLoading: false,
      isDrawerOpen: false,
      drawerMode: 'create',
      searchKeyword: '',

      // 获取分组列表
      fetchGroups: async (request) => {
        set({ isLoading: true });
        try {
          const { pageInfo, searchKeyword } = get();
          const searchRequest: GroupSearchRequest = {
            KeyWord: request?.KeyWord ?? searchKeyword,
            PageObject: request?.PageObject ?? pageInfo,
          };

          const response = await groupService.getDeviceGroupList(searchRequest);

          // Code === 0 表示成功
          if (response.Code === 0 && response.Result) {
            set({
              groups: response.Result.ResultList || [],
              totalGroups: response.Result.RecordCount || 0,
              pageInfo: {
                PageIndex: response.Result.PageIndex || 1,
                PageSize: response.Result.PageSize || 10000,
                PageCount: response.Result.PageCount || 0,
                RecordCount: response.Result.RecordCount || 0,
                AskSummary: true,
              },
            });
          }
        } catch (error) {
          console.error('Failed to fetch groups:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // 创建分组
      createGroup: async (groupName) => {
        set({ isLoading: true });
        try {
          await groupService.addDeviceGroup({ GroupName: groupName });
          await get().refreshGroups();
          get().closeDrawer();
        } catch (error) {
          console.error('Failed to create group:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 更新分组
      updateGroup: async (groupId, groupName) => {
        set({ isLoading: true });
        try {
          await groupService.updateDeviceGroup({
            GroupID: groupId,
            GroupName: groupName,
          });
          await get().refreshGroups();
          get().closeDrawer();
        } catch (error) {
          console.error('Failed to update group:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 删除分组
      deleteGroup: async (groupId) => {
        set({ isLoading: true });
        try {
          await groupService.deleteDeviceGroup({ GroupID: groupId });
          await get().refreshGroups();
          // 如果删除的是当前选中的分组，清除选中状态
          const { selectedGroup } = get();
          if (selectedGroup?.GroupID === groupId) {
            set({ selectedGroup: null });
          }
        } catch (error) {
          console.error('Failed to delete group:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 设置选中的分组
      setSelectedGroup: (group) => {
        set({ selectedGroup: group });
      },

      // 打开抽屉
      openDrawer: (mode, group) => {
        set({
          isDrawerOpen: true,
          drawerMode: mode,
          selectedGroup: group || null,
        });
      },

      // 关闭抽屉
      closeDrawer: () => {
        set({
          isDrawerOpen: false,
          selectedGroup: null,
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
        get().fetchGroups();
      },

      // 设置每页数量
      setPageSize: (pageSize) => {
        set((state) => ({
          pageInfo: { ...state.pageInfo, PageSize: pageSize, PageIndex: 1 },
        }));
        get().fetchGroups();
      },

      // 刷新分组列表
      refreshGroups: async () => {
        await get().fetchGroups();
      },
    }),
    {
      name: 'group-store',
    }
  )
);
