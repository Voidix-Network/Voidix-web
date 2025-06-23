import React, { useEffect } from 'react';

interface MicrosoftClarityProps {
  projectId: string;
  enableDebug?: boolean;
  hasConsented?: boolean;
}

const MicrosoftClarity: React.FC<MicrosoftClarityProps> = ({
  projectId,
  enableDebug = false,
  hasConsented = false,
}) => {
  useEffect(() => {
    if (!projectId || !hasConsented) {
      console.log(
        '[MicrosoftClarity] Clarity not initialized: Missing projectId or consent not given.'
      );
      return;
    }

    console.log(
      `[MicrosoftClarity] Initializing Clarity with Project ID: ${projectId}, Debug Mode: ${enableDebug}`
    );

    const scriptId = 'microsoft-clarity-script';
    if (document.getElementById(scriptId)) {
      console.log('[MicrosoftClarity] Clarity script already exists, skipping re-initialization.');
      return;
    }

    (function (c: any, l: any, a: any, r: any, i: any) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      const t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      const y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', projectId);

    if (enableDebug) {
      // @ts-ignore
      if (window.clarity) {
        // @ts-ignore
        window.clarity('set', 'debugMode', true);
        console.log('[MicrosoftClarity] Debug mode enabled for Clarity.');
      } else {
        console.warn('[MicrosoftClarity] window.clarity not available to set debug mode.');
      }
    }

    return () => {
      // Clean up script if component unmounts - though unlikely for analytics
      const scriptElement = document.getElementById(scriptId);
      if (scriptElement) {
        scriptElement.remove();
      }
      // Resetting clarity object might be complex and not strictly necessary for SPAs
    };
  }, [projectId, enableDebug, hasConsented]);

  return null;
};

export default MicrosoftClarity;
