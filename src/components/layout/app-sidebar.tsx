'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePermission } from '@/hooks/use-permission';
import { useAuthStore } from '@/stores/auth.store';
import { NavItem } from '@/types';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { hasModule, hasInterface, hasAnyModule, hasAnyInterface, isInitialized } = usePermission();
  const { checkIsSuperAdmin } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  // 检查导航项是否有权限
  const hasPermissionForItem = React.useCallback(
    (item: NavItem): boolean => {
      // 优先检查：如果是超级管理员 (admin)，拥有所有权限
      // admin 用户无需加载后端权限，直接显示所有菜单
      const isSuperAdmin = checkIsSuperAdmin();
      if (isSuperAdmin) {
        return true;
      }

      // 普通用户：如果权限系统还未初始化，等待加载
      if (!isInitialized) {
        return false; // 修改为 false，等待权限加载完成
      }

      // 如果没有指定权限要求，直接通过
      if (!item.moduleCode && !item.interfacePath) {
        return true;
      }

      // 检查模块权限
      if (item.moduleCode) {
        if (Array.isArray(item.moduleCode)) {
          if (!hasAnyModule(item.moduleCode)) {
            return false;
          }
        } else {
          if (!hasModule(item.moduleCode)) {
            return false;
          }
        }
      }

      // 检查接口权限
      if (item.interfacePath) {
        if (Array.isArray(item.interfacePath)) {
          if (!hasAnyInterface(item.interfacePath)) {
            return false;
          }
        } else {
          if (!hasInterface(item.interfacePath)) {
            return false;
          }
        }
      }

      return true;
    },
    [hasModule, hasInterface, hasAnyModule, hasAnyInterface, isInitialized, checkIsSuperAdmin]
  );

  // 过滤导航项，只显示有权限的项目
  const filteredNavItems = React.useMemo(() => {
    // 避免 hydration 错误：在客户端挂载前显示所有菜单
    if (!isMounted) {
      return navItems;
    }

    return navItems
      .map((item) => {
        // 如果有子项，过滤子项
        if (item.items && item.items.length > 0) {
          const filteredChildren = item.items.filter(hasPermissionForItem);
          // 如果所有子项都被过滤掉了，隐藏父项
          if (filteredChildren.length === 0) {
            return null;
          }
          return { ...item, items: filteredChildren };
        }
        // 检查当前项的权限
        return hasPermissionForItem(item) ? item : null;
      })
      .filter((item): item is NavItem => item !== null);
  }, [hasPermissionForItem, isMounted]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
