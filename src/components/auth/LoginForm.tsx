import { useAuthStore } from '@/stores/authStore';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  useEffect(() => clearError, [clearError]);

  const isFormValid = username.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    const success = await login(username, password);
    if (success) {
      onLoginSuccess ? onLoginSuccess() : navigate('/issue');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1321] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #6a93ff, #7367f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            欢迎回来
          </h1>
          <p className="text-gray-500 text-sm">使用你的游戏账号登录</p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="用户名"
              className="w-full px-4 py-3 bg-[#151f38] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="密码"
              className="w-full px-4 py-3 pr-11 bg-[#151f38] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中...
              </span>
            ) : (
              '登录'
            )}
          </button>
        </form>

        {/* 底部提示 */}
        <p className="text-center text-gray-600 text-xs mt-6">
          没有账号？在游戏内使用 <code className="text-purple-400">/register</code> 注册
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
