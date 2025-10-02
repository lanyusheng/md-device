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
        password,
      });

      // Code === 0 表示成功
      if (response.Code === 0) {
        toast.success('登录成功');
        router.push('/dashboard');
        router.refresh();
      } else {
        // 非 0 时，Result 字段是错误提示
        toast.error(response.Result || response.Message || '用户名或密码错误');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请重试';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Illustration (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-muted items-center justify-center overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
        </div>

        {/* Main Illustration Area */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-12">
          {/* Character Illustration Placeholder */}
          <div className="relative">
            <div className="w-64 h-64 bg-card/50 backdrop-blur-sm rounded-full border border-border shadow-lg flex items-center justify-center">
              <div className="text-8xl">👤</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-6">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Users</p>
                  <p className="text-foreground font-bold text-lg">2,856</p>
                  <p className="text-chart-2 text-xs">↑ 12.5%</p>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Projects</p>
                  <p className="text-foreground font-bold text-lg">862</p>
                  <p className="text-muted-foreground text-xs">Yearly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Chart */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-semibold text-xl">$86.4k</p>
                <p className="text-muted-foreground text-xs">Total Profit</p>
              </div>
            </div>
            <div className="flex items-end justify-center gap-2 h-20">
              <div className="w-3 bg-chart-2 rounded-t" style={{ height: '40%' }}></div>
              <div className="w-3 bg-chart-2 rounded-t" style={{ height: '60%' }}></div>
              <div className="w-3 bg-chart-2 rounded-t" style={{ height: '45%' }}></div>
              <div className="w-3 bg-chart-2 rounded-t" style={{ height: '80%' }}></div>
              <div className="w-3 bg-chart-2 rounded-t" style={{ height: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-20">
          <div className="w-full h-full">
            <div className="w-16 h-16 bg-primary rounded-tr-full"></div>
            <div className="w-12 h-12 bg-primary/60 rounded-tr-full -mt-12"></div>
            <div className="w-8 h-8 bg-primary/30 rounded-tr-full -mt-8"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-4 py-8 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              S
            </div>
            <span className="text-2xl font-bold text-foreground">Shadcn Dashboard</span>
          </div>

          {/* Welcome Text */}
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              欢迎回来! 👋
            </h1>
            <p className="text-muted-foreground">
              请登录您的账户开始使用系统
            </p>
          </div>

          {/* Login Hint */}
          <div className="bg-muted border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              请使用您的账号密码登录系统
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                用户名
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="admin"
                defaultValue="admin"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                密码
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  defaultValue="111111"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  记住我
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-primary hover:underline font-medium"
              >
                忘记密码?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          {/* Create Account Link */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              还没有账户?{' '}
            </span>
            <a
              href="#"
              className="text-sm text-primary hover:underline font-medium"
            >
              立即注册
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
