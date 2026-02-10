const fs = require('fs');
const path = require('path');

// Load error index
const errorIndex = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'error-index.json'), 'utf-8'));

// Matching logic extracted from api/chat.js
function matchErrors(message) {
  const query = message.toLowerCase();
  const queryWords = query.split(/\s+/).filter(w => w.length > 0);
  const scored = errorIndex.map(err => {
    const text = (err.title + ' ' + err.error + ' ' + (err.symptoms || []).join(' ') + ' ' + err.category + ' ' + (err.solutions || []).join(' ')).toLowerCase();
    let score = queryWords.filter(w => text.includes(w)).length;
    if (err.error && query.includes(err.error.toLowerCase())) score += 5;
    if (err.id && query.includes(err.id)) score += 3;
    return { id: err.id, title: err.title, score };
  }).sort((a, b) => b.score - a.score);
  const topErrors = scored.filter(e => e.score > 0).slice(0, 10);
  return topErrors;
}

// Generate test questions for each error
function generateQuestions(err) {
  const questions = [];
  
  // 1. Title as-is
  questions.push(err.title);
  
  // 2. Each symptom
  if (err.symptoms) {
    err.symptoms.forEach(s => questions.push(s));
  }
  
  // 3. Error message
  if (err.error) {
    questions.push(err.error);
  }
  
  // 4. ID-based
  questions.push(err.id);
  
  // 5. Extract key terms for natural language questions
  const title = err.title;
  
  // Korean natural language variants
  const koreanPatterns = [
    title.replace(/[()（）]/g, ' ').trim() + ' 해결',
    title.split(/[(/]/, 1)[0].trim() + ' 오류',
    title.split(/[(/]/, 1)[0].trim() + ' 안돼요',
  ];
  questions.push(...koreanPatterns);
  
  // Beginner style
  const beginnerQ = title.split(/[\s(/]+/).filter(w => w.length > 2).slice(0, 2).join(' ');
  if (beginnerQ.length > 3) questions.push(beginnerQ);

  // Ensure at least 8 questions
  while (questions.length < 8) {
    // Category + partial title
    const words = err.title.split(/\s+/).filter(w => w.length > 1);
    const subset = words.slice(0, Math.min(3, words.length)).join(' ');
    questions.push(err.category + ' ' + subset);
    if (questions.length < 8) {
      questions.push(subset + ' 문제');
    }
  }
  
  return [...new Set(questions)]; // deduplicate
}

// Run tests
const results = { total: 0, pass: 0, fail: 0, failures: [], perError: {} };

errorIndex.forEach(err => {
  const questions = generateQuestions(err);
  let errPassed = false;
  
  questions.forEach(q => {
    results.total++;
    const matches = matchErrors(q);
    const matchedIds = matches.map(m => m.id);
    const found = matchedIds.includes(err.id);
    const rank = found ? matchedIds.indexOf(err.id) + 1 : -1;
    const topScore = matches.length > 0 ? matches[0].score : 0;
    const errScore = found ? matches.find(m => m.id === err.id).score : 0;
    
    if (found) {
      results.pass++;
      errPassed = true;
    } else {
      results.fail++;
      results.failures.push({
        targetId: err.id,
        targetTitle: err.title,
        query: q,
        topMatches: matches.slice(0, 3).map(m => `${m.id}(${m.score})`),
      });
    }
  });
  
  results.perError[err.id] = { 
    questions: questions.length, 
    anyPassed: errPassed,
    title: err.title
  };
});

// Errors that never matched
const neverMatched = Object.entries(results.perError)
  .filter(([, v]) => !v.anyPassed)
  .map(([id, v]) => ({ id, title: v.title }));

console.log('=== TEST RESULTS ===');
console.log(`Total tests: ${results.total}`);
console.log(`Pass: ${results.pass} (${(results.pass/results.total*100).toFixed(1)}%)`);
console.log(`Fail: ${results.fail} (${(results.fail/results.total*100).toFixed(1)}%)`);
console.log(`Errors tested: ${errorIndex.length}`);
console.log(`Errors never matched: ${neverMatched.length}`);

if (neverMatched.length > 0) {
  console.log('\n=== NEVER MATCHED ERRORS ===');
  neverMatched.forEach(e => console.log(`  ${e.id}: ${e.title}`));
}

if (results.failures.length > 0) {
  console.log(`\n=== FAILED QUERIES (showing first 30) ===`);
  results.failures.slice(0, 30).forEach(f => {
    console.log(`  [${f.targetId}] "${f.query.substring(0, 60)}" → top: ${f.topMatches.join(', ')}`);
  });
}

// Save results
fs.writeFileSync(path.join(__dirname, 'test-results.json'), JSON.stringify({
  summary: { total: results.total, pass: results.pass, fail: results.fail, passRate: (results.pass/results.total*100).toFixed(1) + '%' },
  neverMatched,
  failures: results.failures,
}, null, 2));

console.log('\nResults saved to test-results.json');
