import fs from 'fs';
import path from 'path';
import type { SecurityScore, SecurityScoreBreakdown, SecurityGrade } from './types';

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const STANDARD_LICENSES = [
  'MIT', 'Apache', 'BSD', 'GPL', 'LGPL', 'MPL', 'ISC',
  'Artistic', 'CC0', 'Unlicense', 'WTFPL', 'Zlib', 'EPL',
  'AGPL', 'MS-PL', 'Python-2.0', 'PSF', 'Public Domain',
];

function normalizeLicense(license: string): string {
  return license
    .toUpperCase()
    .replace(/[\s\-\.]+/g, '')
    .replace(/VERSION|V/g, '');
}

export function scoreLicense(license?: string): number {
  if (!license || license.trim() === '') return 0;
  const normalized = normalizeLicense(license);
  if (normalized === 'UNKNOWN' || normalized === 'PROPRIETARY') return 0;
  for (const std of STANDARD_LICENSES) {
    const stdNorm = normalizeLicense(std);
    if (normalized.includes(stdNorm) || stdNorm.includes(normalized)) {
      return 100;
    }
  }
  return 50;
}

export function scoreDownloads(downloadCount: number): number {
  if (downloadCount <= 0) return 0;
  if (downloadCount < 100) return 10;
  if (downloadCount < 1000) return 25;
  if (downloadCount < 10000) return 45;
  if (downloadCount < 100000) return 65;
  if (downloadCount < 500000) return 82;
  if (downloadCount < 1000000) return 90;
  return 100;
}

export function scoreRecency(updatedAt: number): number {
  const now = Date.now();
  const days = (now - updatedAt) / (24 * 60 * 60 * 1000);
  if (days <= 30) return 100;
  if (days <= 60) return 90 + ((60 - days) / 30) * 10;
  if (days <= 90) return 70 + ((90 - days) / 30) * 20;
  if (days <= 180) return 40 + ((180 - days) / 90) * 30;
  if (days <= 270) return 20 + ((270 - days) / 90) * 20;
  if (days <= 365) return 5 + ((365 - days) / 95) * 15;
  return 0;
}

export function scoreMaturity(versionsCount: number, createdAt: number, updatedAt: number): number {
  const spanDays = (updatedAt - createdAt) / (24 * 60 * 60 * 1000);
  let verScore = 0;
  if (versionsCount <= 1) verScore = 15;
  else if (versionsCount <= 2) verScore = 35;
  else if (versionsCount <= 5) verScore = 60;
  else if (versionsCount <= 10) verScore = 80;
  else verScore = 100;
  let spanScore = 0;
  if (spanDays <= 7) spanScore = 10;
  else if (spanDays <= 30) spanScore = 30;
  else if (spanDays <= 90) spanScore = 55;
  else if (spanDays <= 180) spanScore = 75;
  else if (spanDays <= 365) spanScore = 90;
  else spanScore = 100;
  return Math.round(verScore * 0.5 + spanScore * 0.5);
}

export function scoreAge(createdAt: number): number {
  const days = (Date.now() - createdAt) / (24 * 60 * 60 * 1000);
  if (days <= 7) return 10;
  if (days <= 30) return 25;
  if (days <= 90) return 45;
  if (days <= 180) return 60;
  if (days <= 365) return 80;
  if (days <= 730) return 92;
  return 100;
}

export function getGrade(score: number): SecurityGrade {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

const WEIGHTS = {
  downloads: 0.35,
  recency: 0.30,
  license: 0.15,
  maturity: 0.10,
  age: 0.10,
};

export function calculateSecurityScore(pkg: {
  downloadCount: number;
  updatedAt: number;
  createdAt: number;
  license?: string;
  versions: Array<{ version: string }>;
  source: string;
}): SecurityScore {
  const breakdown: SecurityScoreBreakdown = {
    downloads: scoreDownloads(pkg.downloadCount),
    recency: scoreRecency(pkg.updatedAt),
    license: scoreLicense(pkg.license),
    maturity: scoreMaturity(pkg.versions.length, pkg.createdAt, pkg.updatedAt),
    age: scoreAge(pkg.createdAt),
  };
  let total =
    breakdown.downloads * WEIGHTS.downloads +
    breakdown.recency * WEIGHTS.recency +
    breakdown.license * WEIGHTS.license +
    breakdown.maturity * WEIGHTS.maturity +
    breakdown.age * WEIGHTS.age;
  if (pkg.source === 'private') {
    total = Math.min(100, total + 5);
  }
  total = Math.round(Math.max(0, Math.min(100, total)));
  return {
    total,
    grade: getGrade(total),
    breakdown: {
      downloads: Math.round(breakdown.downloads),
      recency: Math.round(breakdown.recency),
      license: Math.round(breakdown.license),
      maturity: Math.round(breakdown.maturity),
      age: Math.round(breakdown.age),
    },
  };
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getDirSize(dirPath: string): number {
  let totalSize = 0;
  if (!fs.existsSync(dirPath)) return 0;
  
  function walk(currentPath: string) {
    const stats = fs.statSync(currentPath);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      for (const file of files) {
        walk(path.join(currentPath, file));
      }
    }
  }
  
  walk(dirPath);
  return totalSize;
}

export function formatDate(ts: number): string {
  return new Date(ts).toISOString().split('T')[0];
}

export function parseNpmPackageName(name: string): { scope?: string; name: string } {
  if (name.startsWith('@')) {
    const parts = name.split('/');
    return {
      scope: parts[0],
      name: parts.slice(1).join('/') || name,
    };
  }
  return { name };
}

export function sanitizePath(input: string): string {
  return input.replace(/[^a-zA-Z0-9@._\-/]/g, '_').replace(/\.\./g, '_');
}
