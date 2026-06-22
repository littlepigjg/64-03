export type RegistryType = 'npm' | 'pypi';
export type PackageSource = 'cache' | 'private' | 'upstream';
export type SecurityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface SecurityScoreBreakdown {
  downloads: number;
  recency: number;
  license: number;
  maturity: number;
  age: number;
}

export interface SecurityScore {
  total: number;
  grade: SecurityGrade;
  breakdown: SecurityScoreBreakdown;
}

export interface PackageVersion {
  version: string;
  size: number;
  filePath: string;
  sha1?: string;
  publishedAt: number;
  downloadCount: number;
}

export interface PackageInfo {
  name: string;
  registry: RegistryType;
  source: PackageSource;
  versions: PackageVersion[];
  latestVersion: string;
  description?: string;
  author?: string;
  license?: string;
  scope?: string;
  createdAt: number;
  updatedAt: number;
  totalSize: number;
  downloadCount: number;
  securityScore: SecurityScore;
}

export interface PackageListResponse {
  packages: PackageInfo[];
  total: number;
}

export interface CacheStats {
  totalPackages: number;
  totalVersions: number;
  totalSize: number;
  npmPackages: number;
  pypiPackages: number;
  privatePackages: number;
  cachePackages: number;
  maxSize: number;
  usagePercent: number;
}

export interface StorageTrend {
  date: string;
  size: number;
  packages: number;
}

export interface CachePolicy {
  maxSizeGB: number;
  maxAgeDays: number;
  autoClean: boolean;
}

export interface HealthInfo {
  status: string;
  timestamp: number;
  version: string;
  config: {
    storageDir: string;
    port: number;
    npmUpstream: string;
    pypiUpstream: string;
    privateScopes: string[];
  };
}
