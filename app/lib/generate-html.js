const fs = require('fs');
const path = require('path');
const errors = require('../../data/errors.json');

function generateHTML() {
  const publicDir = path.join(__dirname, '../../public');
  
  // Index page
  const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw Installation Guide</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <a href="index.html" class="sidebar-logo">
        [CLAW] OpenClaw <span>Guide</span>
      </a>
      
      <nav>
        <ul class="sidebar-nav">
          <li><a href="index.html" class="active">Home</a></li>
        </ul>
        
        <div class="sidebar-section">Installation</div>
        <ul class="sidebar-nav">
          ${errors.categories.map((cat, i) => 
            `<li><a href="pages/${cat.id}.html">${i + 1}. ${cat.name}</a></li>`
          ).join('')}
        </ul>
        
        <div class="sidebar-section">Resources</div>
        <ul class="sidebar-nav">
          <li><a href="https://docs.openclaw.ai" target="_blank">Official Docs</a></li>
          <li><a href="https://github.com/openclaw/openclaw" target="_blank">GitHub</a></li>
        </ul>
      </nav>
    </aside>

    <main class="main">
      <div class="hero">
        <h1>OpenClaw Installation Guide</h1>
        <p class="lead">
          Complete installation and troubleshooting reference for OpenClaw setup and configuration.
        </p>
        <div class="hero-badges">
          <span class="badge badge-info">39 Error Types</span>
          <span class="badge">100+ Solutions</span>
        </div>
      </div>

      <h2>Quick Overview</h2>
      
      <div class="card-grid">
        ${errors.categories.map(cat => 
          `<div class="card">
            <h4>${cat.name}</h4>
            <p>${cat.errors.length} error types with multiple solutions for each.</p>
          </div>`
        ).join('')}
      </div>

      <h2>Get Started</h2>
      
      <div class="alert alert-info">
        <div class="alert-title">Start Learning</div>
        <p>Select a category from the left sidebar to begin exploring error solutions.</p>
      </div>

      <h2>Statistics</h2>
      
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Errors</th>
            <th>Solutions</th>
          </tr>
        </thead>
        <tbody>
          ${errors.categories.map(cat => {
            const solutions = cat.errors.reduce((sum, err) => sum + err.solutions.length, 0);
            return `<tr>
              <td><a href="pages/${cat.id}.html">${cat.name}</a></td>
              <td>${cat.errors.length}</td>
              <td>${solutions}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </main>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(publicDir, 'index.html'), indexHTML);

  // Category pages
  errors.categories.forEach(category => {
    const categoryHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${category.name}</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <a href="../index.html" class="sidebar-logo">
        [CLAW] OpenClaw <span>Guide</span>
      </a>
      
      <nav>
        <ul class="sidebar-nav">
          <li><a href="../index.html">Home</a></li>
        </ul>
        
        <div class="sidebar-section">Installation</div>
        <ul class="sidebar-nav">
          ${errors.categories.map((cat, i) => 
            `<li><a href="${cat.id}.html" ${cat.id === category.id ? 'class="active"' : ''}>${i + 1}. ${cat.name}</a></li>`
          ).join('')}
        </ul>
      </nav>
    </aside>

    <main class="main">
      <h1>${category.name}</h1>
      
      ${category.errors.map(error => {
        const severityLabel = error.severity === 'high' ? 'CRITICAL' : error.severity === 'medium' ? 'HIGH' : 'MEDIUM';
        return `<div style="margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border);">
          <h2>${error.title}</h2>
          
          <div class="hero-badges" style="margin-bottom: 1.5rem;">
            <span class="badge badge-info">${severityLabel}</span>
            <span class="badge">${error.solveTime} min</span>
          </div>

          <h3>Symptoms</h3>
          <ul style="list-style: none; padding: 0;">
            ${error.symptoms.map(s => `<li style="margin-bottom: 0.5rem; color: var(--text-secondary);">• ${s}</li>`).join('')}
          </ul>

          <h3>Root Cause</h3>
          <div class="alert alert-info">
            <p>${error.cause}</p>
          </div>

          <h3>Solutions</h3>
          ${error.solutions.map((sol, i) => `
            <div class="step">
              <h4>${sol.method}: ${sol.title}</h4>
              <p>Trust Level: ${'★'.repeat(sol.trustLevel)}${'☆'.repeat(3-sol.trustLevel)}</p>
              <div class="code-header">
                <span>Code</span>
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
              </div>
              <pre><code>${sol.steps.join('\n')}</code></pre>
              ${sol.features ? `
                <h5 style="margin-top: 1rem; margin-bottom: 0.5rem; color: var(--text-primary);">Features:</h5>
                <ul style="list-style: none; padding: 0; color: var(--text-secondary);">
                  ${sol.features.map(f => `<li style="margin-bottom: 0.25rem;">✓ ${f}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>`;
      }).join('')}
    </main>
  </div>

  <script>
    function copyCode(btn) {
      const code = btn.nextElementSibling.textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    }
  </script>
</body>
</html>`;

    const pagesDir = path.join(publicDir, 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    fs.writeFileSync(path.join(pagesDir, `${category.id}.html`), categoryHTML);
  });

  console.log('HTML pages generated successfully');
}

generateHTML();
