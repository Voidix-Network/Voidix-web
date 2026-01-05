import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { authService } from '@/services/authService';
import type { UserInfo } from '@/types/api';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  validateToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * 认证状态管理Store
 * 管理用户登录状态、token验证和用户信息
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  subscribeWithSelector(set => ({
    ...initialState,

    /**
     * 用户登录
     */
    login: async (username: string, password: string): Promise<boolean> => {
      set({ isLoading: true, error: null });

      try {
        const response = await authService.login(username, password);

        if (response.success && response.token && response.username && response.player_uuid) {
          const userInfo: UserInfo = {
            username: response.username,
            player_uuid: response.player_uuid,
            token: response.token,
            isAdmin: response.isAdmin || false, // 新增：存储isAdmin
          };

          // 保存到localStorage
          authService.saveCurrentUser(userInfo);

          set({
            user: userInfo,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } else {
          set({
            isLoading: false,
            error: response.error || '登录失败',
          });
          return false;
        }
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : '登录失败',
        });
        return false;
      }
    },

    /**
     * 用户登出
     */
    logout: async (): Promise<void> => {
      set({ isLoading: true, error: null });

      try {
        await authService.logout();
        authService.clearCurrentUser();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // 即使API失败，也要清除本地状态
        authService.clearCurrentUser();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    /**
     * 验证token有效性
     */
    validateToken: async (): Promise<void> => {
      set({ isLoading: true });

      try {
        // 首先检查本地存储
        const currentUser = authService.getCurrentUser();

        if (!currentUser) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // 验证token
        const response = await authService.validateToken();

        if (response.valid && response.username && response.player_uuid) {
          const userInfo: UserInfo = {
            username: response.username,
            player_uuid: response.player_uuid,
            token: currentUser.token,
            isAdmin: response.isAdmin || false, // 新增：存储isAdmin
          };

          set({
            user: userInfo,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // token无效，清除本地存储
          authService.clearCurrentUser();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        // 验证失败时也清除本地状态
        authService.clearCurrentUser();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    /**
     * 清除错误信息
     */
    clearError: () => {
      set({ error: null });
    },

    /**
     * 设置加载状态
     */
    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },
  }))
);

// 便捷的hook
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    validateToken: store.validateToken,
    clearError: store.clearError,
  };
};
