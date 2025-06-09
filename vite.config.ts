/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // 生产环境使用绝对路径，开发环境使用相对路径
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
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
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
      },
    },
  },
});
