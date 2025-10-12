'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UserNav() {
  const router = useRouter();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='relative flex h-10 items-center gap-2 rounded-lg px-3'
        >
          <Avatar className='h-8 w-8'>
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className='hidden flex-col items-start text-left md:flex'>
            <span className='text-sm font-medium'>Admin</span>
            <span className='text-muted-foreground text-xs'>
              admin@example.com
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56'
        align='end'
        sideOffset={10}
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>Admin</p>
            <p className='text-muted-foreground text-xs leading-none'>
              admin@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
            个人资料
          </DropdownMenuItem>
          <DropdownMenuItem>账单</DropdownMenuItem>
          <DropdownMenuItem>设置</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>退出登录</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
