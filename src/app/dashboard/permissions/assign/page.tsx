'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { usePermissionStore } from '@/features/permissions/store/permission.store';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';

export default function PermissionAssignPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleId = searchParams.get('roleId');
  const roleName = searchParams.get('roleName');

  const {
    allModules,
    allInterfaces,
    selectedModuleIds,
    selectedInterfaceIds,
    isLoading,
    fetchAllModules,
    fetchAllInterfaces,
    fetchRolePermissions,
    toggleModule,
    toggleInterface,
    selectAllModules,
    clearAllModules,
    selectAllInterfaces,
    clearAllInterfaces,
    savePermissions
  } = usePermissionStore();

  useEffect(() => {
    fetchAllModules();
    fetchAllInterfaces();

    if (roleId) {
      fetchRolePermissions(Number(roleId));
    }
  }, [roleId, fetchAllModules, fetchAllInterfaces, fetchRolePermissions]);

  // 按模块分组接口
  const interfacesByModule = useMemo(() => {
    const groups: Record<string, typeof allInterfaces> = {};

    allInterfaces.forEach((iface) => {
      if (!groups[iface.ModuleID]) {
        groups[iface.ModuleID] = [];
      }
      groups[iface.ModuleID].push(iface);
    });

    return groups;
  }, [allInterfaces]);

  const handleSave = async () => {
    if (!roleId) return;

    try {
      await savePermissions(Number(roleId));
      router.push('/dashboard/roles');
    } catch (error) {
      // Error handled in store
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/roles');
  };

  if (!roleId) {
    return (
      <PageContainer>
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-muted-foreground">请选择角色</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={`权限分配 - ${roleName || '角色'}`}
            description="为角色分配模块和接口权限"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <IconX className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <IconCheck className="mr-2 h-4 w-4" />
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
        <Separator />

        <div className="grid flex-1 gap-4 md:grid-cols-2">
          {/* 模块权限 */}
          <Card>
            <CardHeader>
              <CardTitle>模块权限</CardTitle>
              <CardDescription>
                选择该角色可以访问的模块
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllModules}
                  >
                    全选
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllModules}
                  >
                    清空
                  </Button>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {allModules.map((module) => (
                    <div
                      key={module.ModuleID}
                      className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent"
                    >
                      <Checkbox
                        id={`module-${module.ModuleID}`}
                        checked={selectedModuleIds.includes(module.ModuleID)}
                        onCheckedChange={() => toggleModule(module.ModuleID)}
                      />
                      <label
                        htmlFor={`module-${module.ModuleID}`}
                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div>{module.ModuleName}</div>
                        {module.Description && (
                          <div className="text-xs text-muted-foreground">
                            {module.Description}
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 接口权限 */}
          <Card>
            <CardHeader>
              <CardTitle>接口权限</CardTitle>
              <CardDescription>
                选择该角色可以调用的接口
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllInterfaces}
                  >
                    全选
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllInterfaces}
                  >
                    清空
                  </Button>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {Object.entries(interfacesByModule).map(
                    ([moduleId, interfaces]) => {
                      const module = allModules.find(
                        (m) => m.ModuleID === moduleId
                      );
                      return (
                        <div key={moduleId} className="space-y-2">
                          <h4 className="font-semibold text-sm">
                            {module?.ModuleName || moduleId}
                          </h4>
                          <div className="space-y-1">
                            {interfaces.map((iface) => (
                              <div
                                key={iface.InterfaceID}
                                className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent"
                              >
                                <Checkbox
                                  id={`interface-${iface.InterfaceID}`}
                                  checked={selectedInterfaceIds.includes(
                                    iface.InterfaceID
                                  )}
                                  onCheckedChange={() =>
                                    toggleInterface(iface.InterfaceID)
                                  }
                                />
                                <label
                                  htmlFor={`interface-${iface.InterfaceID}`}
                                  className="flex-1 cursor-pointer text-xs leading-none"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-mono">
                                      {iface.InterfaceMethod}
                                    </span>
                                    <span>{iface.InterfaceName}</span>
                                  </div>
                                  <div className="mt-1 text-[10px] text-muted-foreground font-mono">
                                    {iface.InterfaceUrl}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
