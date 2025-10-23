'use client';

import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconLoader2, IconPlayerPause, IconPlayerPlay, IconSquareX } from '@tabler/icons-react';

type ActionType = 'pause' | 'resume' | 'stop';

interface ScreenControlToolbarProps {
  total: number;
  playingCount: number;
  pausedCount: number;
  connectingCount: number;
  errorCount: number;
  isBusy?: boolean;
  onPauseAll: () => Promise<void> | void;
  onResumeAll: () => Promise<void> | void;
  onStopAll: () => Promise<void> | void;
}

export function ScreenControlToolbar({
  total,
  playingCount,
  pausedCount,
  connectingCount,
  errorCount,
  isBusy = false,
  onPauseAll,
  onResumeAll,
  onStopAll,
}: ScreenControlToolbarProps) {
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  const runAction = useCallback(
    async (action: ActionType, callback: () => Promise<void> | void) => {
      setPendingAction(action);
      try {
        await Promise.resolve(callback());
      } catch (error) {
        console.error('[screen-control-toolbar] action failed:', error);
      } finally {
        setPendingAction(null);
      }
    },
    []
  );

  const isGlobalBusy = isBusy || pendingAction !== null;

  const withSpinner = (action: ActionType) =>
    isBusy || pendingAction === action;

  return (
    <div className='flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
        <span className='font-medium text-foreground'>投屏状态</span>
        <Badge variant='secondary'>总计 {total}</Badge>
        <Badge variant='outline'>播放中 {playingCount}</Badge>
        <Badge variant='outline'>已暂停 {pausedCount}</Badge>
        <Badge variant='outline'>连接中 {connectingCount}</Badge>
        <Badge variant='destructive'>错误 {errorCount}</Badge>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={isGlobalBusy || playingCount === 0}
          onClick={() => runAction('pause', onPauseAll)}
          className='gap-2'
        >
          {withSpinner('pause') ? (
            <IconLoader2 className='h-4 w-4 animate-spin' />
          ) : (
            <IconPlayerPause className='h-4 w-4' />
          )}
          暂停全部
        </Button>
        <Button
          variant='default'
          size='sm'
          disabled={isGlobalBusy || pausedCount === 0}
          onClick={() => runAction('resume', onResumeAll)}
          className='gap-2'
        >
          {withSpinner('resume') ? (
            <IconLoader2 className='h-4 w-4 animate-spin' />
          ) : (
            <IconPlayerPlay className='h-4 w-4' />
          )}
          恢复全部
        </Button>
        <Button
          variant='destructive'
          size='sm'
          disabled={isGlobalBusy || total === 0}
          onClick={() => runAction('stop', onStopAll)}
          className='gap-2'
        >
          {withSpinner('stop') ? (
            <IconLoader2 className='h-4 w-4 animate-spin' />
          ) : (
            <IconSquareX className='h-4 w-4' />
          )}
          关闭全部
        </Button>
      </div>
    </div>
  );
}

