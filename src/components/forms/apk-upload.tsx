'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  formatFileSize,
  validateAPKFile,
  uploadToOSS
} from '@/services/ali-oss.service';
import {
  IconCheck,
  IconFileTypography,
  IconTrash,
  IconUpload,
  IconX
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface ApkUploadProps {
  /** 上传完成回调 */
  onUploadComplete?: (url: string, fileName: string) => void;
  /** 上传失败回调 */
  onUploadError?: (error: string) => void;
  /** 禁用状态 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  url: string | null;
  error: string | null;
}

export function ApkUpload({
  onUploadComplete,
  onUploadError,
  disabled = false,
  className
}: ApkUploadProps) {
  const [state, setState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    url: null,
    error: null
  });

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(
    (file: File) => {
      // 验证文件
      const validation = validateAPKFile(file);
      if (!validation.valid) {
        setState((prev) => ({ ...prev, error: validation.message || null }));
        toast.error(validation.message);
        onUploadError?.(validation.message || '文件验证失败');
        return;
      }

      // 设置文件并开始上传
      setState({
        file,
        uploading: true,
        progress: 0,
        url: null,
        error: null
      });

      // 异步上传
      uploadToOSS({
        file,
        onProgress: (progress) => {
          setState((prev) => ({ ...prev, progress }));
        }
      })
        .then((result) => {
          setState((prev) => ({
            ...prev,
            uploading: false,
            progress: 100,
            url: result.url
          }));
          toast.success(
            `上传成功！用时 ${(result.duration / 1000).toFixed(1)}秒`
          );
          onUploadComplete?.(result.url, result.name);
        })
        .catch((error) => {
          const errorMessage =
            error instanceof Error ? error.message : '上传失败';
          setState((prev) => ({
            ...prev,
            uploading: false,
            error: errorMessage
          }));
          toast.error(errorMessage);
          onUploadError?.(errorMessage);
        });
    },
    [onUploadComplete, onUploadError]
  );

  /**
   * 处理文件输入变化
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 清空 input 值，允许重复选择同一文件
    event.target.value = '';
  };

  /**
   * 处理拖拽上传
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || state.uploading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * 阻止默认拖拽行为
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * 移除文件
   */
  const handleRemove = () => {
    setState({
      file: null,
      uploading: false,
      progress: 0,
      url: null,
      error: null
    });
  };

  const { file, uploading, progress, url, error } = state;
  const hasFile = file !== null;
  const uploadComplete = url !== null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 上传区域 */}
      {!hasFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-primary hover:bg-accent/50 cursor-pointer',
            error ? 'border-destructive' : 'border-muted-foreground/25'
          )}
        >
          <input
            type='file'
            accept='.apk,application/vnd.android.package-archive'
            onChange={handleInputChange}
            disabled={disabled}
            className='absolute inset-0 cursor-pointer opacity-0'
          />

          <IconUpload className='text-muted-foreground mb-4 h-12 w-12' />

          <div className='text-center'>
            <p className='mb-1 text-sm font-medium'>点击或拖拽上传APK文件</p>
            <p className='text-muted-foreground text-xs'>
              支持 .apk 格式，最大 500MB
            </p>
          </div>
        </div>
      )}

      {/* 文件信息和进度 */}
      {hasFile && (
        <div className='space-y-3 rounded-lg border p-4'>
          {/* 文件信息行 */}
          <div className='flex items-start justify-between gap-3'>
            <div className='flex min-w-0 flex-1 items-start gap-3'>
              <IconFileTypography className='text-primary mt-0.5 h-5 w-5 flex-shrink-0' />

              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{file.name}</p>
                <p className='text-muted-foreground text-xs'>
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            {/* 状态图标 */}
            <div className='flex items-center gap-2'>
              {uploadComplete && (
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
                  <IconCheck className='h-4 w-4 text-green-600 dark:text-green-400' />
                </div>
              )}

              {error && (
                <div className='bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-full'>
                  <IconX className='text-destructive h-4 w-4' />
                </div>
              )}

              {!uploading && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleRemove}
                  disabled={disabled}
                  className='h-8 w-8'
                >
                  <IconTrash className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>

          {/* 上传进度 */}
          {uploading && (
            <div className='space-y-2'>
              <Progress value={progress} className='h-2' />
              <p className='text-muted-foreground text-center text-xs'>
                上传中... {progress}%
              </p>
            </div>
          )}

          {/* 上传完成 */}
          {uploadComplete && (
            <div className='rounded bg-green-50 px-3 py-2 dark:bg-green-900/20'>
              <p className='text-xs text-green-700 dark:text-green-400'>
                上传成功！文件已保存到云端
              </p>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className='bg-destructive/10 rounded px-3 py-2'>
              <p className='text-destructive text-xs'>{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
