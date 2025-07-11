import {
  CookieConsent,
  getConsent,
  hasMadeChoice as hasMadeChoiceService,
} from '@/services/cookieConsentService';
import { useCallback, useEffect, useState } from 'react';

/**
 * 自定义钩子，用于访问和订阅Cookie同意状态。
 * @returns an object containing the current consent state, a function to check consent for a category, and whether the user has made a new choice.
 */
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent>(getConsent());
  const [madeChoice, setMadeChoice] = useState<boolean>(hasMadeChoiceService());

  useEffect(() => {
    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsent>;
      setConsent(customEvent.detail);
      setMadeChoice(true);
    };

    // 监听同意状态变化
    window.addEventListener('cookieConsentChanged', handleConsentChange);

    // 组件卸载时移除监听
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
    };
  }, []);

  /**
   * 检查是否对特定类别的Cookie给予了同意。
   * @param category - The category to check ('necessary', 'analytics').
   * @returns `true` if consent has been given, otherwise `false`.
   */
  const hasConsent = useCallback(
    (category: keyof CookieConsent): boolean => {
      return consent[category] ?? false;
    },
    [consent]
  );

  return { consent, hasConsent, hasMadeChoice: madeChoice };
};
