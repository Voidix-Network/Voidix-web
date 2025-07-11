import { AnimatedSection, BreadcrumbNavigation, GradientText } from '@/components';
import { SEO } from '@/components/seo';
import { useCookieConsent } from '@/hooks';
import { analytics } from '@/services/analytics';
import { resetConsent } from '@/services/cookieConsentService';
import {
  Cookie,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import React, { useEffect } from 'react';

/**
 * Cookie同意状态管理组件
 */
const CookieConsentManager: React.FC = () => {
  const { consent } = useCookieConsent();

  const handleResetConsent = () => {
    resetConsent();
    // 可选：提示用户已重置
    alert('您的Cookie设置已被重置。请在页面底部的横幅中重新进行选择。');
  };

  return (
    <AnimatedSection variant="fadeIn" delay={0.8} className="mt-12">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <SlidersHorizontal className="h-6 w-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-white mb-4">管理您的Cookie设置</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              您可以随时查看和管理您对我们网站Cookie使用的同意情况。
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300">
                分析Cookie:{' '}
                <span
                  className={
                    consent.analytics ? 'text-green-400 font-bold' : 'text-red-400 font-bold'
                  }
                >
                  {consent.analytics ? '已同意' : '未同意'}
                </span>
              </p>
            </div>
            <button
              onClick={handleResetConsent}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              修改或重置设置
            </button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

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
      title: '我们收集的信息',
      content: `我们致力于最小化数据收集。我们主要收集以下类型的匿名化信息：
      • 访问日志：匿名的IP地址、浏览器类型、访问时间，用于安全审计和流量分析。
      • 使用数据：通过Google Analytics和Microsoft Clarity收集匿名的页面浏览、点击、停留时间等聚合统计数据，以了解服务使用情况。
      • 技术信息：设备类型、操作系统等匿名技术信息，用于优化兼容性。
      我们不会收集或存储任何可直接识别您个人身份的信息（如姓名、邮箱地址）。`,
    },
    {
      icon: Eye,
      title: '信息的使用',
      content: `我们收集的匿名信息主要用于：
      • 提供和维护我们的网站和服务。
      • 分析和理解用户行为，以改善和优化用户体验。
      • 监控我们服务的性能和稳定性，进行技术支持和故障排除。
      • 确保我们的服务安全，防范欺诈和滥用行为。
      • 遵守适用的法律法规要求。`,
    },
    {
      icon: Cookie,
      title: 'Cookie及类似技术政策',
      content: `我们使用Cookie来运营和改善我们的网站。Cookie是存储在您设备上的小文本文件。我们主要使用以下两类Cookie：
      • 必要Cookie：这些Cookie是网站核心功能运行所必需的，例如保持会话状态。您无法禁用这些Cookie。
      • 分析Cookie：这些Cookie（来自Google Analytics和Clarity）帮助我们统计访问量和流量来源，以便我们衡量和改进我们网站的性能。如果您不允许使用这些Cookie，我们将不知道您何时访问了我们的网站。
      您可以通过我们网站页脚的Cookie横幅随时管理您的Cookie偏好。`,
    },
    {
      icon: Database,
      title: '数据共享与披露',
      content: `我们不会出售您的任何信息。我们仅在以下情况下与第三方共享匿名的聚合数据：
      • 分析服务提供商：与Google(Google Analytics)和Microsoft(Clarity)共享匿名的使用数据，以帮助我们分析服务。这些提供商有其自身的隐私政策，并被禁止将数据用于其他目的。
      • 法律要求：在法律法规要求或响应有效的法律程序时，我们可能会披露必要的信息。`,
    },
    {
      icon: FileText,
      title: '数据保留与您的权利',
      content: `• 数据保留：我们通过Google Analytics收集的匿名用户和事件数据的保留期限为14个月。其他匿名日志数据的保留时间不超过90天。
      • 您的权利：根据GDPR等隐私法，您拥有多项权利。由于我们不收集您的个人身份信息，这些权利的应用场景有限。但您始终有权：
        - 撤回同意：您可以随时通过我们网站的Cookie设置工具撤回对分析Cookie的同意。
        - 投诉：您有权向您所在国家/地区的数据保护机构提出投诉。`,
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
      • QQ群：186438621
      • Discord：https://discord.gg/fUMyfhuQ5b
      • 邮箱：contact@voidix.net
      我们将在收到请求后的合理时间内回复您的询问。`,
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

          <AnimatedSection variant="fadeIn" className="mb-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <GradientText variant="primary">隐私政策</GradientText>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                我们如何收集、使用和保护您的信息
              </p>
              <div className="mt-6 text-sm text-gray-500">最后更新：2024年7月26日</div>
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fadeIn" delay={0.2} className="mb-8">
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
                <AnimatedSection key={section.title} variant="fadeIn" delay={0.3 + index * 0.1}>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 backdrop-blur-sm">
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
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          <CookieConsentManager />

          <AnimatedSection variant="fadeIn" delay={0.8} className="mt-12">
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
