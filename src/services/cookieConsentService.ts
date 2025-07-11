/**
 * Cookie同意管理服务
 * 封装了与localStorage交互的逻辑，用于管理用户的Cookie同意设置。
 */

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_KEY = 'voidix-cookie-consent';

const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
};

/**
 * 从localStorage获取用户的Cookie同意设置。
 * @returns {CookieConsent} 当前的同意设置，如果不存在则返回默认值。
 */
export const getConsent = (): CookieConsent => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_CONSENT, necessary: true }; // SSR环境下返回默认值
  }
  try {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (storedConsent) {
      const parsedConsent = JSON.parse(storedConsent);
      // 确保基础字段存在
      return { ...DEFAULT_CONSENT, ...parsedConsent, necessary: true };
    }
  } catch (error) {
    console.error('无法解析Cookie同意设置:', error);
  }
  return { ...DEFAULT_CONSENT, necessary: true };
};

/**
 * 将用户的Cookie同意设置保存到localStorage。
 * @param {Partial<CookieConsent>} newConsent - 用户提供的新设置。
 */
export const setConsent = (newConsent: Partial<Omit<CookieConsent, 'necessary'>>): void => {
  if (typeof window === 'undefined') return;

  try {
    const currentConsent = getConsent();
    const updatedConsent = { ...currentConsent, ...newConsent, necessary: true, marketing: false };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updatedConsent));
    // 触发全局事件，以便应用的其他部分可以响应变化
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: updatedConsent }));
  } catch (error) {
    console.error('无法保存Cookie同意设置:', error);
  }
};

/**
 * 检查用户是否已经做出了Cookie同意选择。
 * @returns {boolean} 如果用户已做出选择，则返回true。
 */
export const hasMadeChoice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
};

/**
 * 重置用户的Cookie同意选择，这将导致同意横幅再次显示。
 */
export const resetConsent = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    // 触发全局事件，以便应用的其他部分可以响应变化
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: DEFAULT_CONSENT }));
  } catch (error) {
    console.error('无法重置Cookie同意设置:', error);
  }
};
