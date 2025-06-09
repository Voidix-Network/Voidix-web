import { describe, it, expect } from 'vitest';

/**
 * CodeQL SARIF 结果解析测试
 * 测试CodeQL结果检查逻辑，确保Medium+问题会导致工作流失败
 */

// 模拟SARIF结果结构
interface SARIFResult {
  level?: 'error' | 'warning' | 'note';
  properties?: {
    severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  };
  message: {
    text: string;
  };
}

interface SARIFRun {
  results: SARIFResult[];
}

interface SARIFReport {
  runs: SARIFRun[];
}

/**
 * 模拟CodeQL SARIF结果分析函数
 */
function analyzeCodeQLResults(sarif: SARIFReport): {
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  shouldFail: boolean;
  summary: string;
} {
  const allResults = sarif.runs.flatMap(run => run.results);

  const criticalCount = allResults.filter(
    result =>
      result.level === 'error' ||
      (result.properties?.severity &&
        ['critical', 'high', 'medium'].includes(result.properties.severity))
  ).length;

  const warningCount = allResults.filter(result => result.level === 'warning').length;

  const shouldFail = criticalCount > 0;

  let summary = '';
  if (criticalCount > 0) {
    summary = `❌ SECURITY ALERT: Found ${criticalCount} Critical/High/Medium severity issues!`;
  } else if (warningCount > 0) {
    summary = `⚠️ Found ${warningCount} Warning level issues (not blocking)`;
  } else {
    summary = '🎉 No security issues detected - CodeQL analysis passed!';
  }

  return {
    totalIssues: allResults.length,
    criticalCount,
    warningCount,
    shouldFail,
    summary,
  };
}

/**
 * 创建测试用的SARIF报告
 */
function createSARIF(results: SARIFResult[]): SARIFReport {
  return {
    runs: [
      {
        results,
      },
    ],
  };
}

describe('CodeQL SARIF Results Analysis', () => {
  describe('安全严重性检查', () => {
    it('应该检测Critical级别问题并失败', () => {
      const sarif = createSARIF([
        {
          level: 'error',
          properties: { severity: 'critical' },
          message: { text: 'Critical security vulnerability detected' },
        },
      ]);

      const result = analyzeCodeQLResults(sarif);

      expect(result.shouldFail).toBe(true);
      expect(result.criticalCount).toBe(1);
      expect(result.summary).toContain('SECURITY ALERT');
      expect(result.summary).toContain('Critical/High/Medium');
    });

    it('应该检测Medium级别问题并失败', () => {
      const sarif = createSARIF([
        {
          level: 'warning',
          properties: { severity: 'medium' },
          message: { text: 'Medium severity security issue' },
        },
      ]);

      const result = analyzeCodeQLResults(sarif);

      expect(result.shouldFail).toBe(true);
      expect(result.criticalCount).toBe(1);
      expect(result.summary).toContain('SECURITY ALERT');
    });

    it('应该检测Warning级别但不失败', () => {
      const sarif = createSARIF([
        {
          level: 'warning',
          properties: { severity: 'low' },
          message: { text: 'Low severity warning' },
        },
      ]);

      const result = analyzeCodeQLResults(sarif);

      expect(result.shouldFail).toBe(false);
      expect(result.warningCount).toBe(1);
      expect(result.criticalCount).toBe(0);
      expect(result.summary).toContain('Warning level issues');
      expect(result.summary).toContain('not blocking');
    });
  });

  describe('边界情况', () => {
    it('应该处理空结果', () => {
      const sarif = createSARIF([]);

      const result = analyzeCodeQLResults(sarif);

      expect(result.totalIssues).toBe(0);
      expect(result.criticalCount).toBe(0);
      expect(result.warningCount).toBe(0);
      expect(result.shouldFail).toBe(false);
      expect(result.summary).toContain('No security issues detected');
    });

    it('应该模拟Incomplete string escaping问题（Medium级别）', () => {
      const sarif = createSARIF([
        {
          level: 'warning',
          properties: { severity: 'medium' },
          message: { text: 'Incomplete string escaping or encoding' },
        },
      ]);

      const result = analyzeCodeQLResults(sarif);

      expect(result.shouldFail).toBe(true);
      expect(result.criticalCount).toBe(1);
      expect(result.summary).toContain('SECURITY ALERT');
      expect(result.summary).toContain('1 Critical/High/Medium');
    });
  });
});
