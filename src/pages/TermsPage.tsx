import { AnimatedSection, BreadcrumbNavigation, GradientText } from '@/components';
import { SEO } from '@/components/seo';
import { analytics } from '@/services/analytics';
import { AlertTriangle, BookOpen, FileText, Gavel, Heart, Shield, Users } from 'lucide-react';
import React, { useEffect } from 'react';

/**
 * 服务条款页面组件
 */
export const TermsPage: React.FC = () => {
  // 页面加载时跟踪页面访问
  useEffect(() => {
    analytics.page('Terms', {
      pageType: 'legal',
      timestamp: Date.now(),
    });
  }, []);

  const sections = [
    {
      icon: BookOpen,
      title: '服务概述',
      content: `Voidix是一个永久免费的Minecraft公益服务器，致力于为玩家提供开放、透明、无门槛的游戏体验。

我们的服务包括：
• 小游戏服务器（minigame.voidix.net）- 提供起床战争、空岛战争等热门小游戏
• 生存服务器（survival.voidix.net）- 纯净生存体验
• 官方网站服务 - 状态监控、社区交流、技术支持

使用我们的服务即表示您同意遵守本服务条款的所有规定。`,
    },
    {
      icon: Users,
      title: '用户行为准则',
      content: `为了维护良好的游戏环境，所有用户必须遵守以下行为准则：

✅ 允许的行为：
• 友好交流，尊重其他玩家
• 遵守游戏规则和服务器规定
• 积极参与社区建设
• 合理使用游戏资源
• 举报违规行为

❌ 禁止的行为：
• 使用外挂、作弊软件或任何不公平优势
• 恶意破坏游戏环境或他人游戏体验
• 发布垃圾信息、广告或不当内容
• 骚扰、威胁或歧视其他玩家
• 利用游戏漏洞或进行恶意攻击
• 冒充管理员或官方人员

违规行为将根据严重程度采取相应措施，包括警告、临时封禁或永久封禁。`,
    },
    {
      icon: Shield,
      title: '账户安全与责任',
      content: `账户安全：
• 您有责任保护自己的Minecraft账户安全
• 请勿分享账户信息给他人
• 如发现账户异常，请及时联系管理员

用户责任：
• 您对使用我们服务期间的所有行为负责
• 不得将账户借给他人使用
• 不得利用我们的服务进行任何违法活动
• 遵守所有适用的法律法规

我们不对因用户个人原因造成的损失承担责任。`,
    },
    {
      icon: Heart,
      title: '公益性质与免费服务',
      content: `Voidix是一个完全公益的Minecraft服务器：

• 永久免费：我们承诺永远不向玩家收费
• 无商业目的：服务器运营不以盈利为目的
• 开放透明：所有运营数据公开透明
• 社区驱动：服务改进基于社区反馈

我们通过以下方式维持服务：
• 志愿者团队的无偿贡献
• 社区成员的互助支持
• 开源技术的使用
• 合理的资源优化

我们保留在必要时调整服务内容的权利，但会提前通知社区。`,
    },
    {
      icon: Gavel,
      title: '知识产权与内容使用',
      content: `知识产权：
• Voidix品牌、网站设计、原创内容等知识产权归Voidix团队所有
• 我们尊重Minecraft的版权，遵守Mojang的使用条款
• 第三方资源的使用遵循相应的开源许可证

内容使用：
• 您可以在遵守相关条款的前提下使用我们的服务
• 不得复制、修改或分发我们的专有内容
• 社区贡献的内容遵循相应的开源协议

如果您认为我们侵犯了您的知识产权，请通过官方渠道联系我们。`,
    },
    {
      icon: AlertTriangle,
      title: '免责声明',
      content: `服务可用性：
• 我们努力提供稳定的服务，但不保证100%可用性
• 可能因维护、升级或不可抗力因素暂停服务
• 我们会在可能的情况下提前通知维护时间

数据安全：
• 我们采取合理措施保护用户数据
• 但不保证数据绝对安全，建议用户自行备份重要信息
• 我们不对因技术故障造成的数据丢失承担责任

第三方服务：
• 我们可能使用第三方服务（如CDN、分析工具等）
• 这些服务的使用遵循其各自的隐私政策和服务条款
• 我们不对第三方服务的问题承担责任`,
    },
    {
      icon: FileText,
      title: '条款修改与终止',
      content: `条款修改：
• 我们可能根据需要修改本服务条款
• 重大修改会通过网站公告、QQ群或Discord通知用户
• 继续使用服务即表示接受修改后的条款

服务终止：
• 您随时可以停止使用我们的服务
• 我们保留在必要时终止服务的权利
• 服务终止时，我们会尽力保护用户数据

争议解决：
• 如发生争议，优先通过友好协商解决
• 协商不成时，可寻求法律途径解决
• 本条款的解释和适用遵循中华人民共和国法律`,
    },
  ];

  const contactInfo = {
    qq: '186438621',
    discord: 'https://discord.gg/fUMyfhuQ5b',
    email: 'support@voidix.net',
  };

  return (
    <>
      <SEO
        pageKey="terms"
        type="article"
        url="https://www.voidix.net/terms"
        canonicalUrl="https://www.voidix.net/terms"
      />
      <div className="min-h-screen bg-gray-900 pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BreadcrumbNavigation className="mb-8" />

          <AnimatedSection variant="fadeIn" className="mb-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <GradientText variant="primary">服务条款</GradientText>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                使用Voidix服务需要遵守的规则和条款
              </p>
              <div className="mt-6 text-sm text-gray-500">最后更新：2024年7月26日</div>
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fadeIn" delay={0.2} className="mb-8">
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-300 mb-3">重要说明</h2>
              <p className="text-gray-300 leading-relaxed">
                Voidix是一个公益性的Minecraft服务器，致力于为玩家提供免费、公平、开放的游戏环境。
                使用我们的服务即表示您同意本服务条款的所有规定。我们鼓励所有玩家友好相处，共同维护良好的游戏社区。
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
                      <div className="w-12 h-12 bg-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-green-400" />
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

          <AnimatedSection variant="fadeIn" delay={0.8} className="mt-12">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-4">联系我们</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    如果您对本服务条款有任何疑问或建议，欢迎通过以下方式联系我们：
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐧</span>
                      <span className="text-gray-300">QQ群：{contactInfo.qq}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎮</span>
                      <span className="text-gray-300">
                        Discord：
                        <a
                          href={contactInfo.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors ml-1"
                        >
                          {contactInfo.discord}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📧</span>
                      <span className="text-gray-300">
                        邮箱：
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors ml-1"
                        >
                          {contactInfo.email}
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
};
