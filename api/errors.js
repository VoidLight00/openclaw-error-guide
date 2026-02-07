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
  const categoryId = url.searchParams.get('category') || '';

  const data = getData();

  if (categoryId) {
    const cat = data.categories.find(c => c.id === categoryId);
    if (!cat) return res.status(404).json({ error: `Category not found: ${categoryId}` });
    return res.status(200).json({ category: cat.name, categoryId: cat.id, errors: cat.errors });
  }

  res.status(200).json(data);
};
