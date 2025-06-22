import {
  AboutSection,
  HeroSection,
  ServersSection,
  TimelineSection,
  VersionsSection,
} from '@/components';
import { TeamSection } from '@/components/sections/TeamSection';
import { PageSEO, PerformanceOptimizer } from '@/components/seo';

/**
 * 首页组件 - 复现原项目的完整设计
 */
export const HomePage: React.FC = () => {
  return (
    <>
      {' '}
      <PageSEO pageKey="home" type="website" canonicalUrl="https://www.voidix.net/" />
      <PerformanceOptimizer prefetchRoutes={['/status', '/faq']} />
      <HeroSection />
      <AboutSection />
      <ServersSection />
      <VersionsSection />
      <TimelineSection />
      <TeamSection />
    </>
  );
};
