#!/usr/bin/env node
/**
 * Static HTML generator for OpenClaw Error Guide
 * Reads data/errors.json and generates all HTML pages
 */

const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/errors.json'), 'utf8'));
const categories = data.categories;

const severityMap = {
  high: { label: '심각', cls: 'badge-high' },
  medium: { label: '보통', cls: 'badge-medium' },
  low: { label: '낮음', cls: 'badge-low' }
};

const trustStars = (level) => {
  const filled = level;
  const empty = 3 - level;
  return '<span class="trust-stars">' + '<svg class="star filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'.repeat(filled) + '<svg class="star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'.repeat(empty) + '</span>';
};

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sidebarHtml(activePage, prefix) {
  const homeHref = prefix ? `${prefix}index.html` : 'index.html';
  const pagePrefix = prefix ? '' : 'pages/';
  
  let html = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <a href="${homeHref}" class="sidebar-logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          OpenClaw <span>Guide</span>
        </a>
        <button class="sidebar-close" id="sidebarClose" aria-label="메뉴 닫기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      
      <nav>
        <ul class="sidebar-nav">
          <li><a href="${homeHref}"${activePage === 'index' ? ' class="active"' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            홈
          </a></li>
        </ul>
        
        <div class="sidebar-section">카테고리</div>
        <ul class="sidebar-nav">`;
  
  categories.forEach((cat, i) => {
    const href = `${pagePrefix}${cat.id}.html`;
    const isActive = activePage === cat.id;
    html += `
          <li><a href="${href}"${isActive ? ' class="active"' : ''}>${i + 1}. ${escapeHtml(cat.name)}</a></li>`;
  });
  
  html += `
        </ul>
        
        <div class="sidebar-section">리소스</div>
        <ul class="sidebar-nav">
          <li><a href="https://github.com/anthropics/openclaw" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            GitHub
          </a></li>
          <li><a href="https://open.kakao.com/o/gugo7tCh" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            VoidLight 채팅방
          </a></li>
        </ul>
      </nav>
    </aside>`;
  return html;
}

function headerHtml() {
  return `
    <header class="mobile-header" id="mobileHeader">
      <button class="hamburger" id="hamburgerBtn" aria-label="메뉴 열기">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="mobile-title">OpenClaw Guide</span>
    </header>`;
}

function footerHtml() {
  return `
      <footer class="site-footer">
        <div class="footer-content">
          <p>OpenClaw Error Guide v${data.metadata.version} | 최종 업데이트: ${data.metadata.lastUpdated}</p>
          <div class="footer-links">
            <a href="https://github.com/anthropics/openclaw" target="_blank" rel="noopener">GitHub</a>
            <a href="https://openclaw.ai" target="_blank" rel="noopener">OpenClaw</a>
            <a href="https://open.kakao.com/o/gugo7tCh" target="_blank" rel="noopener">VoidLight 채팅방</a>
          </div>
        </div>
      </footer>`;
}

function backToTopHtml() {
  return `
    <button class="back-to-top" id="backToTop" aria-label="맨 위로">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
    </button>`;
}

function overlayHtml() {
  return `<div class="sidebar-overlay" id="sidebarOverlay"></div>`;
}

function scriptHtml() {
  return `
  <script>
    // Copy code
    function copyCode(btn) {
      const pre = btn.closest('.code-block').querySelector('pre');
      const code = pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '완료';
        setTimeout(() => btn.textContent = '복사', 2000);
      });
    }

    // Accordion toggle
    function toggleAccordion(header) {
      const item = header.parentElement;
      const isOpen = item.classList.contains('open');
      // Close all in same parent
      item.parentElement.querySelectorAll('.accordion-item.open').forEach(el => {
        if (el !== item) el.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    }

    // Mobile sidebar
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarClose');
    
    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
    
    if (hamburger) hamburger.addEventListener('click', openSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

    // Back to top
    const backToTop = document.getElementById('backToTop');
    const mainEl = document.querySelector('.main');
    if (mainEl && backToTop) {
      mainEl.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', mainEl.scrollTop > 400);
      });
      backToTop.addEventListener('click', () => {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.accordion-item, .search-target').forEach(item => {
          if (!query) {
            item.style.display = '';
            return;
          }
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(query) ? '' : 'none';
        });
        // Also filter category headings on index
        document.querySelectorAll('.category-section').forEach(sec => {
          const visible = sec.querySelectorAll('.card:not([style*="display: none"])').length;
          // keep sections visible if they have matching cards or no filtering applied
        });
      });
    }
  </script>`;
}

function headHtml(title, cssPath) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - OpenClaw Guide</title>
  <link rel="stylesheet" href="${cssPath}">
</head>
<body>`;
}

