#!/usr/bin/env node
/**
 * Generates public/llms.txt and public/llms-full.txt from data/errors.json
 * Following the llms.txt standard (https://llmstxt.org/)
 */

const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/errors.json'), 'utf8'));
const { categories, metadata } = data;

const severityMap = { high: '심각', medium: '보통', low: '낮음' };
const trustStars = (level) => '\u2605'.repeat(level) + '\u2606'.repeat(3 - level);

// --- llms.txt ---
const llmsTxt = `# OpenClaw Error Guide

> OpenClaw 설치 및 설정 오류 해결 가이드. ${metadata.totalErrors}개 에러, ${metadata.totalSolutions}개 솔루션.

## Docs
- [전체 가이드](https://openclaw-error-guide.vercel.app/llms-full.txt): 모든 에러와 솔루션

## Categories
${categories.map(c => `- ${c.name}`).join('\n')}
`;

// --- llms-full.txt ---
let full = `# OpenClaw Error Guide - Full Reference

> ${metadata.totalErrors}개 에러, ${metadata.totalSolutions}개 솔루션 | v${metadata.version} | ${metadata.lastUpdated}

`;

for (const cat of categories) {
  full += `## ${cat.name}\n\n`;
  for (const err of cat.errors) {
    full += `### ${err.title}\n`;
    full += `- Severity: ${severityMap[err.severity] || '보통'}\n`;
    full += `- Solve Time: ${err.solveTime}min\n\n`;
    full += `**증상:**\n`;
    for (const s of err.symptoms) {
      full += `- ${s}\n`;
    }
    full += `\n**원인:** ${err.cause}\n\n`;
    full += `**해결 방법:**\n\n`;
    for (const sol of err.solutions) {
      full += `#### 방법 ${sol.method}: ${sol.title} (신뢰도: ${trustStars(sol.trustLevel)})\n`;
      full += '```bash\n';
      full += sol.steps.join('\n') + '\n';
      full += '```\n\n';
    }
  }
}

const publicDir = path.join(__dirname, 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt);
fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), full);
console.log('Generated: public/llms.txt, public/llms-full.txt');
