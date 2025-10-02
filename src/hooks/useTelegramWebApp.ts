'use client';

import { useEffect, useState } from 'react';
import { TelegramWebApp } from '@/types/telegram';

interface UseTelegramWebAppReturn {
  webApp: TelegramWebApp | null;
  isLoaded: boolean;
  isInTelegram: boolean;
}

/**
 * 用于处理 Telegram Web App 集成的自定义钩子
 */
export function useTelegramWebApp(): UseTelegramWebAppReturn {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 检查是否已经有 Telegram Web App 脚本
    const checkTelegramWebApp = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        setWebApp(tg);
        setIsInTelegram(true);
        setIsLoaded(true);

        // 初始化 Telegram Web App
        tg.ready();

        // 设置应用展开
        tg.expand();

        // 设置主题
        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        }

        return true;
      }
      return false;
    };

    // 立即检查一次
    if (checkTelegramWebApp()) return;

    // 动态加载 Telegram Web App 脚本
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;

    script.onload = () => {
      // 脚本加载完成后再次检查
      setTimeout(() => {
        if (checkTelegramWebApp()) {
          console.log('Telegram Web App 初始化成功');
        } else {
          console.log('不在 Telegram Web App 环境中');
          setIsLoaded(true);
        }
      }, 100);
    };

    script.onerror = () => {
      console.error('Telegram Web App 脚本加载失败');
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    // 清理函数
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return {
    webApp,
    isLoaded,
    isInTelegram
  };
}

/**
 * 检查当前是否在 Telegram 环境中运行
 */
export function isTelegramEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // 检查 User Agent
  const userAgent = window.navigator.userAgent || '';
  const isTelegramUserAgent = userAgent.includes('Telegram');

  // 检查是否有 Telegram Web App 对象
  const hasTelegramWebApp = !!window.Telegram?.WebApp;

  return isTelegramUserAgent || hasTelegramWebApp;
}

/**
 * 获取 Telegram 用户信息
 */
export function getTelegramUser() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return null;
  }

  const webApp = window.Telegram.WebApp;
  return webApp.initDataUnsafe?.user || null;
}

/**
 * 显示 Telegram 主按钮
 */
export function showTelegramMainButton(
  text: string,
  onClick: () => void
) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return null;
  }

  const webApp = window.Telegram.WebApp;
  const mainButton = webApp.MainButton;

  mainButton.setText(text);
  mainButton.onClick(onClick);
  mainButton.show();

  return () => {
    mainButton.offClick(onClick);
    mainButton.hide();
  };
}

/**
 * 显示 Telegram 返回按钮
 */
export function showTelegramBackButton(onClick: () => void) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return null;
  }

  const webApp = window.Telegram.WebApp;
  const backButton = webApp.BackButton;

  backButton.onClick(onClick);
  backButton.show();

  return () => {
    backButton.offClick(onClick);
    backButton.hide();
  };
}

/**
 * 触发 Telegram 触觉反馈
 */
export function triggerTelegramHaptic(
  type: 'impact' | 'notification' | 'selection',
  style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'
) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return;
  }

  const haptic = window.Telegram.WebApp.HapticFeedback;

  switch (type) {
    case 'impact':
      haptic.impactOccurred(style as any || 'medium');
      break;
    case 'notification':
      haptic.notificationOccurred(style as any || 'success');
      break;
    case 'selection':
      haptic.selectionChanged();
      break;
  }
}

/**
 * 关闭 Telegram Web App
 */
export function closeTelegramWebApp() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return;
  }

  window.Telegram.WebApp.close();
}