// Generate category page
function generateCategoryPage(category) {
  const prefix = '../';
  let html = headHtml(category.name, '../css/style.css');
  html += headerHtml();
  html += overlayHtml();
  html += `\n  <div class="layout">`;
  html += sidebarHtml(category.id, prefix);
  html += `
    <main class="main">
      <h1>${escapeHtml(category.name)}</h1>
      <p class="page-subtitle">${category.errors.length}개의 오류 유형 | 총 ${category.errors.reduce((s, e) => s + e.solutions.length, 0)}개의 해결 방법</p>
      
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="searchInput" placeholder="오류 검색..." class="search-input">
      </div>

      <div class="accordion">`;

  category.errors.forEach((error) => {
    const sev = severityMap[error.severity] || severityMap.medium;
    html += `
        <div class="accordion-item">
          <div class="accordion-header" onclick="toggleAccordion(this)">
            <div class="accordion-title-row">
              <span class="badge ${sev.cls}">${sev.label}</span>
              <h2>${escapeHtml(error.title)}</h2>
            </div>
            <div class="accordion-meta">
              <span class="solve-time">${error.solveTime}분</span>
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div class="accordion-body">
            <div class="error-section">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                증상
              </h3>
              <ul class="symptom-list">`;
    error.symptoms.forEach(s => {
      html += `
                <li>${escapeHtml(s)}</li>`;
    });
    html += `
              </ul>
            </div>

            <div class="error-section">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                원인
              </h3>
              <div class="cause-block">
                <p>${escapeHtml(error.cause)}</p>
              </div>
            </div>

            <div class="error-section">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                해결 방법
              </h3>`;

    error.solutions.forEach((sol) => {
      html += `
              <div class="solution-card">
                <div class="solution-header">
                  <h4>방법 ${sol.method}: ${escapeHtml(sol.title)}</h4>
                  <div class="trust-level">
                    <span class="trust-label">신뢰도</span>
                    ${trustStars(sol.trustLevel)}
                  </div>
                </div>
                <div class="code-block">
                  <div class="code-header">
                    <span>Terminal</span>
                    <button class="copy-btn" onclick="copyCode(this)">복사</button>
                  </div>
                  <pre><code>${sol.steps.map(s => escapeHtml(s)).join('\n')}</code></pre>
                </div>
              </div>`;
    });

    html += `
            </div>
          </div>
        </div>`;
  });

  html += `
      </div>`;
  html += footerHtml();
  html += `
    </main>
  </div>`;
  html += backToTopHtml();
  html += scriptHtml();
  html += `
</body>
</html>`;
  return html;
}

// Generate index page
function generateIndexPage() {
  let html = headHtml('OpenClaw 종합 오류 해결 가이드', 'css/style.css');
  html += headerHtml();
  html += overlayHtml();
  html += `\n  <div class="layout">`;
  html += sidebarHtml('index', '');
  html += `
    <main class="main">
      <div class="hero">
        <h1>OpenClaw 오류 해결 가이드</h1>
        <p class="lead">
          OpenClaw 설치 및 설정에서 발생하는 모든 오류에 대한 종합 해결 가이드입니다.
          실제 검증된 해결 방법과 단계별 명령어를 제공합니다.
        </p>
        <div class="hero-badges">
          <span class="badge badge-info">${data.metadata.totalErrors}개 오류 유형</span>
          <span class="badge badge-info">${data.metadata.totalSolutions}개 해결 방법</span>
          <span class="badge">v${data.metadata.version}</span>
        </div>
      </div>

      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="searchInput" placeholder="오류 검색 (예: EACCES, PowerShell, Telegram...)" class="search-input">
      </div>

      <h2>카테고리</h2>
      
      <div class="card-grid">`;

  categories.forEach((cat) => {
    const totalSolutions = cat.errors.reduce((s, e) => s + e.solutions.length, 0);
    const highCount = cat.errors.filter(e => e.severity === 'high').length;
    html += `
        <a href="pages/${cat.id}.html" class="card search-target">
          <div class="card-header-row">
            <h4>${escapeHtml(cat.name)}</h4>
            ${highCount > 0 ? `<span class="badge badge-high">${highCount} 심각</span>` : ''}
          </div>
          <p>${cat.errors.length}개 오류 | ${totalSolutions}개 해결 방법</p>
        </a>`;
  });

  html += `
      </div>

      <h2>전체 통계</h2>
      
      <table>
        <thead>
          <tr>
            <th>카테고리</th>
            <th>오류 수</th>
            <th>해결 방법</th>
            <th>심각</th>
          </tr>
        </thead>
        <tbody>`;

  categories.forEach(cat => {
    const totalSolutions = cat.errors.reduce((s, e) => s + e.solutions.length, 0);
    const highCount = cat.errors.filter(e => e.severity === 'high').length;
    html += `
          <tr>
            <td><a href="pages/${cat.id}.html">${escapeHtml(cat.name)}</a></td>
            <td>${cat.errors.length}</td>
            <td>${totalSolutions}</td>
            <td>${highCount > 0 ? `<span class="badge badge-high">${highCount}</span>` : '-'}</td>
          </tr>`;
  });

  html += `
        </tbody>
      </table>

      <div class="alert alert-info">
        <div class="alert-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;vertical-align:middle;margin-right:6px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          빠른 진단 방법
        </div>
        <p>문제 발생 시 아래 명령어를 순서대로 실행해보세요:</p>
        <div class="code-block" style="margin-top:0.75rem">
          <div class="code-header">
            <span>Terminal</span>
            <button class="copy-btn" onclick="copyCode(this)">복사</button>
          </div>
          <pre><code>openclaw status          # 전체 상태 확인
openclaw doctor          # 설정 문제 진단
openclaw logs --follow   # 실시간 로그 확인</code></pre>
        </div>
      </div>`;

  html += footerHtml();
  html += `
    </main>
  </div>`;
  html += backToTopHtml();
  html += scriptHtml();
  html += `
</body>
</html>`;
  return html;
}

// Write files
const publicDir = path.join(__dirname, 'public');
const pagesDir = path.join(publicDir, 'pages');
fs.mkdirSync(pagesDir, { recursive: true });

// Index
fs.writeFileSync(path.join(publicDir, 'index.html'), generateIndexPage());
console.log('Generated: public/index.html');

// Category pages
categories.forEach(cat => {
  const filename = `${cat.id}.html`;
  fs.writeFileSync(path.join(pagesDir, filename), generateCategoryPage(cat));
  console.log(`Generated: public/pages/${filename}`);
});

console.log(`\nDone! ${categories.length + 1} files generated.`);
