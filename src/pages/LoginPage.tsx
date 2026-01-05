import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoginForm } from '@/components/auth/LoginForm';
import { SEO } from '@/components/seo';

/**
 * 登录页面组件
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, validateToken } = useAuthStore();

  // 页面加载时验证token
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  // 如果已登录，重定向到issue页面
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/issue');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <SEO
        pageKey="login"
        type="website"
        url="https://www.voidix.net/login"
        canonicalUrl="https://www.voidix.net/login"
      />
      <LoginForm />
    </>
  );
};

export default LoginPage;
