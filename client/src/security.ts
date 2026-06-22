import type { SecurityGrade, SecurityScoreBreakdown } from './types';
import type { RegistryType, PackageSource } from './types';

export interface GradeStyle {
  badgeClass: string;
  textClass: string;
  bgClass: string;
  label: string;
  description: string;
}

const GRADE_STYLES: Record<SecurityGrade, GradeStyle> = {
  'A+': {
    badgeClass: 'bg-emerald-600 text-white border-emerald-700',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 text-emerald-700',
    label: 'A+',
    description: '优秀 - 高度可信',
  },
  'A': {
    badgeClass: 'bg-emerald-500 text-white border-emerald-600',
    textClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 text-emerald-600',
    label: 'A',
    description: '良好 - 值得信赖',
  },
  'B': {
    badgeClass: 'bg-lime-500 text-white border-lime-600',
    textClass: 'text-lime-700',
    bgClass: 'bg-lime-50 text-lime-700',
    label: 'B',
    description: '较好 - 整体可靠',
  },
  'C': {
    badgeClass: 'bg-amber-500 text-white border-amber-600',
    textClass: 'text-amber-700',
    bgClass: 'bg-amber-50 text-amber-700',
    label: 'C',
    description: '一般 - 建议关注',
  },
  'D': {
    badgeClass: 'bg-orange-500 text-white border-orange-600',
    textClass: 'text-orange-700',
    bgClass: 'bg-orange-50 text-orange-700',
    label: 'D',
    description: '较差 - 需谨慎使用',
  },
  'F': {
    badgeClass: 'bg-red-600 text-white border-red-700',
    textClass: 'text-red-700',
    bgClass: 'bg-red-50 text-red-700',
    label: 'F',
    description: '危险 - 高度不推荐',
  },
};

export function getGradeStyle(grade: SecurityGrade): GradeStyle {
  return GRADE_STYLES[grade] || GRADE_STYLES['F'];
}

export const SCORE_DIMENSION_LABELS: Record<keyof SecurityScoreBreakdown, { label: string; weight: string; icon: string }> = {
  downloads: { label: '下载热度', weight: '35%', icon: '📊' },
  recency: { label: '维护活跃度', weight: '30%', icon: '⚡' },
  license: { label: '开源许可', weight: '15%', icon: '📜' },
  maturity: { label: '版本成熟度', weight: '10%', icon: '🔖' },
  age: { label: '项目年龄', weight: '10%', icon: '⏳' },
};

export function getScoreColor(value: number): string {
  if (value >= 80) return '#10b981';
  if (value >= 60) return '#84cc16';
  if (value >= 40) return '#f59e0b';
  return '#ef4444';
}

export function getScoreBgClass(value: number): string {
  if (value >= 80) return 'bg-emerald-50 border-emerald-200';
  if (value >= 60) return 'bg-lime-50 border-lime-200';
  if (value >= 40) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

export function getScoreTextClass(value: number): string {
  if (value >= 80) return 'text-emerald-700';
  if (value >= 60) return 'text-lime-700';
  if (value >= 40) return 'text-amber-700';
  return 'text-red-700';
}

export function getScoreWord(value: number): string {
  if (value >= 80) return '优秀';
  if (value >= 60) return '良好';
  if (value >= 40) return '一般';
  return '较差';
}

export type SortBy = 'name' | 'updatedAt' | 'size' | 'downloads' | 'security';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  registry: RegistryType | '';
  source: PackageSource | '';
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
}

export function nextSortState(
  current: FilterState,
  clickedCol: SortBy
): FilterState {
  if (current.sortBy === clickedCol) {
    return {
      ...current,
      sortBy: clickedCol,
      sortOrder: current.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    };
  }
  return {
    ...current,
    sortBy: clickedCol,
    sortOrder: 'desc',
    page: 1,
  };
}

export function setSearchState(
  current: FilterState,
  search: string
): FilterState {
  if (current.search === search) return current;
  return { ...current, search, page: 1 };
}

export function setRegistryState(
  current: FilterState,
  registry: RegistryType | ''
): FilterState {
  if (current.registry === registry) return current;
  return { ...current, registry, page: 1 };
}

export function setSourceState(
  current: FilterState,
  source: PackageSource | ''
): FilterState {
  if (current.source === source) return current;
  return { ...current, source, page: 1 };
}

export function setPageState(
  current: FilterState,
  page: number
): FilterState {
  return { ...current, page: Math.max(1, page) };
}
