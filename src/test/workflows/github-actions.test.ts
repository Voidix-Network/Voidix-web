import { describe, expect, it } from 'vitest';
import {
    createTestConfig,
    generatePipelineSummaryScript,
    mockGitHubFormat,
    simulateBashExecution,
    validateBashSyntax,
    type PipelineSummaryConfig,
} from '../utils/workflowTestUtils';

describe('GitHub Actions Workflow Tests', () => {
  describe('Pipeline Summary Script Generation', () => {
    it('应该生成有效的bash脚本', () => {
      const config = createTestConfig.allSuccess();
      const script = generatePipelineSummaryScript(config);

      expect(script).toContain('echo "🎯 Code Quality Pipeline Results"');
      expect(script).toContain('echo "⚡ Quick Checks: success"');
      expect(script).toContain('echo "📊 Quality Analysis: success"');
      expect(script).toContain('echo "🧪 Test Suite: success"');
      expect(script).toContain('echo "🔒 Security Scan: success"');
      expect(script).toContain('echo "📜 License File Check: success"');
    });

    it('应该正确处理失败状态', () => {
      const config = createTestConfig.singleFailure('testSuite');
      const script = generatePipelineSummaryScript(config);

      expect(script).toContain('echo "🧪 Test Suite: failure"');
      expect(script).toContain('echo "⚡ Quick Checks: success"');
    });

    it('应该包含所有必要的bash元素', () => {
      const config = createTestConfig.allSuccess();
      const script = generatePipelineSummaryScript(config);

      expect(script).toContain('if [[');
      expect(script).toContain('then');
      expect(script).toContain('else');
      expect(script).toContain('fi');
      expect(script).toContain('exit 1');
    });
  });

  describe('Bash Syntax Validation', () => {
    it('应该验证有效的bash语法', () => {
      const validScript = `
if [[ "success" == "success" ]]; then
  echo "Test passed"
else
  echo "Test failed"
  exit 1
fi
      `.trim();

      const result = validateBashSyntax(validScript);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测缺少fi的错误', () => {
      const invalidScript = `
if [[ "success" == "success" ]]; then
  echo "Test passed"
else
  echo "Test failed"
      `.trim();

      const result = validateBashSyntax(invalidScript);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('if/fi'))).toBe(true);
    });

    it('应该检测缺少then的错误', () => {
      const invalidScript = `
if [[ "success" == "success" ]]
  echo "Test passed"
fi
      `.trim();

      const result = validateBashSyntax(invalidScript);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('then'))).toBe(true);
    });

    it('应该检测未闭合的条件括号', () => {
      const invalidScript = `
if [[ "success" == "success"
  echo "Test passed"
fi
      `.trim();

      const result = validateBashSyntax(invalidScript);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes(']]'))).toBe(true);
    });
  });

  describe('Script Execution Simulation', () => {
    it('应该正确模拟成功场景', () => {
      const config = createTestConfig.allSuccess();
      const result = simulateBashExecution(config);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🎯 Code Quality Pipeline Results');
      expect(result.output).toContain('🏆 Overall Status: ✅ PASSED');
      expect(result.output).toContain('✨ Code is ready for deployment');
    });

    it('应该正确模拟单个作业失败场景', () => {
      const config = createTestConfig.singleFailure('securityScan');
      const result = simulateBashExecution(config);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('🏆 Overall Status: ❌ FAILED');
      expect(result.output).toContain('⚠️ Some checks require attention');
      expect(result.output).toContain('❌ Security Scan failed - SECURITY ISSUES DETECTED');
    });

    it('应该正确模拟多个作业失败场景', () => {
      const config = createTestConfig.multipleFailures(['testSuite', 'qualityAnalysis']);
      const result = simulateBashExecution(config);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Test Suite failed');
      expect(result.output).toContain('❌ Quality Analysis failed');
      expect(result.output).not.toContain('❌ Quick Checks failed');
    });

  });

  describe('GitHub Format Function Simulation', () => {
    it('应该正确替换单个占位符', () => {
      const template = 'Hello {0}!';
      const result = mockGitHubFormat(template, 'World');
      expect(result).toBe('Hello World!');
    });

    it('应该正确替换多个占位符', () => {
      const template = '{0} + {1} = {2}';
      const result = mockGitHubFormat(template, '1', '2', '3');
      expect(result).toBe('1 + 2 = 3');
    });

    it('应该正确替换重复的占位符', () => {
      const template = '{0} and {0} again';
      const result = mockGitHubFormat(template, 'test');
      expect(result).toBe('test and test again');
    });
  });

  describe('Configuration Helpers', () => {
    it('createTestConfig.allSuccess 应该创建全成功配置', () => {
      const config = createTestConfig.allSuccess();

      expect(config.quickChecks).toBe('success');
      expect(config.qualityAnalysis).toBe('success');
      expect(config.testSuite).toBe('success');
      expect(config.securityScan).toBe('success');
    });

    it('createTestConfig.singleFailure 应该创建单个失败配置', () => {
      const config = createTestConfig.singleFailure('testSuite');

      expect(config.testSuite).toBe('failure');
      expect(config.quickChecks).toBe('success');
      expect(config.qualityAnalysis).toBe('success');
      expect(config.securityScan).toBe('success');
    });
  });

  describe('Real-world Scenario Tests', () => {
    it('应该处理完整的CI/CD管道成功场景', () => {
      const config: PipelineSummaryConfig = {
        quickChecks: 'success',
        qualityAnalysis: 'success',
        testSuite: 'success',
        securityScan: 'success',
      };

      const script = generatePipelineSummaryScript(config);
      const syntaxResult = validateBashSyntax(script);
      const executionResult = simulateBashExecution(config);

      // 验证语法正确
      expect(syntaxResult.isValid).toBe(true);
      expect(syntaxResult.errors).toHaveLength(0);

      // 验证执行结果
      expect(executionResult.exitCode).toBe(0);
      expect(executionResult.output).toContain('✅ PASSED');
      expect(executionResult.output).toContain('Code is ready for deployment');
    });

    it('应该处理安全扫描失败的严重场景', () => {
      const config = createTestConfig.singleFailure('securityScan');

      const script = generatePipelineSummaryScript(config);
      const syntaxResult = validateBashSyntax(script);
      const executionResult = simulateBashExecution(config);

      // 验证语法正确
      expect(syntaxResult.isValid).toBe(true);

      // 验证安全失败的严重性
      expect(executionResult.exitCode).toBe(1);
      expect(executionResult.output).toContain('SECURITY ISSUES DETECTED');
      expect(executionResult.output).toContain('❌ FAILED');
    });
  });
});
