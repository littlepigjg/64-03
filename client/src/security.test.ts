import assert from 'node:assert/strict';
import {
  nextSortState,
  setSearchState,
  setRegistryState,
  setSourceState,
  setPageState,
  getGradeStyle,
  getScoreColor,
  getScoreBgClass,
  getScoreTextClass,
  getScoreWord,
  SCORE_DIMENSION_LABELS,
  type FilterState,
  type SortBy,
  type SortOrder,
  type GradeStyle,
} from './security';

function describe(label: string, fn: () => void) {
  console.log(`\n  ${label}`);
  fn();
}

function it(label: string, fn: () => void) {
  try {
    fn();
    console.log(`    ✅ ${label}`);
  } catch (e) {
    console.error(`    ❌ ${label}`);
    throw e;
  }
}

function createDefaultState(overrides: Partial<FilterState> = {}): FilterState {
  return {
    search: '',
    registry: '',
    source: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
    ...overrides,
  };
}

describe('筛选状态 - 搜索 (setSearchState)', () => {
  it('搜索关键词变化时，页码必须重置为 1', () => {
    const state = createDefaultState({ page: 5, search: '' });
    const next = setSearchState(state, 'react');
    assert.equal(next.search, 'react');
    assert.equal(next.page, 1);
  });

  it('在第 100 页输入搜索内容，必须回到第 1 页', () => {
    const state = createDefaultState({ page: 100 });
    const next = setSearchState(state, 'lodash');
    assert.equal(next.page, 1);
  });

  it('搜索内容不变时，返回同一对象引用，不改变页码', () => {
    const state = createDefaultState({ page: 3, search: 'vue' });
    const next = setSearchState(state, 'vue');
    assert.strictEqual(next, state);
    assert.equal(next.page, 3);
  });

  it('清空搜索内容时，页码重置为 1', () => {
    const state = createDefaultState({ page: 5, search: 'angular' });
    const next = setSearchState(state, '');
    assert.equal(next.search, '');
    assert.equal(next.page, 1);
  });

  it('搜索变化时，保留其他筛选条件不变', () => {
    const state = createDefaultState({
      page: 10,
      registry: 'npm',
      source: 'cache',
      sortBy: 'downloads',
      sortOrder: 'asc',
    });
    const next = setSearchState(state, 'test');
    assert.equal(next.registry, 'npm');
    assert.equal(next.source, 'cache');
    assert.equal(next.sortBy, 'downloads');
    assert.equal(next.sortOrder, 'asc');
    assert.equal(next.page, 1);
  });
});

