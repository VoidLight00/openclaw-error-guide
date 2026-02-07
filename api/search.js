const fs = require('fs');
const path = require('path');

let _data = null;
function getData() {
  if (!_data) {
    _data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'errors.json'), 'utf8'));
  }
  return _data;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

module.exports = (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const q = (url.searchParams.get('q') || '').toLowerCase().trim();

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter: q' });
  }

  const data = getData();
  const results = [];

  for (const cat of data.categories) {
    for (const err of cat.errors) {
      const searchText = [
        err.title,
        ...err.symptoms,
        err.cause,
        ...err.solutions.map(s => s.title)
      ].join(' ').toLowerCase();

      if (q.split(/\s+/).every(term => searchText.includes(term))) {
        results.push({
          category: cat.name,
          categoryId: cat.id,
          ...err
        });
      }
    }
  }

  res.status(200).json({ query: q, count: results.length, results });
};
