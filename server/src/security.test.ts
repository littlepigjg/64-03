import assert from 'node:assert/strict';
import {
  scoreLicense,
  scoreDownloads,
  scoreRecency,
  scoreMaturity,
  scoreAge,
  getGrade,
  calculateSecurityScore,
  SCORE_WEIGHTS,
} from './security';
import type { ScoreInput } from './security';

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

describe('security.scoreLicense', () => {
  it('标准 MIT 许可证应该得 100 分', () => {
    assert.equal(scoreLicense('MIT'), 100);
  });

  it('标准 Apache-2.0 许可证应该得 100 分', () => {
    assert.equal(scoreLicense('Apache-2.0'), 100);
  });

  it('空字符串许可证得 0 分', () => {
    assert.equal(scoreLicense(''), 0);
    assert.equal(scoreLicense(undefined), 0);
  });

  it('UNKNOWN 许可证得 0 分', () => {
    assert.equal(scoreLicense('UNKNOWN'), 0);
  });

  it('不规范的自定义许可证得 50 分', () => {
    assert.equal(scoreLicense('See LICENSE'), 50);
    assert.equal(scoreLicense('Custom'), 50);
  });

  it('PROPRIETARY 许可证得 0 分', () => {
    assert.equal(scoreLicense('PROPRIETARY'), 0);
    assert.equal(scoreLicense('Proprietary'), 0);
  });

  it('许可证匹配不区分大小写和分隔符', () => {
    assert.equal(scoreLicense('mit'), 100);
    assert.equal(scoreLicense('GPL V3'), 100);
    assert.equal(scoreLicense('apache 2.0'), 100);
  });
});

describe('security.scoreDownloads', () => {
  it('下载量为 0 得 0 分', () => {
    assert.equal(scoreDownloads(0), 0);
    assert.equal(scoreDownloads(-1), 0);
  });

  it('下载量 < 100 得 10 分', () => {
    assert.equal(scoreDownloads(1), 10);
    assert.equal(scoreDownloads(50), 10);
    assert.equal(scoreDownloads(99), 10);
  });

  it('下载量 1000 万以上得 100 分', () => {
    assert.equal(scoreDownloads(1000000), 100);
    assert.equal(scoreDownloads(10000000), 100);
  });

  it('下载量越多分数越高', () => {
    assert.ok(scoreDownloads(50000) > scoreDownloads(5000));
    assert.ok(scoreDownloads(500000) > scoreDownloads(50000));
    assert.ok(scoreDownloads(5000000) > scoreDownloads(500000));
  });
});

describe('security.scoreRecency', () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  it('30 天内更新的包得 100 分', () => {
    assert.equal(scoreRecency(now), 100);
    assert.equal(scoreRecency(now - 15 * day), 100);
    assert.equal(scoreRecency(now - 29 * day), 100);
  });

  it('超过 365 天未更新得 0 分', () => {
    assert.equal(scoreRecency(now - 366 * day), 0);
    assert.equal(scoreRecency(now - 730 * day), 0);
  });

  it('更新越近分数越高', () => {
    assert.ok(scoreRecency(now - 10 * day) > scoreRecency(now - 100 * day));
    assert.ok(scoreRecency(now - 100 * day) > scoreRecency(now - 200 * day));
    assert.ok(scoreRecency(now - 200 * day) > scoreRecency(now - 400 * day));
  });
});

describe('security.scoreMaturity', () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  it('只有 1 个版本且刚创建得低分', () => {
    assert.equal(scoreMaturity(1, now - 1 * day, now), 13);
  });

  it('10+ 个版本且跨度超过 1 年得 100 分', () => {
    assert.equal(scoreMaturity(15, now - 400 * day, now), 100);
  });

  it('版本数越多分数越高', () => {
    const createdAt = now - 200 * day;
    assert.ok(scoreMaturity(5, createdAt, now) > scoreMaturity(1, createdAt, now));
    assert.ok(scoreMaturity(10, createdAt, now) > scoreMaturity(5, createdAt, now));
  });

  it('发布跨度越长分数越高', () => {
    assert.ok(
      scoreMaturity(3, now - 200 * day, now) > scoreMaturity(3, now - 30 * day, now)
    );
  });
});

describe('security.scoreAge', () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  it('新建 7 天内的包得 10 分', () => {
    assert.equal(scoreAge(now - 1 * day), 10);
  });

  it('存在超过 2 年的包得 100 分', () => {
    assert.equal(scoreAge(now - 800 * day), 100);
  });

  it('存在越久分数越高', () => {
    assert.ok(scoreAge(now - 100 * day) > scoreAge(now - 10 * day));
    assert.ok(scoreAge(now - 500 * day) > scoreAge(now - 100 * day));
  });
});

