// 示例：如何使用 @images 路径别名导入图片资源
// 文件路径: src/examples/ImageImportExamples.ts

// 1. 导入favicon图标
import faviconIco from '@images/favicon.ico';
import favicon16 from '@images/favicon-16x16.png';
import favicon32 from '@images/favicon-32x32.png';

// 2. 导入移动端图标
import androidChrome192 from '@images/android-chrome-192x192.png';
import androidChrome512 from '@images/android-chrome-512x512.png';
import appleTouchIcon from '@images/apple-touch-icon.png';

// 3. 导入Web应用清单
import webManifest from '@images/site.webmanifest';

// 使用示例
export const ImageAssets = {
  favicon: {
    ico: faviconIco,
    png16: favicon16,
    png32: favicon32,
  },
  mobile: {
    androidChrome192,
    androidChrome512,
    appleTouchIcon,
  },
  pwa: {
    manifest: webManifest,
  },
};

// 在React组件中使用示例：
/*
import { ImageAssets } from '@/examples/ImageImportExamples';

const MyComponent = () => {
  return (
    <div>
      <img src={ImageAssets.favicon.ico} alt="Voidix Logo" />
      <img src={ImageAssets.mobile.appleTouchIcon} alt="Apple Touch Icon" />
    </div>
  );
};
*/
