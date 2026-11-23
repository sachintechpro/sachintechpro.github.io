import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const site = path.resolve('smitha-personal');
const problems = [];
const check = (condition, message) => { if (!condition) problems.push(message); };
const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const p = path.join(dir, entry.name);
  return entry.isDirectory() ? files(p) : [p];
});
const all = files(site);
const html = all.filter(p => p.endsWith('.html'));
const scripts = all.filter(p => p.endsWith('.js'));
check(html.length >= 20, 'Expected complete visitor experience (20+ pages)');
check(scripts.length >= 15, 'Expected customer and API scripts');

for (const file of scripts) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  check(result.status === 0, 'JavaScript syntax: ' + path.relative(site, file) + ': ' + (result.stderr || '').trim());
}
for (const file of html) {
  const source = fs.readFileSync(file, 'utf8');
  check(/name=["']viewport["']/i.test(source), 'Mobile viewport absent: ' + path.relative(site, file));
  check(!/github\.com|view\s+source|source\s+code/i.test(source), 'Source-code link or wording in public HTML: ' + path.relative(site, file));
  for (const match of source.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const link = match[1];
    if (/^(https?:|mailto:|tel:|sms:|data:|#|\/\/)/i.test(link)) continue;
    if (/^javascript:/i.test(link)) { problems.push('Unsafe javascript URL in ' + path.relative(site, file)); continue; }
    const name = link.split(/[?#]/)[0];
    if (!name) continue;
    const target = path.resolve(path.dirname(file), name.replace(/^\//, ''));
    check(target.startsWith(site + path.sep) && fs.existsSync(target),
      'Missing local link ' + name + ' from ' + path.relative(site, file));
  }
}

const index = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const admin = fs.readFileSync(path.join(site, 'admin.html'), 'utf8');
const auth = fs.readFileSync(path.join(site, 'api/admin.js'), 'utf8');
const newsletter = fs.readFileSync(path.join(site, 'newsletter.js'), 'utf8');
const backend = fs.readFileSync(path.join(site, 'api/server.js'), 'utf8');
const owner = fs.readFileSync(path.join(site, 'owner-config.js'), 'utf8');
check(/noindex/i.test(index), 'Preview must remain noindex until approved');
check(/noindex/i.test(admin), 'Private admin page must remain noindex');
check(fs.existsSync(path.join(site, 'assets/smitha-watercolor.webp')), 'Watercolor asset missing');
check(admin.includes('adminSignIn') && admin.includes('adminWorkspace'), 'Private owner sign-in/workspace missing');
check(auth.includes('crypto.verify(') && auth.includes('SMITHA_ADMIN_EMAILS'), 'Server-verified owner allowlist missing');
check(newsletter.includes('autocomplete="email"') && newsletter.includes('newsletterConsent'), 'Email autofill and opt-in missing');
check(!backend.includes('response.status===409||response.status===400'), 'Provider HTTP 400 must not be treated as newsletter success');
check(owner.includes('encryptedEmail') && !/forwarding[^]*?email\s*:\s*["'][^"']+@/.test(owner), 'Private forwarding inbox may leak to public settings');

if (problems.length) {
  console.error('Hello Smitha release checks failed (' + problems.length + '):\n' + problems.map(x => ' - ' + x).join('\n'));
  process.exit(1);
}
console.log('Hello Smitha release checks passed: ' + html.length + ' pages, ' + scripts.length + ' JavaScript files, assets, links, owner and consent checks.');