describe('security.getGrade', () => {
  it('90 分以上 A+', () => {
    assert.equal(getGrade(100), 'A+');
    assert.equal(getGrade(90), 'A+');
  });

  it('80-89 分 A', () => {
    assert.equal(getGrade(89), 'A');
    assert.equal(getGrade(80), 'A');
  });

  it('70-79 分 B', () => {
    assert.equal(getGrade(79), 'B');
    assert.equal(getGrade(70), 'B');
  });

  it('60-69 分 C', () => {
    assert.equal(getGrade(69), 'C');
    assert.equal(getGrade(60), 'C');
  });

  it('40-59 分 D', () => {
    assert.equal(getGrade(59), 'D');
    assert.equal(getGrade(40), 'D');
  });

  it('低于 40 分 F', () => {
    assert.equal(getGrade(39), 'F');
    assert.equal(getGrade(0), 'F');
  });
});

describe('security.calculateSecurityScore', () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  it('顶级优质包应该得 A+', () => {
    const input: ScoreInput = {
      downloadCount: 5000000,
      updatedAt: now - 7 * day,
      createdAt: now - 1000 * day,
      license: 'MIT',
      versionsCount: 50,
      source: 'cache',
    };
    const result = calculateSecurityScore(input);
    assert.equal(result.grade, 'A+');
    assert.ok(result.total >= 90);
    assert.equal(result.breakdown.downloads, 100);
    assert.equal(result.breakdown.recency, 100);
    assert.equal(result.breakdown.license, 100);
    assert.equal(result.breakdown.maturity, 100);
    assert.equal(result.breakdown.age, 100);
  });

  it('各维度分数在 0-100 之间', () => {
    const input: ScoreInput = {
      downloadCount: 1000,
      updatedAt: now - 100 * day,
      createdAt: now - 200 * day,
      license: 'MIT',
      versionsCount: 5,
      source: 'cache',
    };
    const result = calculateSecurityScore(input);
    assert.ok(result.breakdown.downloads >= 0 && result.breakdown.downloads <= 100);
    assert.ok(result.breakdown.recency >= 0 && result.breakdown.recency <= 100);
    assert.ok(result.breakdown.license >= 0 && result.breakdown.license <= 100);
    assert.ok(result.breakdown.maturity >= 0 && result.breakdown.maturity <= 100);
    assert.ok(result.breakdown.age >= 0 && result.breakdown.age <= 100);
  });

  it('应该尊重权重分配，下载和活跃度占比最大', () => {
    const input: ScoreInput = {
      downloadCount: 1000,
      updatedAt: now - 100 * day,
      createdAt: now - 200 * day,
      license: 'MIT',
      versionsCount: 5,
      source: 'cache',
    };
    const r = calculateSecurityScore(input);
    const expected = Math.round(
      r.breakdown.downloads * SCORE_WEIGHTS.downloads +
      r.breakdown.recency * SCORE_WEIGHTS.recency +
      r.breakdown.license * SCORE_WEIGHTS.license +
      r.breakdown.maturity * SCORE_WEIGHTS.maturity +
      r.breakdown.age * SCORE_WEIGHTS.age
    );
    assert.equal(r.total, expected);
  });

  it('长期不维护的危险包得 F', () => {
    const input: ScoreInput = {
      downloadCount: 10,
      updatedAt: now - 500 * day,
      createdAt: now - 600 * day,
      license: '',
      versionsCount: 1,
      source: 'cache',
    };
    const result = calculateSecurityScore(input);
    assert.equal(result.grade, 'F');
    assert.ok(result.total < 40);
  });

  it('私有包额外加 5 分', () => {
    const base = {
      downloadCount: 5000,
      updatedAt: now - 60 * day,
      createdAt: now - 300 * day,
      license: 'MIT',
      versionsCount: 8,
    };
    const normal = calculateSecurityScore({ ...base, source: 'cache' });
    const priv = calculateSecurityScore({ ...base, source: 'private' });
    assert.equal(priv.total, Math.min(100, normal.total + 5));
  });

  it('总分不会超过 100', () => {
    const input: ScoreInput = {
      downloadCount: 99999999,
      updatedAt: now,
      createdAt: now - 2000 * day,
      license: 'MIT',
      versionsCount: 100,
      source: 'private',
    };
    const result = calculateSecurityScore(input);
    assert.equal(result.total, 100);
    assert.equal(result.grade, 'A+');
  });

  it('总分不会低于 0', () => {
    const input: ScoreInput = {
      downloadCount: 0,
      updatedAt: now - 9999 * day,
      createdAt: now,
      license: '',
      versionsCount: 0,
      source: 'cache',
    };
    const result = calculateSecurityScore(input);
    assert.ok(result.total >= 0);
  });
});

console.log('\n🎉 所有后端安全评分算法测试通过！');
