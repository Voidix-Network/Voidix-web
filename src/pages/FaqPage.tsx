import { AnimatedSection, BreadcrumbNavigation } from '@/components';
import { FAQSchema, SEO } from '@/components/seo';
import { analytics } from '@/services/analytics';
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';

interface FaqItem {
  id: number;
  question: string;
  answer: string | JSX.Element;
}

const faqData: FaqItem[] = [
  {
    id: 1,
    question: '如何加入Voidix服务器？',
    answer: (
      <span>
        请参考我们首页的{' '}
        <a href="/#versions" className="text-blue-400 hover:text-blue-300 hover:underline">
          Java版和基岩版连接指南
        </a>
        。通常您只需要在游戏的多人游戏菜单中添加我们的服务器地址即可。
      </span>
    ),
  },
  {
    id: 2,
    question: '服务器是免费的吗？有付费项目吗？',
    answer:
      '是的，Voidix是一个纯公益服务器，完全免费。我们没有任何付费项目或道具，致力于提供一个公平的游戏环境。',
  },
  {
    id: 3,
    question: '服务器支持哪些Minecraft版本？',
    answer:
      '我们的小游戏服务器支持1.16.5-1.21.8(信息更新可能滞后)的Java版，生存服务器则使用最新的Java版，但也支持1.7.2-最新版。同时，通过GeyserMC技术，基岩版玩家也可以连接到我们的服务器，基岩版一般支持最新版，过旧的基岩版可能不会被支持。',
  },
  {
    id: 4,
    question: '如果我遇到了Bug或者有建议，应该怎么办？',
    answer: (
      <span>
        您可以通过我们的{' '}
        <a href="/bug-report" className="text-blue-400 hover:text-blue-300 hover:underline">
          Bug反馈页面
        </a>{' '}
        提交问题，或者在我们的QQ群/Discord社群中向管理员反馈。
      </span>
    ),
  },
  {
    id: 5,
    question: '我可以申请成为管理团队的一员吗？',
    answer: (
      <span>
        我们欣赏您的这份热情！我们的“开放”理念，意味着我们乐见任何为社群做出卓越贡献、并展现出责任心的成员成为我们的一员。管理团队的加入并非通过简单申请，而是基于您在社群中的长期贡献、专业能力以及与社群理念的契合度。如果您确信自己符合要求，欢迎您通过{' '}
        <a
          href="mailto:support@voidix.net"
          className="text-blue-400 hover:text-blue-300 hover:underline"
        >
          电子邮件
        </a>{' '}
        或现管理成员提交一份正式的申请，阐述您的动机、构想和能为社群带来的价值。我们将认真评估每一份用心的申请。
      </span>
    ),
  },
];

// 为FAQSchema准备的纯文本数据
const faqSchemaData = [
  {
    question: '如何加入Voidix服务器？',
    answer:
      '请参考我们首页的Java版和基岩版连接指南。通常您只需要在游戏的多人游戏菜单中添加我们的服务器地址即可。',
  },
  {
    question: '服务器是免费的吗？有付费项目吗？',
    answer:
      '是的，Voidix是一个纯公益服务器，完全免费。我们没有任何付费项目或道具，致力于提供一个公平的游戏环境。',
  },
  {
    question: '服务器支持哪些Minecraft版本？',
    answer:
      '我们的小游戏服务器支持1.16.5-1.21.1的Java版，生存服务器则使用最新的Java版，但也支持1.7.2-latest。同时，通过GeyserMC技术，基岩版玩家也可以连接到我们的服务器，基岩版一般支持最新版，过旧的基岩版可能不会被支持。',
  },
  {
    question: '如果我遇到了Bug或者有建议，应该怎么办？',
    answer: '您可以通过我们的Bug反馈页面提交问题，或者在我们的QQ群/Discord社群中向管理员反馈。',
  },
  {
    question: '我可以申请成为管理团队的一员吗？',
    answer:
      '我们欢迎热心玩家的加入！管理团队由玩家选举产生，您可以关注社群公告了解招募信息，或直接联系现有管理表达您的意愿。',
  },
];

const FaqItemComponent: React.FC<{ item: FaqItem; index: number }> = ({ item, index }) => {
  // 处理FAQ项目点击事件
  const handleFaqClick = () => {
    analytics.trackFAQView(item.id.toString(), 'general_faq');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="border border-gray-700/50 rounded-lg p-6 bg-gray-800/30 backdrop-blur-sm cursor-pointer hover:bg-gray-800/50 transition-colors"
      onClick={handleFaqClick}
    >
      <div className="flex items-start">
        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600/20 border border-blue-500/30 rounded-full mr-4 text-sm text-blue-300 font-medium flex-shrink-0 mt-1">
          {item.id}
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-3">{item.question}</h3>
          <p className="text-gray-300 leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * FAQ页面组件
 */
export const FaqPage: React.FC = () => {
  // 页面加载时跟踪页面访问
  useEffect(() => {
    analytics.page('FAQ', {
      totalQuestions: faqData.length,
      pageType: 'faq',
    });
  }, []);

  // 处理社交媒体链接点击
  const handleSocialClick = (platform: string) => {
    analytics.track('social_link_click', {
      platform,
      source: 'faq_page',
      location: 'contact_section',
    });
  };

  return (
    <>
      <SEO
        pageKey="faq"
        type="article"
        url="https://www.voidix.net/faq"
        canonicalUrl="https://www.voidix.net/faq"
      />
      <FAQSchema faqItems={faqSchemaData} />
      <div className="min-h-screen bg-gray-900 pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BreadcrumbNavigation className="mb-8" />

          <AnimatedSection variant="fadeIn" className="mb-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">常见问题</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                快速解答关于Voidix服务器的常见疑问
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fadeIn" delay={0.2}>
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <FaqItemComponent key={item.id} item={item} index={index} />
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fadeIn" delay={0.4} className="mt-12">
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">还有其他问题？</h2>
              <p className="text-gray-300 mb-6">
                如果您的问题没有在上面找到答案，欢迎通过以下方式联系我们：
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://qm.qq.com/cgi-bin/qm/qr?k=aMRoacVuxcGVSzEwfjb49oN4CWCv6yHj&jump_from=webapi&authKey=hw0EhRKGDGN1vmHD4AfK2yJCzPzSA+AXGJOEcugZpsA7KfK9GhNXpe9GNWCjCcmr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  onClick={() => handleSocialClick('qq')}
                >
                  加入QQ群
                </a>
                <a
                  href="https://discord.gg/fUMyfhuQ5b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  onClick={() => handleSocialClick('discord')}
                >
                  加入Discord
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
};
