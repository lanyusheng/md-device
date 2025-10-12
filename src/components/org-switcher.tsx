'use client';

import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IconLogout } from '@tabler/icons-react';
import { toast } from 'sonner';

export function OrgSwitcher() {
  async function handleSignOut() {
    try {
      const { authService } = await import('@/services/auth.service');
      authService.logout();
      toast.success('已退出登录');
    } catch (error) {
      toast.error('退出登录失败');
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='bg-primary text-primary-foreground h-8 w-8'>
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className='flex flex-col gap-0.5 leading-none'>
                <span className='font-semibold'>Admin</span>
                <span className='text-muted-foreground text-xs'>
                  admin@example.com
                </span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='start' sideOffset={10}>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm leading-none font-medium'>Admin</p>
                <p className='text-muted-foreground text-xs leading-none'>
                  admin@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout className='mr-2 h-4 w-4' />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
