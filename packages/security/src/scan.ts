import { detectSecrets } from './secrets.js';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecurityFinding {
  rule: string;
  severity: FindingSeverity;
  path: string;
  message: string;
  remediation: string;
}

export interface SecurityScanResult {
  score: number;
  findings: SecurityFinding[];
}

export function scanForVulnerabilities(files: Array<{ path: string; content: string }>): SecurityScanResult {
  const findings: SecurityFinding[] = [];

  for (const secret of detectSecrets(files)) {
    findings.push({
      rule: `secret.${secret.id}`,
      severity: 'critical',
      path: secret.path,
      message: `Possible secret detected (${secret.id}).`,
      remediation: 'Remove the secret and rotate credentials immediately.',
    });
  }

  for (const file of files) {
    if (/\$\{?query\}?|\+\s*req\.|\+\s*request\./i.test(file.content) && /select|insert|update|delete/i.test(file.content)) {
      findings.push({
        rule: 'sqli.string-concat',
        severity: 'high',
        path: file.path,
        message: 'Possible SQL string concatenation with request data.',
        remediation: 'Use parameterized queries / Prisma / query builder bindings.',
      });
    }
    if (/dangerouslySetInnerHTML|innerHTML\s*=/i.test(file.content)) {
      findings.push({
        rule: 'xss.inner-html',
        severity: 'high',
        path: file.path,
        message: 'Potential XSS via HTML injection sink.',
        remediation: 'Sanitize HTML or avoid raw HTML rendering.',
      });
    }
    if (/cors\(\s*\{\s*origin:\s*['\"]\*['\"]/i.test(file.content)) {
      findings.push({
        rule: 'csrf.cors-open',
        severity: 'medium',
        path: file.path,
        message: 'Open CORS origin increases CSRF/data leak risk with credentialed requests.',
        remediation: 'Allowlist trusted origins and use same-site cookies.',
      });
    }
    if (/findUnique\([^\)]*id:\s*req\.|where:\s*\{\s*id:\s*(params|body)/i.test(file.content)) {
      findings.push({
        rule: 'idor.direct-object',
        severity: 'high',
        path: file.path,
        message: 'Resource fetched by id without visible ownership check.',
        remediation: 'Scope queries by authenticated user/tenant.',
      });
    }
  }

  const penalty = findings.reduce((acc, f) => {
    if (f.severity === 'critical') return acc + 2.5;
    if (f.severity === 'high') return acc + 1.5;
    if (f.severity === 'medium') return acc + 0.75;
    return acc + 0.25;
  }, 0);

  return {
    score: Math.max(0, Math.min(10, 10 - penalty)),
    findings,
  };
}
