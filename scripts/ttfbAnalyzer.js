#!/usr/bin/env node

/**
 * 🔥 TTFB性能分析器 - 诊断150ms延迟问题
 * 分析各个阶段的时间消耗，定位性能瓶颈
 */



import dns from 'dns';
import http from 'http';
import https from 'https';
import net from 'net';
import { performance } from 'perf_hooks';
import tls from 'tls';

const { promises: dnsPromises } = dns;

class TTFBAnalyzer {
    constructor(url) {
        this.url = new URL(url);
        this.results = {};
    }

    async analyze() {
        console.log('🔥 TTFB性能分析开始...\n');

        // 1. DNS解析时间
        await this.measureDNS();

        // 2. TCP连接时间
        await this.measureConnection();

        // 3. SSL握手时间（HTTPS）
        if (this.url.protocol === 'https:') {
            await this.measureSSL();
        }

        // 4. 服务器响应时间
        await this.measureServerResponse();

        // 5. 完整请求分析
        await this.measureFullRequest();

        this.printResults();
        this.provideRecommendations();
    }

    async measureDNS() {
        const start = performance.now();
        try {
            const addresses = await dnsPromises.lookup(this.url.hostname);
            this.results.dns = performance.now() - start;
            console.log(`🔍 DNS解析: ${this.results.dns.toFixed(2)}ms -> ${addresses.address}`);
        } catch (error) {
            this.results.dns = -1;
            console.log(`❌ DNS解析失败: ${error.message}`);
        }
    }

        async measureConnection() {
        return new Promise((resolve) => {
            const start = performance.now();
            const port = this.url.port || (this.url.protocol === 'https:' ? 443 : 80);

            // 对于TCP连接测试，我们只测量到端口的连接时间
            const socket = new net.Socket();

            socket.connect(port, this.url.hostname, () => {
                this.results.connection = performance.now() - start;
                console.log(`🔌 TCP连接: ${this.results.connection.toFixed(2)}ms`);
                socket.destroy();
                resolve();
            });

            socket.on('error', (error) => {
                this.results.connection = -1;
                console.log(`❌ TCP连接失败: ${error.message}`);
                resolve();
            });

            socket.setTimeout(5000, () => {
                this.results.connection = 5000;
                console.log(`⏱️ TCP连接超时`);
                socket.destroy();
                resolve();
            });
        });
    }

    async measureSSL() {
        return new Promise((resolve) => {
            const start = performance.now();
            const socket = tls.connect({
                host: this.url.hostname,
                port: this.url.port || 443,
                servername: this.url.hostname
            }, () => {
                this.results.ssl = performance.now() - start;
                console.log(`🔒 SSL握手: ${this.results.ssl.toFixed(2)}ms`);
                socket.destroy();
                resolve();
            });

            socket.on('error', (error) => {
                this.results.ssl = -1;
                console.log(`❌ SSL握手失败: ${error.message}`);
                resolve();
            });
        });
    }

    async measureServerResponse() {
        return new Promise((resolve) => {
            const start = performance.now();
            const lib = this.url.protocol === 'https:' ? https : http;

            const req = lib.request({
                hostname: this.url.hostname,
                port: this.url.port,
                path: this.url.pathname,
                method: 'HEAD'
            }, (res) => {
                this.results.serverResponse = performance.now() - start;
                console.log(`⚡ 服务器响应: ${this.results.serverResponse.toFixed(2)}ms`);
                console.log(`📊 状态码: ${res.statusCode}`);
                console.log(`🚀 HTTP版本: ${res.httpVersion}`);
                resolve();
            });

            req.on('error', (error) => {
                this.results.serverResponse = -1;
                console.log(`❌ 服务器响应失败: ${error.message}`);
                resolve();
            });

            req.setTimeout(5000, () => {
                this.results.serverResponse = 5000;
                console.log(`⏱️ 服务器响应超时`);
                req.destroy();
                resolve();
            });

            req.end();
        });
    }

