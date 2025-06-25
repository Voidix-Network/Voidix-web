/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { constants as zlibConstants } from 'zlib';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip 压缩 - 最广泛的兼容性
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      compressionOptions: {
        level: 9, // 最高压缩级别
      },
      filter: /\.(js|css|html|xml|txt|svg|json)$/,
      deleteOriginFile: false, // 保留原文件用于内容协商
    }),
    // Brotli 压缩 - 更好的压缩率
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      compressionOptions: {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 11, // 最高质量
          [zlibConstants.BROTLI_PARAM_SIZE_HINT]: 0,
        },
      },
      filter: /\.(js|css|html|xml|txt|svg|json)$/,
      deleteOriginFile: false,
    }),
  ], // 生产环境使用绝对路径，开发环境使用相对路径
  base: process.env.NODE_ENV === 'production' ? '/' : './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@images': path.resolve(__dirname, './src/assets/images'),
    },
  },
  // Vitest配置
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // 隐藏调试输出，保持简洁
    silent: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'scripts/', // 排除构建脚本目录
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
        '.{idea,git,cache,output,temp}/',
        '{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      ],
    },
  },
  server: {
    port: 3000,
    host: true,
    // 中间件配置 - 正确处理404
    middlewareMode: false,
    // 开发服务器404处理
    proxy: {},
  },
  preview: {
    port: 4173,
    host: true,
    // 预览服务器404处理 - 静态文件404返回真正的404
    open: false,
  },  build: {
    outDir: 'dist',
    sourcemap: true,
    // 启用更激进的压缩和优化
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console.log和debugger（保留console.error）
        drop_console: ['log', 'debug', 'info', 'warn'],
        drop_debugger: true,
        // 移除未使用的代码
        dead_code: true,
        // 优化条件语句
        conditionals: true,
      },
      format: {
        // 移除所有注释（保留许可证注释）
        comments: /^\**!|@preserve|@license|@cc_on/i,
        // 最大化压缩
        beautify: false,
        // 移除不必要的引号
        quote_style: 3,
      },
      mangle: {
        // 混淆变量名（但保留保留字）
        reserved: ['$', 'jQuery', 'React', 'ReactDOM'],
      },
    },
    rollupOptions: {
      output: {
        // 使用hash文件名，确保新版本立即更新
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animation: ['framer-motion'],
          state: ['zustand'],
        },
        // 压缩输出
        compact: true,
      },
    },
    // 启用CSS压缩
    cssCodeSplit: true,
    // 设置chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
  },
});
