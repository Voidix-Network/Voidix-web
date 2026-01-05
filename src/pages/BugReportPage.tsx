import { AnimatedSection, BreadcrumbNavigation } from '@/components';
import { SEO } from '@/components/seo';
import { FEEDBACK_CHANNELS_CONFIG } from '@/components/seo/feedbackChannels';
import { FEEDBACK_REQUIREMENTS_CONFIG } from '@/components/seo/feedbackRequirements';
import { analytics } from '@/services/analytics';
import { motion } from 'framer-motion';
import {
  Bug,
  Camera,
  CheckCircle,
  Clock,
  ExternalLink,
  Github,
  Globe,
  Mail,
  MessageSquare,
  User,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Bug反馈页面组件
 */
export const BugReportPage: React.FC = () => {
  const navigate = useNavigate();

  // 页面加载时跟踪页面访问
  useEffect(() => {
    analytics.page('BugReport', {
      pageType: 'support',
      contactChannels: FEEDBACK_CHANNELS_CONFIG.length,
    });
  }, []);

  // 处理联系方式点击事件
  const handleContactClick = (channelName: string, isInternal: boolean, link: string) => {
    analytics.trackBugReport(channelName, 'channel_click');
    analytics.track('contact_channel_click', {
      channel: channelName,
      source: 'bug_report_page',
      location: 'contact_options',
    });

    // 内部链接使用路由导航
    if (isInternal) {
      navigate(link);
    }
  };

  // 图标映射
  const iconMap = {
    MessageSquare,
    Globe,
    Mail,
    Github,
    Bug,
    Clock,
    Camera,
    User,
    CheckCircle,
  };
  return (
    <>
      <SEO
        pageKey="bugReport"
        type="website"
        url="https://www.voidix.net/bug-report"
        canonicalUrl="https://www.voidix.net/bug-report"
      />
      <div className="min-h-screen bg-gray-900">
        <AnimatedSection className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* 面包屑导航 */}
            <BreadcrumbNavigation className="mb-8" />
            {/* 主要内容区域 */}
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* 页面标题 */}
              <motion.h1
                className="text-3xl font-bold text-white mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Bug 反馈
              </motion.h1>

              {/* 介绍文字 */}
              <motion.div
                className="space-y-6 text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-lg leading-relaxed">
                  我们非常重视您在游戏过程中遇到的任何问题。如果您发现了Bug，请尽可能详细地告诉我们，这将帮助我们更快地定位和修复问题。
                </p>

                {/* 反馈渠道 */}
                <motion.div
                  className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-blue-400" />
                    反馈渠道
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {FEEDBACK_CHANNELS_CONFIG.map((channel, index) => {
                      const IconComponent = iconMap[channel.iconName];
                      const isInternal = channel.isInternal || false;

                      return (
                        <motion.button
                          key={channel.name}
                          onClick={() => handleContactClick(channel.name, isInternal, channel.link)}
                          className="group flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-300 text-left w-full"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.5 + index * 0.1,
                          }}
                          whileHover={{
                            y: 2,
                            scale: 0.98,
                          }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${channel.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {channel.name}
                              </h3>
                              {isInternal ? (
                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                                  内部
                                </span>
                              ) : (
                                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-300 transition-colors" />
                              )}
                            </div>
                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                              {channel.description}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* 反馈信息要求 */}
                <motion.div
                  className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <Bug className="h-6 w-6 text-orange-400" />
                    反馈时请尽量包含以下信息
                  </h2>
                  <div className="grid gap-4">
                    {FEEDBACK_REQUIREMENTS_CONFIG.map((requirement, index) => {
                      const IconComponent = iconMap[requirement.iconName];
                      return (
                        <motion.div
                          key={requirement.title}
                          className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.7 + index * 0.05,
                          }}
                        >
                          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-blue-300 mb-1">
                              {requirement.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                              {requirement.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* 感谢语 */}
                <motion.div
                  className="text-center p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <p className="text-purple-300 font-medium">
                    感谢您的帮助，让我们一起把Voidix建设得更好！
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default BugReportPage;
