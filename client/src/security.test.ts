import assert from 'node:assert/strict';
import { nextSortState, type SortState, type SortBy } from './security';

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

describe('security.nextSortState - 排序切换与页码重置', () => {
  it('切换到不同排序列时，sortOrder 默认为 desc，page 重置为 1', () => {
    const current: SortState = { sortBy: 'updatedAt', sortOrder: 'desc', page: 3 };
    const next = nextSortState(current, 'security');
    assert.equal(next.sortBy, 'security');
    assert.equal(next.sortOrder, 'desc');
    assert.equal(next.page, 1);
  });

  it('在第 5 页点击不同列，必须回到第 1 页', () => {
    const current: SortState = { sortBy: 'name', sortOrder: 'asc', page: 5 };
    const next = nextSortState(current, 'downloads');
    assert.equal(next.sortBy, 'downloads');
    assert.equal(next.sortOrder, 'desc');
    assert.equal(next.page, 1);
  });

  it('在第 10 页点击同一列，只切换升降序，page 必须重置为 1', () => {
    const current: SortState = { sortBy: 'security', sortOrder: 'desc', page: 10 };
    const next = nextSortState(current, 'security');
    assert.equal(next.sortBy, 'security');
    assert.equal(next.sortOrder, 'asc');
    assert.equal(next.page, 1);
  });

  it('升序时点击同一列切换为降序，page 重置为 1', () => {
    const current: SortState = { sortBy: 'size', sortOrder: 'asc', page: 7 };
    const next = nextSortState(current, 'size');
    assert.equal(next.sortBy, 'size');
    assert.equal(next.sortOrder, 'desc');
    assert.equal(next.page, 1);
  });

  it('降序时点击同一列切换为升序，page 重置为 1', () => {
    const current: SortState = { sortBy: 'size', sortOrder: 'desc', page: 7 };
    const next = nextSortState(current, 'size');
    assert.equal(next.sortBy, 'size');
    assert.equal(next.sortOrder, 'asc');
    assert.equal(next.page, 1);
  });

  it('第 1 页点击不同列，仍然保持第 1 页', () => {
    const current: SortState = { sortBy: 'updatedAt', sortOrder: 'desc', page: 1 };
    const next = nextSortState(current, 'name');
    assert.equal(next.sortBy, 'name');
    assert.equal(next.sortOrder, 'desc');
    assert.equal(next.page, 1);
  });

  it('第 100 页切换安全评分排序，必须回到第 1 页（Bug 场景验证）', () => {
    const current: SortState = { sortBy: 'updatedAt', sortOrder: 'desc', page: 100 };
    const next = nextSortState(current, 'security');
    assert.equal(next.sortBy, 'security');
    assert.equal(next.sortOrder, 'desc');
    assert.equal(next.page, 1);
  });

  it('连续多次切换排序，page 始终重置为 1', () => {
    let state: SortState = { sortBy: 'name', sortOrder: 'desc', page: 1 };
    state = nextSortState(state, 'size');
    state = { ...state, page: 5 };
    state = nextSortState(state, 'downloads');
    assert.equal(state.page, 1);
    state = { ...state, page: 10 };
    state = nextSortState(state, 'updatedAt');
    assert.equal(state.page, 1);
    state = { ...state, page: 20 };
    state = nextSortState(state, 'security');
    assert.equal(state.page, 1);
  });

  it('state 类型正确，包含所有必要字段', () => {
    const current: SortState = { sortBy: 'updatedAt', sortOrder: 'desc', page: 3 };
    const next = nextSortState(current, 'name');
    assert.ok('sortBy' in next);
    assert.ok('sortOrder' in next);
    assert.ok('page' in next);
    assert.equal(typeof next.page, 'number');
  });

  it('所有 SortBy 列都支持排序切换', () => {
    const cols: SortBy[] = ['name', 'updatedAt', 'size', 'downloads', 'security'];
    const current: SortState = { sortBy: 'name', sortOrder: 'desc', page: 5 };
    for (const col of cols) {
      const next = nextSortState(current, col);
      assert.equal(next.sortBy, col);
      assert.equal(next.page, 1, `${col} 排序时 page 应该是 1`);
    }
  });
});

console.log('\n🎉 所有前端排序状态测试通过！');
