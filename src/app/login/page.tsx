'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, TrendingUp, FolderKanban, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      // 动态导入 authService 以避免 SSR 问题
      const { authService } = await import('@/services/auth.service');

      const response = await authService.login({
        username,
        password
      });

      // Code === 0 表示成功
      if (response.Code === 0) {
        toast.success('登录成功');
        router.push('/dashboard');
        router.refresh();
      } else {
        // 非 0 时，Result 字段是错误提示
        const errorMsg =
          typeof response.Result === 'string'
            ? response.Result
            : response.Message || '用户名或密码错误';
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '登录失败，请重试';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen'>
      {/* Left Side - Illustration (Desktop Only) */}
      <div className='bg-muted relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2'>
        {/* Decorative Background Elements */}
        <div className='from-primary/20 via-primary/10 to-background absolute inset-0 bg-gradient-to-br'>
          <div className='bg-primary/5 absolute top-20 left-20 h-32 w-32 rounded-full blur-3xl'></div>
          <div className='bg-primary/5 absolute right-20 bottom-40 h-40 w-40 rounded-full blur-3xl'></div>
          <div className='bg-primary/10 absolute top-1/2 left-1/4 h-24 w-24 rounded-full blur-2xl'></div>
        </div>

        {/* Main Illustration Area */}
        <div className='relative z-10 flex flex-col items-center justify-center space-y-8 px-12'>
          {/* Character Illustration Placeholder */}
          <div className='relative'>
            <div className='bg-card/50 border-border flex h-64 w-64 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm'>
              <div className='text-8xl'>👤</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='flex gap-6'>
            <div className='bg-card/80 border-border rounded-xl border p-4 shadow-lg backdrop-blur-sm'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                  <TrendingUp className='text-primary h-5 w-5' />
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Total Users</p>
                  <p className='text-foreground text-lg font-bold'>2,856</p>
                  <p className='text-chart-2 text-xs'>↑ 12.5%</p>
                </div>
              </div>
            </div>
            <div className='bg-card/80 border-border rounded-xl border p-4 shadow-lg backdrop-blur-sm'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                  <FolderKanban className='text-primary h-5 w-5' />
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Projects</p>
                  <p className='text-foreground text-lg font-bold'>862</p>
                  <p className='text-muted-foreground text-xs'>Yearly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Chart */}
          <div className='bg-card/80 border-border rounded-xl border p-6 shadow-lg backdrop-blur-sm'>
            <div className='mb-3 flex items-center gap-2'>
              <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                <BarChart3 className='text-primary h-5 w-5' />
              </div>
              <div>
                <p className='text-foreground text-xl font-semibold'>$86.4k</p>
                <p className='text-muted-foreground text-xs'>Total Profit</p>
              </div>
            </div>
            <div className='flex h-20 items-end justify-center gap-2'>
              <div
                className='bg-chart-2 w-3 rounded-t'
                style={{ height: '40%' }}
              ></div>
              <div
                className='bg-chart-2 w-3 rounded-t'
                style={{ height: '60%' }}
              ></div>
              <div
                className='bg-chart-2 w-3 rounded-t'
                style={{ height: '45%' }}
              ></div>
              <div
                className='bg-chart-2 w-3 rounded-t'
                style={{ height: '80%' }}
              ></div>
              <div
                className='bg-chart-2 w-3 rounded-t'
                style={{ height: '100%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className='absolute bottom-0 left-0 h-24 w-24 opacity-20'>
          <div className='h-full w-full'>
            <div className='bg-primary h-16 w-16 rounded-tr-full'></div>
            <div className='bg-primary/60 -mt-12 h-12 w-12 rounded-tr-full'></div>
            <div className='bg-primary/30 -mt-8 h-8 w-8 rounded-tr-full'></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className='bg-background flex flex-1 items-center justify-center px-4 py-8 lg:px-8'>
        <div className='w-full max-w-md space-y-6'>
          {/* Logo */}
          <div className='flex items-center gap-2'>
            <div className='bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg text-xl font-bold'>
              S
            </div>
            <span className='text-foreground text-2xl font-bold'>
              云机平台
            </span>
          </div>

          {/* Welcome Text */}
          <div className='space-y-2'>
            <h1 className='text-foreground text-3xl font-bold lg:text-4xl'>
              欢迎回来! 👋
            </h1>
            <p className='text-muted-foreground'>请登录您的账户开始使用系统</p>
          </div>

          {/* Login Hint */}
          <div className='bg-muted border-border rounded-lg border p-4'>
            <p className='text-muted-foreground text-sm'>
              请使用您的账号密码登录系统
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username' className='text-sm font-medium'>
                用户名
              </Label>
              <Input
                id='username'
                name='username'
                type='text'
                placeholder='admin'
                defaultValue='admin'
                required
                autoComplete='username'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                密码
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  defaultValue='111111'
                  required
                  autoComplete='current-password'
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='remember'
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <label
                  htmlFor='remember'
                  className='cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  记住我
                </label>
              </div>
              {/* <a
                href='#'
                className='text-primary text-sm font-medium hover:underline'
              >
                忘记密码?
              </a> */}
            </div>

            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          {/* Create Account Link */}
          {/* <div className='text-center'>
            <span className='text-muted-foreground text-sm'>还没有账户? </span>
            <a
              href='#'
              className='text-primary text-sm font-medium hover:underline'
            >
              立即注册
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}
