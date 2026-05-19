import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const reportsDir = new URL('../reports/', import.meta.url);
const reportFile = new URL('../reports/test-report.tap', import.meta.url);

await mkdir(reportsDir, { recursive: true });

const child = spawn(process.execPath, ['--test', '--test-reporter', 'tap', 'test/*.test.js'], {
  cwd: new URL('..', import.meta.url),
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe']
});

let report = '';

child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  report += text;
  process.stdout.write(text);
});

child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  report += text;
  process.stderr.write(text);
});

const exitCode = await new Promise((resolve) => {
  child.on('close', resolve);
});

await writeFile(reportFile, report, 'utf8');

if (exitCode !== 0) {
  process.exit(exitCode ?? 1);
}