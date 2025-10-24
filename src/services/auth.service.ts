import apiClient, { TokenManager } from '@/lib/api-client';
import {
  ApiResponse,
  VerifyUserPackage,
  UserLocation,
  AuthorizationLevel
} from '@/types/api';

/**
 * 登录请求参数
 */
export interface LoginRequest {
  businessId?: string;
  username: string;
  password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token?: string;
  userLocation?: UserLocation;
  [key: string]: any;
}

/**
 * 认证服务
 */
class AuthService {
  private readonly baseUrl = '/User';

  /**
   * 用户登录
   */
  async login(params: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const loginPackage: VerifyUserPackage = {
      // UserLocation 会被 API 客户端自动注入默认值（TenantID=1, CompanyID=1, LocationID=1, BusinessID="1"）
      UserLocation: {
        AuthorizationLevel: AuthorizationLevel.Level0,
        TenantID: 1,
        CompanyID: 1,
        BusinessID: '1',
        LocationID: 1
      },
      BusinessID: '1',
      UserIdentifier: params.username,
      AccessPassword: params.password,
      SerialNumber: null,
      VerifyCode: null,
      AccessToken: null,
      UID: null,
      UserName: null,
      MobilePhone: null,
      IdCardData: {}
    };

    const response = await apiClient.post<LoginResponse>(
      `${this.baseUrl}/VerifyUser`,
      loginPackage
    );

    // 登录成功后保存 Token
    // Code === 0 表示成功
    if (response.Code === 0 && response.Result) {
      // Token 可能在多个位置，按优先级查找
      const token =
        response.Result.Token ||
        response.Result.token ||
        response.Result.LocationAccessToken ||
        response.Result.CompanyAccessToken ||
        response.Result.UserLocation?.Token ||
        response.Result.UserLocation?.LocationAccessToken ||
        response.Result.UserLocation?.CompanyAccessToken;

      if (token) {
        TokenManager.setToken(token);

        // 同时设置 cookie 以便 middleware 可以检查
        if (typeof document !== 'undefined') {
          document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7天
        }
      }
    }

    return response;
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    TokenManager.removeToken();

    // 清除用户信息
    if (typeof window !== 'undefined') {
      const { useAuthStore } = await import('@/stores/auth.store');
      useAuthStore.getState().clearUserInfo();
    }

    // 清除 cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; max-age=0';
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!TokenManager.getToken();
  }

  /**
   * 获取当前 Token
   */
  getToken(): string | null {
    return TokenManager.getToken();
  }
}

// 导出单例
export const authService = new AuthService();
