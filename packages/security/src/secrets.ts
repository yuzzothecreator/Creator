const SECRET_PATTERNS: Array<{ id: string; regex: RegExp; flags?: string }> = [
  { id: 'aws-access-key', regex: /AKIA[0-9A-Z]{16}/g },
  {
    id: 'generic-api-key',
    regex: /(api[_-]?key|secret|token)\s*[:=]\s*['"][^'"]{12,}['"]/g,
    flags: 'gi',
  },
  { id: 'private-key', regex: /-----BEGIN (RSA|OPENSSH|EC) PRIVATE KEY-----/g },
];

export interface SecretFinding {
  id: string;
  path: string;
  excerpt: string;
  severity: 'high' | 'medium';
}

export function detectSecrets(files: Array<{ path: string; content: string }>): SecretFinding[] {
  const findings: SecretFinding[] = [];
  for (const file of files) {
    for (const pattern of SECRET_PATTERNS) {
      const re = new RegExp(pattern.regex.source, pattern.flags ?? pattern.regex.flags);
      const match = re.exec(file.content);
      if (match) {
        findings.push({
          id: pattern.id,
          path: file.path,
          excerpt: match[0].slice(0, 80),
          severity: 'high',
        });
      }
    }
  }
  return findings;
}
