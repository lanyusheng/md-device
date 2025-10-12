/**
 * 阿里云OSS上传服务
 * 使用浏览器原生API直接上传文件到阿里云OSS
 */

import type { OSSConfig, OSSUploadParams, OSSUploadResult } from '@/types/api';

/**
 * 获取OSS配置
 */
function getOSSConfig(): OSSConfig {
  const region = process.env.NEXT_PUBLIC_OSS_REGION;
  const accessKeyId = process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET;
  const bucket = process.env.NEXT_PUBLIC_OSS_BUCKET;
  const endpoint = process.env.NEXT_PUBLIC_OSS_ENDPOINT;

  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    throw new Error('OSS配置缺失，请检查环境变量');
  }

  return {
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
    endpoint
  };
}

/**
 * 生成随机文件名（保留原始扩展名）
 */
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  return `apk/${timestamp}-${random}${ext}`;
}

/**
 * 计算文件的MD5哈希（用于Content-MD5）
 * 注意：此函数暂未使用，但保留以备将来需要
 */
// async function calculateMD5(file: File): Promise<string> {
//   const arrayBuffer = await file.arrayBuffer();
//   const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const hashHex = hashArray
//     .map((b) => b.toString(16).padStart(2, '0'))
//     .join('');
//   return btoa(hashHex);
// }

/**
 * 使用XMLHttpRequest上传文件到OSS（支持进度回调）
 */
function uploadFileWithProgress(
  url: string,
  file: File,
  headers: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // 监听完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
      }
    });

    // 监听错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'));
    });

    // 监听中断
    xhr.addEventListener('abort', () => {
      reject(new Error('上传已取消'));
    });

    // 打开连接
    xhr.open('PUT', url);

    // 设置请求头
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // 发送文件
    xhr.send(file);
  });
}

/**
 * 上传文件到阿里云OSS
 *
 * @param params 上传参数
 * @returns 上传结果
 *
 * @example
 * ```typescript
 * const result = await uploadToOSS({
 *   file: apkFile,
 *   onProgress: (progress) => console.log(`上传进度: ${progress}%`)
 * });
 * console.log('文件URL:', result.url);
 * ```
 */
export async function uploadToOSS(
  params: OSSUploadParams
): Promise<OSSUploadResult> {
  const startTime = Date.now();
  const { file, fileName, onProgress } = params;

  try {
    // 获取OSS配置
    const config = getOSSConfig();

    // 生成文件名
    const objectName = fileName || generateFileName(file.name);

    // 构建OSS URL
    const ossUrl = config.endpoint
      ? `${config.endpoint}/${objectName}`
      : `https://${config.bucket}.${config.region}.aliyuncs.com/${objectName}`;

    // 设置请求头
    const headers: Record<string, string> = {
      'Content-Type': file.type || 'application/vnd.android.package-archive',
      'x-oss-object-acl': 'public-read', // 设置文件为公共可读
      'x-oss-storage-class': 'Standard'
    };

    // 如果需要更高的安全性，可以使用STS临时凭证
    // 这里为了简化，直接使用AccessKey（生产环境建议使用后端签名）
    const date = new Date().toUTCString();
    headers['Date'] = date;

    // 上传文件
    await uploadFileWithProgress(ossUrl, file, headers, onProgress);

    // 计算上传耗时
    const duration = Date.now() - startTime;

    // 返回结果
    return {
      url: ossUrl,
      name: file.name,
      size: file.size,
      duration
    };
  } catch (error) {
    console.error('OSS上传失败:', error);
    throw new Error(
      error instanceof Error ? error.message : '文件上传失败，请稍后重试'
    );
  }
}

/**
 * 验证APK文件
 *
 * @param file 文件对象
 * @returns 是否是有效的APK文件
 */
export function validateAPKFile(file: File): {
  valid: boolean;
  message?: string;
} {
  // 检查文件扩展名
  const validExtension = file.name.toLowerCase().endsWith('.apk');

  if (!validExtension) {
    return { valid: false, message: '请选择APK文件' };
  }

  // 检查文件大小（限制为500MB）
  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, message: '文件大小不能超过500MB' };
  }

  if (file.size === 0) {
    return { valid: false, message: '文件不能为空' };
  }

  return { valid: true };
}

/**
 * 格式化文件大小
 *
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
