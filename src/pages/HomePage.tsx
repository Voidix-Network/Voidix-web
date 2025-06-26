import {
    AboutSection,
    HeroSection,
    ServersSection,
    TimelineSection,
    VersionsSection,
} from '@/components';
import { TeamSection } from '@/components/sections/TeamSection';
import { PerformanceOptimizer, SEO } from '@/components/seo';

/**
 * 首页组件 - 复现原项目的完整设计
 */
export const HomePage: React.FC = () => {
  return (
    <>
      {' '}
      <SEO
        pageKey="home"
        type="website"
        canonicalUrl="https://www.voidix.net/"
        enableAnalytics={true}
      />
      <PerformanceOptimizer />
      <HeroSection />
      <AboutSection />
      <ServersSection />
      <VersionsSection />
      <TimelineSection />
      <TeamSection />
    </>
  );
};