    async measureFullRequest() {
        return new Promise((resolve) => {
            const start = performance.now();
            const lib = this.url.protocol === 'https:' ? https : http;

            const req = lib.request({
                hostname: this.url.hostname,
                port: this.url.port,
                path: this.url.pathname,
                headers: {
                    'User-Agent': 'TTFB-Analyzer/1.0',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache'
                }
            }, (res) => {
                const ttfb = performance.now() - start;
                this.results.ttfb = ttfb;

                let dataSize = 0;
                const downloadStart = performance.now();

                res.on('data', (chunk) => {
                    dataSize += chunk.length;
                });

                res.on('end', () => {
                    this.results.download = performance.now() - downloadStart;
                    this.results.totalSize = dataSize;

                    console.log(`\n🎯 完整请求分析:`);
                    console.log(`   TTFB: ${ttfb.toFixed(2)}ms`);
                    console.log(`   下载: ${this.results.download.toFixed(2)}ms`);
                    console.log(`   总大小: ${(dataSize / 1024).toFixed(2)}KB`);

                    resolve();
                });
            });

            req.on('error', (error) => {
                console.log(`❌ 完整请求失败: ${error.message}`);
                resolve();
            });

            req.setTimeout(10000, () => {
                console.log(`⏱️ 完整请求超时`);
                req.destroy();
                resolve();
            });

            req.end();
        });
    }

    printResults() {
        console.log('\n📈 TTFB分析结果:');
        console.log('================================');

        const total = (this.results.dns || 0) +
                     (this.results.connection || 0) +
                     (this.results.ssl || 0) +
                     (this.results.serverResponse || 0);

        if (this.results.dns > 0) {
            console.log(`DNS解析:     ${this.results.dns.toFixed(2)}ms (${((this.results.dns/total)*100).toFixed(1)}%)`);
        }
        if (this.results.connection > 0) {
            console.log(`TCP连接:     ${this.results.connection.toFixed(2)}ms (${((this.results.connection/total)*100).toFixed(1)}%)`);
        }
        if (this.results.ssl > 0) {
            console.log(`SSL握手:     ${this.results.ssl.toFixed(2)}ms (${((this.results.ssl/total)*100).toFixed(1)}%)`);
        }
        if (this.results.serverResponse > 0) {
            console.log(`服务器响应:   ${this.results.serverResponse.toFixed(2)}ms (${((this.results.serverResponse/total)*100).toFixed(1)}%)`);
        }

        console.log(`─────────────────────────────────`);
        console.log(`总TTFB:      ${total.toFixed(2)}ms`);

        if (this.results.ttfb) {
            console.log(`实测TTFB:    ${this.results.ttfb.toFixed(2)}ms`);
        }
    }

    provideRecommendations() {
        console.log('\n🔧 优化建议:');
        console.log('================================');

        if (this.results.dns > 30) {
            console.log('🔍 DNS解析过慢 (>30ms):');
            console.log('   • 使用CDN减少DNS查询');
            console.log('   • 启用DNS预解析');
            console.log('   • 使用更快的DNS服务器');
        }

        if (this.results.connection > 50) {
            console.log('🔌 TCP连接过慢 (>50ms):');
            console.log('   • 启用HTTP/2多路复用');
            console.log('   • 使用CDN就近连接');
            console.log('   • 优化nginx连接配置');
        }

        if (this.results.ssl > 50) {
            console.log('🔒 SSL握手过慢 (>50ms):');
            console.log('   • 使用ECC证书替代RSA');
            console.log('   • 启用SSL会话复用');
            console.log('   • 启用TLS 1.3');
        }

        if (this.results.serverResponse > 100) {
            console.log('⚡ 服务器响应过慢 (>100ms):');
            console.log('   • 优化nginx缓冲区配置');
            console.log('   • 启用页面缓存');
            console.log('   • 优化静态资源压缩');
            console.log('   • 检查服务器资源使用率');
        }

        const totalTTFB = this.results.ttfb || this.results.serverResponse || 0;
        if (totalTTFB > 150) {
            console.log('\n🎯 针对150ms+ TTFB的关键优化:');
            console.log('   • 立即应用nginx TTFB优化配置');
            console.log('   • 启用页面专用资源系统');
            console.log('   • 检查服务器IO性能');
            console.log('   • 考虑使用Redis/Memcached缓存');
        }
    }
}

// 命令行执行
const url = process.argv[2] || 'https://www.voidix.net';
console.log(`🔥 开始分析网站: ${url}`);
const analyzer = new TTFBAnalyzer(url);
analyzer.analyze().catch(console.error);

export default TTFBAnalyzer;
