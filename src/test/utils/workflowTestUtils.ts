/**
 * GitHub Actions 工作流测试工具函数
 * 用于测试和验证CI/CD工作流的逻辑
 */

/**
 * 作业结果类型
 */
export type JobResult = 'success' | 'failure' | 'cancelled' | 'skipped';

/**
 * 管道总结配置
 */
export interface PipelineSummaryConfig {
  quickChecks: JobResult;
  qualityAnalysis: JobResult;
  testSuite: JobResult;
  securityScan: JobResult;
}

/**
 * 模拟GitHub Actions的format函数
 * 使用安全的字符串替换方法，避免正则表达式注入
 */
export function mockGitHubFormat(template: string, ...args: string[]): string {
  let result = template;
  args.forEach((arg, index) => {
    const placeholder = `{${index}}`;
    // 使用安全的字符串替换，避免RegExp构造函数的安全风险
    while (result.includes(placeholder)) {
      result = result.replace(placeholder, arg);
    }
  });
  return result;
}

/**
 * 生成管道总结脚本
 */
export function generatePipelineSummaryScript(config: PipelineSummaryConfig): string {
  const template = `echo "🎯 Code Quality Pipeline Results"
echo "================================"
echo "⚡ Quick Checks: {0}"
echo "📊 Quality Analysis: {1}"
echo "🧪 Test Suite: {2}"
echo "🔒 Security Scan: {3}"
echo "📜 License File Check: {4}"
echo ""

if [[ "{5}" == "success" && \\
      "{6}" == "success" && \\
      "{7}" == "success" && \\
      "{8}" == "success" && \\
      "{9}" == "success" ]]; then
  echo "🏆 Overall Status: ✅ PASSED"
  echo "✨ Code is ready for deployment"
else
  echo "🏆 Overall Status: ❌ FAILED"
  echo "⚠️ Some checks require attention"

  if [[ "{10}" != "success" ]]; then
    echo "   ❌ Quick Checks failed"
  fi
  if [[ "{11}" != "success" ]]; then
    echo "   ❌ Quality Analysis failed"
  fi
  if [[ "{12}" != "success" ]]; then
    echo "   ❌ Test Suite failed"
  fi
  if [[ "{13}" != "success" ]]; then
    echo "   ❌ Security Scan failed - SECURITY ISSUES DETECTED"
  fi

  exit 1
fi

echo ""
echo "📅 Pipeline completed at: $(date)"`;

  return mockGitHubFormat(
    template,
    config.quickChecks, // {0}
    config.qualityAnalysis, // {1}
    config.testSuite, // {2}
    config.securityScan, // {3}
    config.quickChecks, // {4}
    config.qualityAnalysis, // {5}
    config.testSuite, // {6}
    config.securityScan, // {7}
    config.quickChecks, // {8}
    config.qualityAnalysis, // {9}
    config.testSuite, // {10}
    config.securityScan // {11}
  );
}

/**
 * 验证Bash脚本语法
 */
export function validateBashSyntax(script: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = script.split('\n');

  let ifCount = 0;
  let fiCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;

    if (line.startsWith('if ')) {
      ifCount++;

      // 检查if语句格式 - 处理多行条件
      if (!line.includes('then') && !line.endsWith('; then')) {
        // 对于多行条件，需要查找整个条件块直到找到 then
        let foundThen = false;
        let foundClosing = false;

        // 如果有 [[，需要先找到对应的 ]]
        if (line.includes('[[') && !line.includes(']]')) {
          for (let j = i + 1; j < lines.length && j < i + 10; j++) {
            const checkLine = lines[j].trim();
            if (checkLine.includes(']]')) {
              foundClosing = true;
              // 找到 ]] 后，检查是否在同一行或后续行有 then
              if (checkLine.includes('then') || checkLine.endsWith('; then')) {
                foundThen = true;
              } else {
                // 检查下一行是否有 then
                const nextLine = lines[j + 1]?.trim() || '';
                if (nextLine.includes('then')) {
                  foundThen = true;
                }
              }
              break;
            }
          }

          if (!foundClosing) {
            errors.push(`Line ${lineNumber}: missing closing ']]' in condition`);
          }
          if (!foundThen) {
            errors.push(`Line ${lineNumber}: if statement missing 'then'`);
          }
        } else {
          // 简单条件，检查下一行
          const nextLine = lines[i + 1]?.trim() || '';
          if (!nextLine.includes('then')) {
            errors.push(`Line ${lineNumber}: if statement missing 'then'`);
          }
        }
      }
    }

    if (line === 'fi') {
      fiCount++;
    }
  }

  // 检查if/fi匹配
  if (ifCount !== fiCount) {
    errors.push(`Mismatched if/fi statements: ${ifCount} if statements, ${fiCount} fi statements`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 简化的bash脚本执行模拟
 */
export function simulateBashExecution(config: PipelineSummaryConfig): {
  output: string;
  exitCode: number;
} {
  // 检查主要条件：所有作业是否都成功
  const allSuccess = Object.values(config).every(status => status === 'success');

  const output: string[] = [];

  // 添加基本输出
  output.push('🎯 Code Quality Pipeline Results');
  output.push('================================');
  output.push(`⚡ Quick Checks: ${config.quickChecks}`);
  output.push(`📊 Quality Analysis: ${config.qualityAnalysis}`);
  output.push(`🧪 Test Suite: ${config.testSuite}`);
  output.push(`🔒 Security Scan: ${config.securityScan}`);
  output.push('');

  if (allSuccess) {
    output.push('🏆 Overall Status: ✅ PASSED');
    output.push('✨ Code is ready for deployment');
    return { output: output.join('\n'), exitCode: 0 };
  } else {
    output.push('🏆 Overall Status: ❌ FAILED');
    output.push('⚠️ Some checks require attention');

    // 添加失败详情
    if (config.quickChecks !== 'success') {
      output.push('   ❌ Quick Checks failed');
    }
    if (config.qualityAnalysis !== 'success') {
      output.push('   ❌ Quality Analysis failed');
    }
    if (config.testSuite !== 'success') {
      output.push('   ❌ Test Suite failed');
    }
    if (config.securityScan !== 'success') {
      output.push('   ❌ Security Scan failed - SECURITY ISSUES DETECTED');
    }

    return { output: output.join('\n'), exitCode: 1 };
  }
}

/**
 * 创建测试配置的便捷函数
 */
export const createTestConfig = {
  allSuccess: (): PipelineSummaryConfig => ({
    quickChecks: 'success',
    qualityAnalysis: 'success',
    testSuite: 'success',
    securityScan: 'success',
  }),

  singleFailure: (failedJob: keyof PipelineSummaryConfig): PipelineSummaryConfig => ({
    quickChecks: 'success',
    qualityAnalysis: 'success',
    testSuite: 'success',
    securityScan: 'success',
    [failedJob]: 'failure',
  }),

  multipleFailures: (failedJobs: (keyof PipelineSummaryConfig)[]): PipelineSummaryConfig => {
    const config = createTestConfig.allSuccess();
    failedJobs.forEach(job => {
      config[job] = 'failure';
    });
    return config;
  },

  allFailure: (): PipelineSummaryConfig => ({
    quickChecks: 'failure',
    qualityAnalysis: 'failure',
    testSuite: 'failure',
    securityScan: 'failure',
  }),
};
