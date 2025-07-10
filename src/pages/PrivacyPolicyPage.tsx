import { AnimatedSection, BreadcrumbNavigation, GradientText } from '@/components';
import { SEO } from '@/components/seo';
import { analytics } from '@/services/analytics';
import { motion } from 'framer-motion';
import { Cookie, Database, Eye, Lock, Mail, Shield } from 'lucide-react';
import React, { useEffect } from 'react';

/**
 * 隐私政策页面组件
 */
export const PrivacyPolicyPage: React.FC = () => {
  // 页面加载时跟踪页面访问
  useEffect(() => {
    analytics.page('PrivacyPolicy', {
      pageType: 'legal',
      timestamp: Date.now(),
    });
  }, []);

  const sections = [
    {
      icon: Shield,
      title: '信息收集',
      content: `我们收集以下类型的信息：
      • 访问日志：IP地址、浏览器类型、访问时间
      • 使用数据：页面浏览、功能使用统计
      • 技术信息：设备类型、操作系统、网络信息
      • Cookie信息：用于改善用户体验的必要数据`,
    },
    {
      icon: Eye,
      title: '信息使用',
      content: `我们将收集的信息用于：
      • 提供和维护服务
      • 改善用户体验
      • 分析网站使用情况
      • 技术支持和故障排除
      • 遵守法律法规要求`,
    },
    {
      icon: Cookie,
      title: 'Cookie政策',
      content: `我们使用Cookie用于：
      • 必要功能：网站基本功能运行
      • 分析统计：了解用户使用模式
      • 性能优化：提升网站加载速度
      • 第三方服务：搜索引擎优化和分析工具
      您可以通过浏览器设置管理Cookie偏好。`,
    },
    {
      icon: Database,
      title: '数据共享',
      content: `我们可能与以下方共享数据：
      • 技术服务提供商：网站托管、分析服务
      • 搜索引擎：用于网站索引和发现
      • 法律要求：当法律要求时
      我们不会出售您的个人信息给第三方。`,
    },
    {
      icon: Lock,
      title: '数据安全',
      content: `我们采取以下安全措施：
      • HTTPS加密传输
      • 定期安全审计
      • 访问控制和权限管理
      • 数据备份和恢复机制
      • 安全监控和威胁检测`,
    },
    {
      icon: Mail,
      title: '联系我们',
      content: `如有隐私相关问题，请联系：
      • QQ群：加入我们的QQ群咨询
      • Discord：通过Discord服务器联系
      • 邮箱：通过官方邮箱反馈
      我们将在24小时内回复您的询问。`,
    },
  ];

  return (
    <>
      <SEO
        pageKey="privacy"
        type="article"
        url="https://www.voidix.net/privacy"
        canonicalUrl="https://www.voidix.net/privacy"
      />
      <div className="min-h-screen bg-gray-900 pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BreadcrumbNavigation className="mb-8" />

          <AnimatedSection variant="fadeInUp" className="mb-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <GradientText variant="primary">隐私政策</GradientText>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                了解我们如何收集、使用和保护您的信息
              </p>
              <div className="mt-6 text-sm text-gray-500">最后更新：2025年6月21日</div>
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fadeInUp" delay={0.2} className="mb-8">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">重要说明</h2>
              <p className="text-gray-300 leading-relaxed">
                Voidix致力于保护用户隐私。本隐私政策说明我们如何收集、使用、存储和保护您的信息。
                使用我们的服务即表示您同意本政策的条款。
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <AnimatedSection key={section.title} variant="fadeInUp" delay={0.3 + index * 0.1}>
                  <motion.div
                    className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-4">{section.title}</h3>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>

          <AnimatedSection variant="fadeInUp" delay={0.8} className="mt-12">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">政策更新</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                我们可能会不时更新此隐私政策。重大变更将通过以下方式通知：
              </p>
              <ul className="text-gray-300 space-y-2 ml-6">
                <li>• 在网站上发布更新通知</li>
                <li>• 通过社交媒体渠道公告</li>
                <li>• 在服务器内发送通知</li>
              </ul>
              <p className="text-gray-400 text-sm mt-4">
                继续使用我们的服务即表示您接受更新后的政策。
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
