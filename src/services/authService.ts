import type { LoginResponse, ValidateResponse, LogoutResponse, UserInfo } from '@/types/api';

const API_BASE_URL = 'https://webba.voidix.net:5699';

/**
 * 认证服务 - 处理登录、登出、token验证
 */
export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败',
      };
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data: LogoutResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登出失败');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登出失败',
      };
    }
  }

  /**
   * 验证token有效性 - 使用Authorization Header
   */
  async validateToken(): Promise<ValidateResponse> {
    // 从localStorage获取token
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.token) {
      return { valid: false, error: 'No token in localStorage' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        credentials: 'include',
      });

      const data: ValidateResponse = await response.json();

      if (!response.ok) {
        return { valid: false, error: data.error };
      }

      return data;
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : '验证失败',
      };
    }
  }

  /**
   * 从localStorage获取当前用户信息
   */
  getCurrentUser(): UserInfo | null {
    const stored = localStorage.getItem('voidix_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * 保存用户信息到localStorage
   */
  saveCurrentUser(userInfo: UserInfo): void {
    localStorage.setItem('voidix_user', JSON.stringify(userInfo));
  }

  /**
   * 清除本地用户信息
   */
  clearCurrentUser(): void {
    localStorage.removeItem('voidix_user');
  }
}

export const authService = AuthService.getInstance();