describe('筛选状态 - 仓库 (setRegistryState)', () => {
  it('切换仓库时，页码必须重置为 1', () => {
    const state = createDefaultState({ page: 7, registry: '' });
    const next = setRegistryState(state, 'npm');
    assert.equal(next.registry, 'npm');
    assert.equal(next.page, 1);
  });

  it('从 npm 切换到 pypi，页码重置为 1', () => {
    const state = createDefaultState({ page: 8, registry: 'npm' });
    const next = setRegistryState(state, 'pypi');
    assert.equal(next.registry, 'pypi');
    assert.equal(next.page, 1);
  });

  it('仓库不变时，返回同一对象引用，不改变页码', () => {
    const state = createDefaultState({ page: 3, registry: 'npm' });
    const next = setRegistryState(state, 'npm');
    assert.strictEqual(next, state);
  });

  it('切回全部仓库时，页码重置为 1', () => {
    const state = createDefaultState({ page: 5, registry: 'pypi' });
    const next = setRegistryState(state, '');
    assert.equal(next.registry, '');
    assert.equal(next.page, 1);
  });

  it('仓库切换时，保留搜索关键词和排序方式', () => {
    const state = createDefaultState({
      page: 6,
      search: 'cli',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    const next = setRegistryState(state, 'pypi');
    assert.equal(next.search, 'cli');
    assert.equal(next.sortBy, 'name');
    assert.equal(next.sortOrder, 'asc');
    assert.equal(next.page, 1);
  });
});

describe('筛选状态 - 来源 (setSourceState)', () => {
  it('切换来源时，页码必须重置为 1', () => {
    const state = createDefaultState({ page: 4, source: '' });
    const next = setSourceState(state, 'cache');
    assert.equal(next.source, 'cache');
    assert.equal(next.page, 1);
  });

  it('从 cache 切换到 private，页码重置为 1', () => {
    const state = createDefaultState({ page: 9, source: 'cache' });
    const next = setSourceState(state, 'private');
    assert.equal(next.source, 'private');
    assert.equal(next.page, 1);
  });

  it('来源不变时，返回同一对象引用，不改变页码', () => {
    const state = createDefaultState({ page: 3, source: 'private' });
    const next = setSourceState(state, 'private');
    assert.strictEqual(next, state);
  });

  it('切回全部来源时，页码重置为 1', () => {
    const state = createDefaultState({ page: 5, source: 'cache' });
    const next = setSourceState(state, '');
    assert.equal(next.source, '');
    assert.equal(next.page, 1);
  });

  it('来源切换时，保留仓库和搜索条件', () => {
    const state = createDefaultState({
      page: 7,
      registry: 'npm',
      search: 'tool',
    });
    const next = setSourceState(state, 'private');
    assert.equal(next.registry, 'npm');
    assert.equal(next.search, 'tool');
    assert.equal(next.page, 1);
  });
});

describe('筛选状态 - 排序 (nextSortState)', () => {
  it('切换到不同排序列时，默认降序，页码重置为 1', () => {
    const state = createDefaultState({ page: 5, sortBy: 'updatedAt' });
    const next = nextSortState(state, 'security');
    assert.equal(next.sortBy, 'security');
    assert.equal(next.sortOrder, 'desc');
    assert.equal(next.page, 1);
  });

  it('在第 10 页点击同一列，切换升降序且页码重置为 1', () => {
    const state = createDefaultState({ page: 10, sortBy: 'name', sortOrder: 'desc' });
    const next = nextSortState(state, 'name');
    assert.equal(next.sortBy, 'name');
    assert.equal(next.sortOrder, 'asc');
    assert.equal(next.page, 1);
  });

  it('升序时点击同一列，切换为降序，页码重置为 1', () => {
    const state = createDefaultState({ page: 5, sortBy: 'size', sortOrder: 'asc' });
    const next = nextSortState(state, 'size');
    assert.equal(next.sortOrder, 'desc');
    assert.equal(next.page, 1);
  });

  it('降序时点击同一列，切换为升序，页码重置为 1', () => {
    const state = createDefaultState({ page: 5, sortBy: 'size', sortOrder: 'desc' });
    const next = nextSortState(state, 'size');
    assert.equal(next.sortOrder, 'asc');
    assert.equal(next.page, 1);
  });

  it('第 1 页点击排序，仍然保持第 1 页', () => {
    const state = createDefaultState({ page: 1 });
    const next = nextSortState(state, 'downloads');
    assert.equal(next.page, 1);
  });

  it('排序切换时，保留搜索、仓库、来源条件', () => {
    const state = createDefaultState({
      page: 3,
      search: 'ui',
      registry: 'npm',
      source: 'cache',
    });
    const next = nextSortState(state, 'name');
    assert.equal(next.search, 'ui');
    assert.equal(next.registry, 'npm');
    assert.equal(next.source, 'cache');
    assert.equal(next.page, 1);
  });

  it('支持所有 5 种排序列，每种都重置页码', () => {
    const cols: SortBy[] = ['name', 'updatedAt', 'size', 'downloads', 'security'];
    const state = createDefaultState({ page: 20 });
    for (const col of cols) {
      const next = nextSortState(state, col);
      assert.equal(next.sortBy, col);
      assert.equal(next.page, 1, `${col} 排序时 page 应该是 1`);
    }
  });
});

describe('筛选状态 - 页码 (setPageState)', () => {
  it('正常翻页时更新页码', () => {
    const state = createDefaultState({ page: 1 });
    const next = setPageState(state, 5);
    assert.equal(next.page, 5);
  });

  it('页码不会小于 1', () => {
    const state = createDefaultState({ page: 1 });
    const next = setPageState(state, 0);
    assert.equal(next.page, 1);
    const next2 = setPageState(state, -5);
    assert.equal(next2.page, 1);
  });

  it('翻页不会改变其他筛选条件', () => {
    const state = createDefaultState({
      page: 1,
      search: 'test',
      registry: 'npm',
      sortBy: 'name',
    });
    const next = setPageState(state, 10);
    assert.equal(next.search, 'test');
    assert.equal(next.registry, 'npm');
    assert.equal(next.sortBy, 'name');
  });
});

describe('筛选状态 - 综合场景', () => {
  it('第 5 页 → 输入搜索 → 第 1 页 → 切换仓库 → 第 1 页 → 排序 → 第 1 页', () => {
    let state = createDefaultState({ page: 5 });

    state = setSearchState(state, 'react');
    assert.equal(state.page, 1);
    assert.equal(state.search, 'react');

    state = setPageState(state, 3);
    assert.equal(state.page, 3);

    state = setRegistryState(state, 'npm');
    assert.equal(state.page, 1);
    assert.equal(state.registry, 'npm');

    state = setPageState(state, 2);
    assert.equal(state.page, 2);

    state = nextSortState(state, 'downloads');
    assert.equal(state.page, 1);
    assert.equal(state.sortBy, 'downloads');
  });

  it('所有会改变数据集的操作都重置页码（共 4 种操作）', () => {
    const deepPage = createDefaultState({ page: 100 });

    const searchResult = setSearchState(deepPage, 'x');
    assert.equal(searchResult.page, 1, '搜索应重置页码');

    const registryResult = setRegistryState(deepPage, 'npm');
    assert.equal(registryResult.page, 1, '切换仓库应重置页码');

    const sourceResult = setSourceState(deepPage, 'private');
    assert.equal(sourceResult.page, 1, '切换来源应重置页码');

    const sortResult = nextSortState(deepPage, 'security');
    assert.equal(sortResult.page, 1, '排序应重置页码');
  });

  it('相同值重复操作不重置页码（幂等性）', () => {
    const state = createDefaultState({
      page: 5,
      search: 'lodash',
      registry: 'npm',
      source: 'cache',
    });

    assert.strictEqual(setSearchState(state, 'lodash'), state);
    assert.strictEqual(setRegistryState(state, 'npm'), state);
    assert.strictEqual(setSourceState(state, 'cache'), state);
  });

  it('复杂交互链路：搜索+筛选+排序组合', () => {
    let state = createDefaultState();

    state = setSearchState(state, 'axios');
    state = setRegistryState(state, 'npm');
    state = setSourceState(state, 'cache');
    state = setPageState(state, 5);

    state = nextSortState(state, 'downloads');
    assert.equal(state.page, 1);
    assert.equal(state.search, 'axios');
    assert.equal(state.registry, 'npm');
    assert.equal(state.source, 'cache');
    assert.equal(state.sortBy, 'downloads');
    assert.equal(state.sortOrder, 'desc');

    state = setSearchState(state, 'fetch');
    assert.equal(state.page, 1);
    assert.equal(state.search, 'fetch');
    assert.equal(state.sortBy, 'downloads');
  });
});

describe('徽章样式 - getGradeStyle', () => {
  it('A+ 级返回正确的样式描述', () => {
    const style = getGradeStyle('A+');
    assert.equal(style.label, 'A+');
    assert.ok(style.badgeClass.includes('emerald'));
    assert.ok(style.description.includes('优秀'));
  });

  it('F 级返回正确的样式描述', () => {
    const style = getGradeStyle('F');
    assert.equal(style.label, 'F');
    assert.ok(style.badgeClass.includes('red'));
    assert.ok(style.description.includes('危险'));
  });

  it('所有 6 个等级都有对应样式', () => {
    const grades = ['A+', 'A', 'B', 'C', 'D', 'F'] as const;
    for (const g of grades) {
      const style = getGradeStyle(g);
      assert.ok(style.label.length > 0);
      assert.ok(style.description.length > 0);
    }
  });
});

describe('分数颜色工具函数', () => {
  it('getScoreColor 返回正确的颜色值', () => {
    assert.equal(getScoreColor(95), '#10b981');
    assert.equal(getScoreColor(70), '#84cc16');
    assert.equal(getScoreColor(50), '#f59e0b');
    assert.equal(getScoreColor(20), '#ef4444');
  });

  it('getScoreWord 返回正确的文字描述', () => {
    assert.equal(getScoreWord(90), '优秀');
    assert.equal(getScoreWord(75), '良好');
    assert.equal(getScoreWord(55), '一般');
    assert.equal(getScoreWord(30), '较差');
  });

  it('getScoreBgClass / getScoreTextClass 返回有效 class 字符串', () => {
    for (let v = 0; v <= 100; v += 10) {
      assert.ok(getScoreBgClass(v).length > 0);
      assert.ok(getScoreTextClass(v).length > 0);
    }
  });
});

describe('维度标签配置', () => {
  it('包含 5 个评分维度', () => {
    const keys = Object.keys(SCORE_DIMENSION_LABELS);
    assert.equal(keys.length, 5);
    assert.deepEqual(
      keys.sort(),
      ['downloads', 'recency', 'license', 'maturity', 'age'].sort()
    );
  });

  it('每个维度都有 label、weight、icon', () => {
    for (const key of Object.keys(SCORE_DIMENSION_LABELS) as Array<keyof typeof SCORE_DIMENSION_LABELS>) {
      const dim = SCORE_DIMENSION_LABELS[key];
      assert.ok(dim.label.length > 0);
      assert.ok(dim.weight.endsWith('%'));
      assert.ok(dim.icon.length > 0);
    }
  });

  it('所有权重加起来等于 100%', () => {
    let total = 0;
    for (const dim of Object.values(SCORE_DIMENSION_LABELS)) {
      total += parseInt(dim.weight, 10);
    }
    assert.equal(total, 100);
  });
});

console.log('\n🎉 所有前端筛选状态与安全评分测试通过！');
