import { motion } from 'framer-motion';
import { AlertCircle, Key, Lock, Shield, Unlock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AdminAuthProps {
  children: React.ReactNode;
  onAuthSuccess?: () => void;
}

interface AuthAttempt {
  timestamp: number;
  success: boolean;
  userAgent?: string;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ children, onAuthSuccess }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState<AuthAttempt[]>([]);

  // 从环境变量获取管理员密码
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'VoidixAdmin2025!';

  // 检查现有认证状态
  useEffect(() => {
    const authToken = localStorage.getItem('voidix_admin_auth');
    const authTime = localStorage.getItem('voidix_admin_auth_time');

    if (authToken && authTime) {
      const authTimestamp = parseInt(authTime);
      const currentTime = Date.now();
      const authDuration = currentTime - authTimestamp;

      // 认证有效期为2小时
      if (authDuration < 2 * 60 * 60 * 1000) {
        setIsAuthenticated(true);
        return;
      }
    }

    // 加载认证尝试记录
    const savedAttempts = JSON.parse(localStorage.getItem('voidix_admin_attempts') || '[]');
    setAttempts(savedAttempts);
  }, []);

  // 记录认证尝试
  const recordAttempt = (success: boolean) => {
    const attempt: AuthAttempt = {
      timestamp: Date.now(),
      success,
      userAgent: navigator.userAgent,
    };

    const updatedAttempts = [attempt, ...attempts].slice(0, 50); // 保留最近50次
    setAttempts(updatedAttempts);
    localStorage.setItem('voidix_admin_attempts', JSON.stringify(updatedAttempts));
  };

  // 检查是否被锁定（防暴力破解）
  const isLocked = () => {
    const recentAttempts = attempts.filter(
      attempt => Date.now() - attempt.timestamp < 15 * 60 * 1000 // 15分钟内
    );
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);

    return failedAttempts.length >= 5; // 15分钟内5次失败尝试则锁定
  };

  // 密码验证
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLocked()) {
      setError('账户已被锁定，请15分钟后重试');
      setLoading(false);
      return;
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === ADMIN_PASSWORD) {
      recordAttempt(true);

      // 设置认证状态
      const authToken = btoa(`${Date.now()}-${Math.random()}`);
      localStorage.setItem('voidix_admin_auth', authToken);
      localStorage.setItem('voidix_admin_auth_time', Date.now().toString());

      setIsAuthenticated(true);
      onAuthSuccess?.();
    } else {
      recordAttempt(false);
      setError('密码错误，请重试');
    }

    setLoading(false);
  };

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('voidix_admin_auth');
    localStorage.removeItem('voidix_admin_auth_time');
    setIsAuthenticated(false);
    setPassword('');
  };

  // 如果已认证，直接显示内容
  if (isAuthenticated) {
    return (
      <div className="relative">
        {/* 认证状态指示器 */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            <span>已认证</span>
            <button
              onClick={handleLogout}
              className="ml-2 text-green-200 hover:text-white transition-colors"
              title="登出"
            >
              <Unlock className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl"
      >
        {/* 标题 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">管理员验证</h1>
          </motion.div>
          <p className="text-gray-300">请输入管理员密码以访问后台</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 mb-6 flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </motion.div>
        )}

        {/* 锁定警告 */}
        {isLocked() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-3 mb-6 flex items-center gap-2"
          >
            <Lock className="h-4 w-4 text-orange-400" />
            <span className="text-orange-300 text-sm">检测到多次失败尝试，账户已临时锁定</span>
          </motion.div>
        )}

        {/* 密码验证表单 */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handlePasswordSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">管理员密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入管理员密码"
              required
              disabled={loading || isLocked()}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || isLocked()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Key className="h-4 w-4" />
            )}
            {loading ? '验证中...' : '登录'}
          </button>
        </motion.form>

        {/* 安全提示 */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-xs text-center">
            🔒 此页面受密码保护
            <br />
            失败尝试过多将临时锁定账户
          </p>
        </div>

        {/* 认证尝试统计 */}
        {attempts.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              最近尝试: {attempts.filter(a => a.success).length} 成功 / {attempts.length} 总计
            </p>
          </div>
        )}

        {/* 开发环境提示 */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-xs text-center">
              🛠️ 开发模式
              <br />
              环境变量: {ADMIN_PASSWORD ? '已配置' : '未配置'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
