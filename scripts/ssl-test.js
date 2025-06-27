#!/usr/bin/env node

/**
 * SSL/TLS 安全配置测试工具
 * 用于验证nginx SSL配置是否符合A+评级要求
 */

import { exec } from 'child_process';
import https from 'https';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 测试目标
const TARGETS = [
  { name: '主站', url: 'https://www.voidix.net' },
  { name: 'CDN', url: 'https://cdn.voidix.net' }
];

// SSL Labs API测试函数
async function checkSSLLabs(hostname) {
  console.log(`\n🔒 检测 ${hostname} 的SSL评级...`);

  try {
    const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${hostname}&publish=off&startNew=on&all=done`);
    const data = await response.json();

    if (data.status === 'READY') {
      const grade = data.endpoints?.[0]?.grade || 'Unknown';
      console.log(`✅ SSL Labs评级: ${grade}`);
      return grade;
    } else {
      console.log(`⏳ 状态: ${data.status} - 需要等待分析完成`);
      return data.status;
    }
  } catch (error) {
    console.error(`❌ SSL Labs检测失败: ${error.message}`);
    return 'Error';
  }
}

// 本地SSL连接测试
async function testSSLConnection(url) {
  const hostname = new URL(url).hostname;
  console.log(`\n🔗 测试 ${hostname} 的SSL连接...`);

  return new Promise((resolve) => {
    const options = {
      hostname,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000,
      secureProtocol: 'TLSv1_2_method' // 强制使用TLS 1.2
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      const cipher = res.socket.getCipher();

      console.log(`✅ 连接成功`);
      console.log(`📋 协议: ${res.socket.getProtocol()}`);
      console.log(`🔐 密码套件: ${cipher.name}`);
      console.log(`🔑 密钥交换: ${cipher.version}`);
      console.log(`📅 证书有效期: ${cert.valid_from} - ${cert.valid_to}`);
      console.log(`🏢 证书颁发者: ${cert.issuer.CN}`);

      // 检查前向保密
      const hasFS = cipher.name.startsWith('ECDHE-') || cipher.name.startsWith('DHE-');
      console.log(`🛡️ 前向保密: ${hasFS ? '✅ 支持' : '❌ 不支持'}`);

      resolve({
        success: true,
        protocol: res.socket.getProtocol(),
        cipher: cipher.name,
        forwardSecrecy: hasFS,
        certValid: new Date(cert.valid_to) > new Date()
      });
    });

    req.on('error', (error) => {
      console.error(`❌ 连接失败: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      console.error(`❌ 连接超时`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

// 使用openssl测试密码套件
async function testCipherSuites(hostname) {
  console.log(`\n🔍 测试 ${hostname} 支持的密码套件...`);

  const ciphers = [
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256'
  ];

  const results = [];

  for (const cipher of ciphers) {
    try {
      const { stdout } = await execAsync(
        `echo | openssl s_client -connect ${hostname}:443 -cipher ${cipher} -brief 2>/dev/null | head -1`
      );

      if (stdout.includes('Cipher is') && !stdout.includes('0000')) {
        console.log(`✅ ${cipher}`);
        results.push({ cipher, supported: true });
      } else {
        console.log(`❌ ${cipher}`);
        results.push({ cipher, supported: false });
      }
    } catch (error) {
      console.log(`❓ ${cipher} - 测试失败`);
      results.push({ cipher, supported: false, error: error.message });
    }
  }

  return results;
}

// TLS 1.3测试
async function testTLS13(hostname) {
  console.log(`\n🚀 测试 ${hostname} 的TLS 1.3支持...`);

  try {
    const { stdout } = await execAsync(
      `echo | openssl s_client -connect ${hostname}:443 -tls1_3 -brief 2>/dev/null`
    );

    if (stdout.includes('TLSv1.3')) {
      console.log(`✅ TLS 1.3 支持`);
      return true;
    } else {
      console.log(`❌ TLS 1.3 不支持`);
      return false;
    }
  } catch (error) {
    console.log(`❓ TLS 1.3 测试失败: ${error.message}`);
    return false;
  }
}

// HSTS测试
async function testHSTS(url) {
  const hostname = new URL(url).hostname;
  console.log(`\n🔒 测试 ${hostname} 的HSTS配置...`);

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const hsts = response.headers.get('strict-transport-security');

    if (hsts) {
      console.log(`✅ HSTS头部: ${hsts}`);

      const maxAge = hsts.match(/max-age=(\d+)/)?.[1];
      const includeSubDomains = hsts.includes('includeSubDomains');
      const preload = hsts.includes('preload');

      console.log(`📅 最大期限: ${maxAge ? Math.floor(maxAge / 86400 / 365) : 0}年`);
      console.log(`🌐 包含子域名: ${includeSubDomains ? '✅' : '❌'}`);
      console.log(`🚀 预加载支持: ${preload ? '✅' : '❌'}`);

      return { hasHSTS: true, maxAge, includeSubDomains, preload };
    } else {
      console.log(`❌ 未发现HSTS头部`);
      return { hasHSTS: false };
    }
  } catch (error) {
    console.error(`❌ HSTS测试失败: ${error.message}`);
    return { hasHSTS: false, error: error.message };
  }
}

// 综合评分
function calculateGrade(results) {
  let score = 100;

  // SSL连接基础分
  if (!results.sslConnection.success) score -= 30;

  // 前向保密
  if (!results.sslConnection.forwardSecrecy) score -= 20;

  // TLS 1.3支持
  if (!results.tls13) score -= 10;

  // HSTS配置
  if (!results.hsts.hasHSTS) score -= 15;
  else {
    if (!results.hsts.includeSubDomains) score -= 5;
    if (!results.hsts.preload) score -= 5;
    if (results.hsts.maxAge < 31536000) score -= 5; // 少于1年
  }

  // 密码套件支持
  const supportedCiphers = results.cipherSuites.filter(c => c.supported).length;
  if (supportedCiphers < 4) score -= 10;

  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// 主函数
async function main() {
  console.log('🔒 SSL/TLS 安全配置测试工具');
  console.log('=====================================');

  for (const target of TARGETS) {
    console.log(`\n📊 测试目标: ${target.name} (${target.url})`);
    console.log('=====================================');

    const hostname = new URL(target.url).hostname;

    // 执行所有测试
    const sslConnection = await testSSLConnection(target.url);
    const cipherSuites = await testCipherSuites(hostname);
    const tls13 = await testTLS13(hostname);
    const hsts = await testHSTS(target.url);

    // 汇总结果
    const results = {
      sslConnection,
      cipherSuites,
      tls13,
      hsts
    };

    // 计算评级
    const grade = calculateGrade(results);

    console.log(`\n📊 综合评级: ${grade}`);
    console.log(`🎯 推荐: ${grade === 'A+' ? '✅ 配置完美' : '⚠️ 需要优化'}`);

    // SSL Labs在线测试提示
    console.log(`\n🌐 在线测试: https://www.ssllabs.com/ssltest/analyze.html?d=${hostname}&latest`);
  }

  console.log('\n✨ 测试完成！');
}

// 运行测试
main().catch(console.error);
