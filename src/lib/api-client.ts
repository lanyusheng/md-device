import { ApiResponse } from '@/types/api';

/**
 * API 配置接口
 */
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 30000 * 100,
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Token 管理
 */
class TokenManager {
  private static TOKEN_KEY = 'auth_token';

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

/**
 * API 客户端类
 */
class ApiClient {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 注入默认的 UserLocation 参数
   */
  private injectUserLocation(data: any): any {
    // if (!data || typeof data !== 'object') {
    //   return data;
    // }
    //
    // // 默认的 UserLocation 配置（写死为 1）
    // const defaultUserLocation = {
    //   BusinessID: '1',
    //   TenantID: 1,
    //   CompanyID: 1,
    //   LocationID: 1
    // };
    //
    // // 深度合并 UserLocation
    // if (data.UserLocation) {
    //   data.UserLocation = {
    //     ...data.UserLocation,
    //     ...defaultUserLocation
    //   };
    // } else {
    //   data.UserLocation = defaultUserLocation;
    // }

    return data;
  }

  /**
   * 构建完整 URL
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = `${this.config.baseURL}${url}`;

    if (!params) return fullUrl;

    const queryString = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&');

    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  /**
   * 处理请求
   */
  private async request<T = any>(
    url: string,
    options: RequestInit = {},
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const token = TokenManager.getToken();
    const headers: HeadersInit = {
      ...this.config.headers,
      ...options.headers
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `${token}`;
    }

    const fullUrl = this.buildUrl(url, params);

    // 打印请求日志（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: options.method || 'GET',
        url: fullUrl,
        params,
        body: options.body
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // 打印响应日志（开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ API Response:', {
          url: fullUrl,
          status: response.status
        });
      }

      // 处理 HTTP 错误
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return this.handleHttpError(response.status, errorData);
      }

      const data: ApiResponse<T> = await response.json();

      // 根据业务状态码处理
      // Code === 0 表示成功
      if (data.Code === 0) {
        return data;
      } else if (data.Code === 401) {
        // Token 过期或无效
        TokenManager.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error(data.Result || data.Message || '未授权，请重新登录');
      } else {
        // 其他业务错误，Result 字段是错误提示
        const errorMessage = data.Result || data.Message || '请求失败';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Request Error:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时');
        }
        throw error;
      }

      throw new Error('网络错误，请检查网络连接');
    }
  }

  /**
   * 处理 HTTP 错误
   */
  private handleHttpError(status: number, errorData: any): never {
    let message = '请求失败';

    switch (status) {
      case 400:
        message = '请求参数错误';
        break;
      case 401:
        message = '未授权，请重新登录';
        TokenManager.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
      case 403:
        message = '拒绝访问';
        break;
      case 404:
        message = '请求资源不存在';
        break;
      case 500:
        message = '服务器内部错误';
        break;
      case 502:
        message = '网关错误';
        break;
      case 503:
        message = '服务不可用';
        break;
      case 504:
        message = '网关超时';
        break;
      default:
        message = errorData?.Message || `请求失败 (${status})`;
    }

    throw new Error(message);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * GET 请求
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' }, params);
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    // 自动注入 UserLocation 参数
    const injectedData = this.injectUserLocation(data);

    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(injectedData)
    });
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    // 自动注入 UserLocation 参数
    const injectedData = this.injectUserLocation(data);

    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(injectedData)
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' }, params);
  }
}

// 创建默认实例
const apiClient = new ApiClient();

// 导出 Token 管理器
export { TokenManager };

// 导出默认实例
export default apiClient;
