import type { SecurityGrade } from './types';

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;

  if (diff < min) return '刚刚';
  if (diff < hr) return `${Math.floor(diff / min)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hr)} 小时前`;
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`;
  return formatDate(ts);
}

export function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN');
}

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

export const SCORE_DIMENSION_LABELS: Record<keyof import('./types').SecurityScoreBreakdown, { label: string; weight: string; icon: string }> = {
  downloads: { label: '下载热度', weight: '35%', icon: '📊' },
  recency: { label: '维护活跃度', weight: '30%', icon: '⚡' },
  license: { label: '开源许可', weight: '15%', icon: '📜' },
  maturity: { label: '版本成熟度', weight: '10%', icon: '🔖' },
  age: { label: '项目年龄', weight: '10%', icon: '⏳' },
};
