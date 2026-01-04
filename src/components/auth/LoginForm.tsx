import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button, Card, GradientText } from '@/components';
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });
  
  const navigate = useNavigate();
  
  const { login, isLoading, error, clearError } = useAuthStore();

  // 清除错误信息
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // 验证
  const validateUsername = (value: string) => value.trim().length >= 3;
  const validatePassword = (value: string) => value.length >= 6;

  const isUsernameValid = validateUsername(username);
  const isPasswordValid = validatePassword(password);
  const isFormValid = isUsernameValid && isPasswordValid;

  const handleBlur = (field: 'username' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      return;
    }

    const success = await login(username, password);
    
    if (success) {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/issue');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card variant="glass" className="p-8">
          {/* 标题 */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              <GradientText variant="primary">用户登录</GradientText>
            </h1>
            <p className="text-gray-400 text-sm">请登录您的账号以访问Issue系统</p>
          </motion.div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名输入 */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => handleBlur('username')}
                  className={`w-full pl-10 pr-3 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    touched.username && !isUsernameValid
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                  } text-white placeholder-gray-500`}
                  placeholder="输入用户名"
                  disabled={isLoading}
                />
                {touched.username && isUsernameValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {touched.username && !isUsernameValid && (
                <p className="text-red-400 text-xs">用户名至少需要3个字符</p>
              )}
            </motion.div>

            {/* 密码输入 */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-10 pr-3 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    touched.password && !isPasswordValid
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                  } text-white placeholder-gray-500`}
                  placeholder="输入密码"
                  disabled={isLoading}
                />
                {touched.password && isPasswordValid && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {touched.password && !isPasswordValid && (
                <p className="text-red-400 text-xs">密码至少需要6个字符</p>
              )}
            </motion.div>

            {/* 错误信息 */}
            {error && (
              <motion.div
                className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-300">{error}</span>
              </motion.div>
            )}

            {/* 按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!isFormValid || isLoading}
                className="w-full"
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </motion.div>

            {/* 辅助信息 */}
            <motion.div
              className="text-center text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p>使用您的Minecraft账号登录</p>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;