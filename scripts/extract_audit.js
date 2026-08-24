const fs = require('fs');
const d = JSON.parse(fs.readFileSync('audit.json', 'utf8'));

const CRITICAL_HIGH = [];
for (const [name, pkg] of Object.entries(d.vulnerabilities)) {
  if (pkg.severity !== 'critical' && pkg.severity !== 'high') continue;
  
  const vias = pkg.via.filter(v => typeof v === 'object' && v.title);
  if (vias.length === 0) continue; // transitive only
  
  for (const via of vias) {
    CRITICAL_HIGH.push({
      package: name,
      severity: pkg.severity.toUpperCase(),
      isDirect: pkg.isDirect,
      advisory: via.title,
      url: via.url,
      cvss: via.cvss && via.cvss.score > 0 ? via.cvss.score : 'N/A',
      cwe: via.cwe ? via.cwe.join(',') : '',
      range: via.range,
      fixAvailable: pkg.fixAvailable === true ? 'YES (non-breaking)' : 
                    (pkg.fixAvailable && pkg.fixAvailable.isSemVerMajor ? 'YES (major version bump)' : 'NO')
    });
  }
}

// Sort: critical first, then direct packages first
CRITICAL_HIGH.sort((a,b) => {
  if (a.severity !== b.severity) return a.severity === 'CRITICAL' ? -1 : 1;
  if (a.isDirect !== b.isDirect) return a.isDirect ? -1 : 1;
  return a.package.localeCompare(b.package);
});

let out = '# CRITICAL & HIGH ADVISORY DETAILS\n\n';
out += `Generated: ${new Date().toISOString()}\n\n`;
out += `Total packages with advisories: ${Object.keys(d.vulnerabilities).length}\n`;
out += `Breakdown: ${JSON.stringify(d.metadata.vulnerabilities)}\n\n`;

for (const r of CRITICAL_HIGH) {
  out += `## [${r.severity}] ${r.package}\n`;
  out += `- **Direct dependency:** ${r.isDirect}\n`;
  out += `- **Advisory:** ${r.advisory}\n`;
  out += `- **CVSS:** ${r.cvss}\n`;
  out += `- **CWE:** ${r.cwe || 'N/A'}\n`;
  out += `- **Affected range:** ${r.range}\n`;
  out += `- **Fix available:** ${r.fixAvailable}\n`;
  out += `- **URL:** ${r.url}\n\n`;
}

fs.writeFileSync('scripts/audit_detail.md', out);
console.log('Written scripts/audit_detail.md');
console.log(`Entries: ${CRITICAL_HIGH.length}`);
