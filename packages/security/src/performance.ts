export interface PerfFinding {
  rule: string;
  severity: 'high' | 'medium' | 'low';
  path: string;
  message: string;
  remediation: string;
}

export interface PerfReport {
  score: number;
  findings: PerfFinding[];
}

export function analyzePerformance(files: Array<{ path: string; content: string }>): PerfReport {
  const findings: PerfFinding[] = [];

  for (const file of files) {
    if (/findMany\([^\)]*\)(?![\s\S]{0,80}include)/.test(file.content) && /for\s*\(.*await/.test(file.content)) {
      findings.push({
        rule: 'db.n+1',
        severity: 'high',
        path: file.path,
        message: 'Possible N+1 query pattern (looped awaits after list fetch).',
        remediation: 'Batch with include/select or DataLoader-style APIs.',
      });
    }
    if (/from ['\"]lodash['\"]|import _ from/.test(file.content)) {
      findings.push({
        rule: 'bundle.lodash-full',
        severity: 'medium',
        path: file.path,
        message: 'Full lodash import can inflate bundle size.',
        remediation: 'Import only needed functions or use native equivalents.',
      });
    }
    if (/new Image\(|<img(?![^>]*loading=)/i.test(file.content)) {
      findings.push({
        rule: 'images.lazy',
        severity: 'low',
        path: file.path,
        message: 'Images may not be lazy-loaded.',
        remediation: 'Use next/image or loading="lazy" for below-fold media.',
      });
    }
    if (/cache:\s*['\"]no-store['\"]/.test(file.content)) {
      findings.push({
        rule: 'cache.disabled',
        severity: 'medium',
        path: file.path,
        message: 'no-store caching may hurt read-heavy endpoints.',
        remediation: 'Cache public/read-mostly responses with explicit revalidation.',
      });
    }
  }

  const penalty = findings.reduce((acc, f) => acc + (f.severity === 'high' ? 1.5 : f.severity === 'medium' ? 0.8 : 0.3), 0);
  return { score: Math.max(0, Math.min(10, 9.5 - penalty)), findings };
}
