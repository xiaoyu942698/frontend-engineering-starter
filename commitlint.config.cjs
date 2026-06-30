module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ],
    'scope-enum': [
      2,
      'always',
      [
        'web',
        'ui',
        'contracts',
        'mock-api',
        'runtime',
        'adapter',
        'docs',
        'deps',
        'tooling',
        'config',
        'tests',
        'repo',
        'release'
      ]
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 120],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always']
  },
  prompt: {
    questions: {
      type: {
        description: '选择变更类型',
        enum: {
          feat: { description: '新增能力', title: 'Features', emoji: '' },
          fix: { description: '修复缺陷', title: 'Bug Fixes', emoji: '' },
          docs: { description: '文档变更', title: 'Documentation', emoji: '' },
          style: { description: '格式或样式，不改变行为', title: 'Styles', emoji: '' },
          refactor: { description: '重构，不新增能力或修复缺陷', title: 'Code Refactoring', emoji: '' },
          perf: { description: '性能优化', title: 'Performance Improvements', emoji: '' },
          test: { description: '测试相关', title: 'Tests', emoji: '' },
          build: { description: '构建系统或依赖', title: 'Builds', emoji: '' },
          ci: { description: 'CI 配置', title: 'Continuous Integrations', emoji: '' },
          chore: { description: '维护性变更', title: 'Chores', emoji: '' },
          revert: { description: '回滚变更', title: 'Reverts', emoji: '' }
        }
      }
    }
  }
};
