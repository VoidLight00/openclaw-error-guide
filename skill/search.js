#!/usr/bin/env node
/**
 * CLI: node search.js <query>
 * Searches errors.json and returns matching errors with solutions
 * Output: formatted markdown for AI consumption
 */

const fs = require('fs');
const path = require('path');

const query = process.argv.slice(2).join(' ').toLowerCase().trim();
if (!query) {
  console.log('Usage: node search.js <query>');
  console.log('Example: node search.js "EACCES"');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/errors.json'), 'utf8'));
const severityMap = { high: '심각', medium: '보통', low: '낮음' };
const trustStars = (n) => '\u2605'.repeat(n) + '\u2606'.repeat(3 - n);

const results = [];
for (const cat of data.categories) {
  for (const err of cat.errors) {
    const searchText = [
      err.title,
      ...err.symptoms,
      err.cause,
      ...err.solutions.map(s => s.title)
    ].join(' ').toLowerCase();

    if (query.split(/\s+/).every(term => searchText.includes(term))) {
      results.push({ category: cat.name, error: err });
    }
  }
}

if (results.length === 0) {
  console.log(`No results found for: "${query}"`);
  process.exit(0);
}

console.log(`# Search Results: "${query}" (${results.length} found)\n`);

for (const { category, error } of results) {
  console.log(`## ${error.title}`);
  console.log(`- Category: ${category}`);
  console.log(`- Severity: ${severityMap[error.severity] || '보통'}`);
  console.log(`- Solve Time: ${error.solveTime}min\n`);
  console.log('**증상:**');
  for (const s of error.symptoms) console.log(`- ${s}`);
  console.log(`\n**원인:** ${error.cause}\n`);
  console.log('**해결 방법:**\n');
  for (const sol of error.solutions) {
    console.log(`### 방법 ${sol.method}: ${sol.title} (${trustStars(sol.trustLevel)})`);
    console.log('```');
    console.log(sol.steps.join('\n'));
    console.log('```\n');
  }
}
