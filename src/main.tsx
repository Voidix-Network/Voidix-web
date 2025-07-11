import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './assets/globals.css';
import { logBrandMessage } from './utils/brandConsole.ts';

// 在开发模式下打印品牌信息到控制台
logBrandMessage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
