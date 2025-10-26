'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconLoader2, IconTerminal2, IconRotate } from '@tabler/icons-react';

interface ShellControlToolbarProps {
  total: number;
  idleCount: number;
  executingCount: number;
  successCount: number;
  errorCount: number;
  isBusy?: boolean;
  onExecute: (command: string) => Promise<void> | void;
  onClear: () => Promise<void> | void;
}

export function ShellControlToolbar({
  total,
  idleCount,
  executingCount,
  successCount,
  errorCount,
  isBusy = false,
  onExecute,
  onClear,
}: ShellControlToolbarProps) {
  const [command, setCommand] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!command.trim()) return;

    setIsExecuting(true);
    try {
      await Promise.resolve(onExecute(command));
    } catch (error) {
      console.error('[shell-control-toolbar] execute failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClear = async () => {
    setIsExecuting(true);
    try {
      await Promise.resolve(onClear());
      setCommand('');
    } catch (error) {
      console.error('[shell-control-toolbar] clear failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const isGlobalBusy = isBusy || isExecuting;

  return (
    <div className='flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm'>
      {/* 命令输入区域 */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center'>
        <div className='flex-1'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <IconTerminal2 className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='输入Shell命令... (例如: ls -la, getprop ro.product.model)'
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGlobalBusy}
                className='pl-10 font-mono'
              />
            </div>
            <Button
              variant='default'
              onClick={handleExecute}
              disabled={isGlobalBusy || !command.trim()}
              className='gap-2 min-w-[100px]'
            >
              {isExecuting ? (
                <>
                  <IconLoader2 className='h-4 w-4 animate-spin' />
                  执行中
                </>
              ) : (
                <>
                  <IconTerminal2 className='h-4 w-4' />
                  执行命令
                </>
              )}
            </Button>
            <Button
              variant='outline'
              onClick={handleClear}
              disabled={isGlobalBusy}
              className='gap-2'
              title='清空所有输出'
            >
              <IconRotate className='h-4 w-4' />
              清空
            </Button>
          </div>
        </div>
      </div>

      {/* 状态统计 */}
      <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-t pt-3'>
        <span className='font-medium text-foreground'>执行状态</span>
        <Badge variant='secondary'>总计 {total}</Badge>
        <Badge variant='outline'>就绪 {idleCount}</Badge>
        <Badge variant='default'>执行中 {executingCount}</Badge>
        <Badge variant='outline'>成功 {successCount}</Badge>
        <Badge variant='destructive'>错误 {errorCount}</Badge>
      </div>

      {/* 提示信息 */}
      {command.trim() && (
        <div className='rounded-md bg-blue-50 p-2 dark:bg-blue-900/20'>
          <p className='text-xs text-blue-700 dark:text-blue-400'>
            <strong>提示：</strong>
            按回车键或点击"执行命令"按钮，将在 {total} 台设备上执行{' '}
            <code className='rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-800'>
              {command.trim().substring(0, 60)}
              {command.trim().length > 60 ? '...' : ''}
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
