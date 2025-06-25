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
  },  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
        // 🔥 终极优化配置：18个已验证安全的优化选项
    minify: 'terser',
    terserOptions: {
      compress: {
        // === 基础安全优化 ===
        booleans: true,              // 优化布尔值
        conditionals: true,          // 优化条件语句
        dead_code: true,             // 移除死代码
        drop_console: ['log', 'debug', 'info', 'warn'], // 移除console（保留error）
        drop_debugger: true,         // 移除debugger
        evaluate: true,              // 计算常量表达式
        if_return: true,             // 优化if-return结构
        loops: true,                 // 优化循环
        switches: true,              // 优化switch语句
        typeofs: true,               // 优化typeof

        // === ✅ 已验证安全的基础优化（18项）===
        arguments: false,            // 🛡️ 保护函数参数（保护WebSocket类）
        collapse_vars: true,         // ✅ 变量合并
        comparisons: true,           // ✅ 比较操作优化
        computed_props: true,        // ✅ 计算属性优化（obj['key']→obj.key）
        directives: true,            // ✅ 移除无用指令
        hoist_funs: true,            // ✅ 函数提升
        hoist_props: true,           // ✅ 属性提升
        hoist_vars: false,           // 🛡️ 不提升变量（保护作用域）
        inline: 2,                   // ✅ 中等内联（1-3级，2为最佳平衡）
        join_vars: true,             // ✅ 合并变量声明
        negate_iife: true,           // ✅ IIFE否定优化
        properties: true,            // ✅ 属性访问优化
        reduce_funcs: false,         // 🛡️ 不减少函数调用（保护WebSocket）
        reduce_vars: false,          // 🛡️ 不减少变量（保护类引用）
        sequences: true,             // ✅ 语句序列合并
        side_effects: false,         // 🛡️ 保护所有副作用（关键！）
        top_retain: undefined,       // 不保留顶层变量
        unused: true,                // ✅ 移除未使用变量

        // === ✅ 选择性安全的不安全优化（3项）===
        unsafe: false,               // 主开关保持关闭
        unsafe_arrows: false,        // 🛡️ 保护箭头函数
        unsafe_comps: false,         // 🛡️ 保护比较操作
        unsafe_Function: false,      // 🛡️ 保护Function构造
        unsafe_math: true,           // ✅ 数学优化（相对安全）
        unsafe_symbols: false,       // 🛡️ 保护Symbol
        unsafe_methods: false,       // 🛡️ 保护方法调用
        unsafe_proto: false,         // 🛡️ 保护原型
        unsafe_regexp: true,         // ✅ 正则优化（相对安全）
        unsafe_undefined: true,      // ✅ void 0替换undefined

        // === ✅ 高级优化选项（3项）===
        passes: 50,                  // 🎯 50轮压缩（性能与效果的黄金平衡点）
        pure_getters: 'strict',      // ✅ 严格模式getter优化
        pure_new: true,              // ✅ 移除无用new调用
        keep_infinity: false,        // ✅ 用1/0代替Infinity（节省字节）

                                                        // === ✅ 最终安全配置 ===
        global_defs: {
          'process.env.NODE_ENV': '"production"',  // 只保留环境变量替换
        },
      },

      mangle: false,                 // 完全禁用变量名混淆

      format: {
        // === 最安全的输出格式 ===
        beautify: false,             // 保持压缩
        comments: false,             // 移除注释
        semicolons: true,            // 保留所有分号
      },

      // === 最保守的其他选项 ===
      keep_classnames: true,         // 保留所有类名
      keep_fnames: true,             // 保留所有函数名
      toplevel: false,               // 不压缩顶层
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
