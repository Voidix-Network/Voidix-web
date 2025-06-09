import {
  HeroSection,
  AboutSection,
  ServersSection,
  VersionsSection,
  TimelineSection,
  TeamSection,
} from '@/components';
import { PageSEO, PerformanceOptimizer } from '@/components/seo';

/**
 * 首页组件 - 复现原项目的完整设计
 */
export const HomePage: React.FC = () => {
  return (
    <>
      {' '}
      <PageSEO pageKey="home" type="website" canonicalUrl="https://www.voidix.net/" />
      <PerformanceOptimizer
        preloadImages={['/android-chrome-512x512.png']}
        prefetchRoutes={['/status', '/faq']}
      />
      <HeroSection />
      <AboutSection />
      <ServersSection />
      <VersionsSection />
      <TimelineSection />
      <TeamSection />
    </>
  );
};
