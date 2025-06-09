// Global type definitions for Voidix Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    voidixAnalytics: {
      trackVoidixEvent: (eventName: string, parameters?: Record<string, any>) => void;
      trackServerStatus: (serverName: string, playerCount: number, isOnline: boolean) => void;
      trackBugReport: (reportType: string, severity: string) => void;
      trackFaqInteraction: (questionId: string, action: string) => void;
      trackPagePerformance: () => void;
      trackConnectionTest: (serverIP: string, latency: number, success: boolean) => void;
      track: (action: string, category?: string, label?: string, value?: number) => void;
    };
  }
}

export {};
