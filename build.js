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
          <img src="${homeHref === '/' ? '' : '../'}logo.png" alt="VoidLight" style="width:28px;height:28px;border-radius:6px;object-fit:contain">
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
      <button class="theme-toggle" id="themeToggle" aria-label="테마 전환" onclick="toggleTheme()"><svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'/></svg></button>
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
    // ── Dark/Light mode toggle ──
    function toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      document.getElementById('themeToggle').innerHTML = next === 'light' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
    (function initTheme() {
      const saved = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
      const btn = document.getElementById('themeToggle');
      if (btn) btn.innerHTML = saved === 'light' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    })();

    // ── Copy code (feature #4) ──
    function copyCode(btn) {
      const pre = btn.closest('.code-block').querySelector('pre');
      const code = pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M20 6L9 17l-5-5"/></svg> 복사됨!';
        btn.style.color = '#22c55e';
        setTimeout(() => { btn.textContent = '복사'; btn.style.color = ''; }, 2000);
      });
    }

    // ── Error report modal (feature #1) ──
    function openReportModal() {
      const m = document.getElementById('reportModal');
      if (m) m.style.display = 'flex';
    }
    function closeReportModal() {
      const m = document.getElementById('reportModal');
      if (m) m.style.display = 'none';
    }
    function submitReport() {
      const title = document.getElementById('reportTitle')?.value?.trim();
      const symptom = document.getElementById('reportSymptom')?.value?.trim();
      const screenshot = document.getElementById('reportScreenshot')?.value?.trim();
      if (!title || !symptom) { alert('제목과 증상을 입력해주세요.'); return; }
      const reports = JSON.parse(localStorage.getItem('error_reports') || '[]');
      reports.push({ title, symptom, screenshot, date: new Date().toISOString() });
      localStorage.setItem('error_reports', JSON.stringify(reports));
      alert('제보가 저장되었습니다. 감사합니다!');
      closeReportModal();
      document.getElementById('reportTitle').value = '';
      document.getElementById('reportSymptom').value = '';
      document.getElementById('reportScreenshot').value = '';
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

    // Auto-open accordion from URL hash
    (function() {
      function openFromHash() {
        const hash = window.location.hash;
        if (!hash) return;
        const el = document.querySelector(hash);
        if (el && el.classList.contains('accordion-item')) {
          el.classList.add('open');
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
          el.style.boxShadow = '0 0 0 2px #000';
          setTimeout(() => el.style.boxShadow = '', 2000);
        }
      }
      openFromHash();
      window.addEventListener('hashchange', openFromHash);
    })();

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

    // Fuzzy Search (Fuse.js)
    const searchInput = document.getElementById('searchInput');
    if (searchInput && typeof Fuse !== 'undefined') {
      const items = Array.from(document.querySelectorAll('.accordion-item, .search-target'));
      const fuseList = items.map((el, i) => ({ idx: i, text: el.textContent }));
      const fuse = new Fuse(fuseList, {
        keys: ['text'],
        threshold: 0.4,
        distance: 200,
        minMatchCharLength: 2,
        ignoreLocation: true
      });
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (!query) {
          items.forEach(el => el.style.display = '');
          document.querySelectorAll('.category-section').forEach(s => s.style.display = '');
          return;
        }
        const results = fuse.search(query);
        const matchedIdx = new Set(results.map(r => r.item.idx));
        items.forEach((el, i) => el.style.display = matchedIdx.has(i) ? '' : 'none');
        // Show/hide category sections based on visible cards
        document.querySelectorAll('.category-section').forEach(sec => {
          const hasVisible = sec.querySelectorAll('.card:not([style*="display: none"])').length > 0;
          sec.style.display = hasVisible ? '' : 'none';
        });
      });
    }
  </script>

  <!-- AI Guide Bot -->
  <div id="chatbot-fab" onclick="toggleChat()" style="position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 24px rgba(0,0,0,0.3);z-index:9999;font-size:20px;transition:all 0.3s;border:2px solid #333" onmouseover="this.style.transform='scale(1.08)';this.style.boxShadow='0 6px 28px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 24px rgba(0,0,0,0.3)'">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  </div>

  <div id="chatbot-panel" style="display:none;position:fixed;bottom:90px;right:24px;width:380px;max-height:540px;background:#fff;border:1px solid #e0e0e0;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,0.15);z-index:9999;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="padding:16px 20px;background:#000;color:#fff;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:10px">
        <div>
          <div style="font-weight:700;font-size:15px;letter-spacing:-0.3px">가이드봇</div>
          <div style="font-size:11px;color:#999;margin-top:2px">오류 해결 AI 어시스턴트</div>
        </div>
        <span id="usage-badge" style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:600;background:#f5f5f5;color:#666">10/10 무료</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span onclick="resetChat()" style="cursor:pointer;font-size:12px;color:#666;transition:color 0.2s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#666'" title="대화 초기화"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span>
        <span onclick="toggleChat()" style="cursor:pointer;font-size:18px;color:#666;transition:color 0.2s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#666'">✕</span>
      </div>
    </div>
    <div id="chat-messages" style="height:340px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#fafafa">
      <div style="background:#fff;padding:12px 16px;border-radius:14px;color:#333;font-size:13px;max-width:85%;box-shadow:0 1px 3px rgba(0,0,0,0.08);line-height:1.6">
        안녕하세요! 오류 증상을 설명해주시면<br>해결 방법을 안내해드릴게요.<br><br><span style="color:#888;font-size:11px"><svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' style='vertical-align:middle'><path d='M9 18h6'/><path d='M10 22h4'/><path d='M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z'/></svg> 스크린샷의 오류 메시지를 텍스트로 붙여넣어주시면 더 정확한 진단이 가능합니다.</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span onclick="quickQ(this)" style="background:#fff;border:1px solid #ddd;padding:6px 12px;border-radius:20px;font-size:11px;color:#555;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#000';this.style.color='#000'" onmouseout="this.style.borderColor='#ddd';this.style.color='#555'">설치 오류</span>
        <span onclick="quickQ(this)" style="background:#fff;border:1px solid #ddd;padding:6px 12px;border-radius:20px;font-size:11px;color:#555;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#000';this.style.color='#000'" onmouseout="this.style.borderColor='#ddd';this.style.color='#555'">연결 안됨</span>
        <span onclick="quickQ(this)" style="background:#fff;border:1px solid #ddd;padding:6px 12px;border-radius:20px;font-size:11px;color:#555;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#000';this.style.color='#000'" onmouseout="this.style.borderColor='#ddd';this.style.color='#555'">인증 오류</span>
        <span onclick="quickQ(this)" style="background:#fff;border:1px solid #ddd;padding:6px 12px;border-radius:20px;font-size:11px;color:#555;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#000';this.style.color='#000'" onmouseout="this.style.borderColor='#ddd';this.style.color='#555'">텔레그램 봇</span>
      </div>
    </div>
    <div style="padding:12px 16px;border-top:1px solid #eee;display:flex;gap:8px;background:#fff">
      <input id="chat-input" type="text" placeholder="오류 증상을 입력하세요..." onkeydown="if(event.key==='Enter')sendChat()" style="flex:1;padding:10px 16px;border-radius:24px;border:1px solid #ddd;background:#f5f5f5;color:#333;font-size:13px;outline:none;transition:border 0.2s" onfocus="this.style.borderColor='#000'" onblur="this.style.borderColor='#ddd'">
      <button onclick="sendChat()" style="padding:10px 18px;border-radius:24px;border:none;background:#000;color:#fff;cursor:pointer;font-size:13px;font-weight:600;transition:opacity 0.2s" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>

  <script>
  // ── Chatbot session storage (feature #5) ──
  function saveChatHistory() {
    const box = document.getElementById('chat-messages');
    if (box) sessionStorage.setItem('chat_history', box.innerHTML);
  }
  function restoreChatHistory() {
    const saved = sessionStorage.getItem('chat_history');
    const box = document.getElementById('chat-messages');
    if (saved && box) box.innerHTML = saved;
  }
  function resetChat() {
    sessionStorage.removeItem('chat_history');
    const box = document.getElementById('chat-messages');
    if (box) {
      box.innerHTML = '<div style="background:#fff;padding:12px 16px;border-radius:14px;color:#333;font-size:13px;max-width:85%;box-shadow:0 1px 3px rgba(0,0,0,0.08);line-height:1.6">안녕하세요! 오류 증상을 설명해주시면<br>해결 방법을 안내해드릴게요.<br><br><span style="color:#888;font-size:11px"><svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' style='vertical-align:middle'><path d='M9 18h6'/><path d='M10 22h4'/><path d='M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z'/></svg> 스크린샷의 오류 메시지를 텍스트로 붙여넣어주시면 더 정확한 진단이 가능합니다.</span></div>';
    }
  }
  function toggleChat() {
    const p = document.getElementById('chatbot-panel');
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
    if (p.style.display === 'block') {
      restoreChatHistory();
      document.getElementById('chat-input')?.focus();
    }
    checkUsage();
  }
  function quickQ(el) {
    document.getElementById('chat-input').value = el.textContent + ' 해결 방법 알려주세요';
    sendChat();
  }
  function getUsage() {
    const data = JSON.parse(localStorage.getItem('guidebot_usage') || '{}');
    const today = new Date().toISOString().slice(0,10);
    if (data.date !== today) return { date: today, count: 0, pro: data.pro || false };
    return data;
  }
  function setUsage(u) { localStorage.setItem('guidebot_usage', JSON.stringify(u)); }
  function checkUsage() {
    const u = getUsage();
    const remaining = Math.max(0, 10 - u.count);
    const badge = document.getElementById('usage-badge');
    if (!badge) return;
    if (u.pro) {
      badge.textContent = 'PRO 무제한';
      badge.style.background = '#000'; badge.style.color = '#fff';
    } else {
      badge.textContent = remaining + '/10 무료';
      badge.style.background = remaining > 0 ? '#f5f5f5' : '#000';
      badge.style.color = remaining > 0 ? '#666' : '#fff';
    }
  }
  function showPaywall() {
    const box = document.getElementById('chat-messages');
    box.innerHTML += \`<div style="background:#fff;padding:16px;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,0.08);text-align:center">
      <div style="margin-bottom:8px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
      <div style="font-weight:700;color:#000;font-size:14px;margin-bottom:4px">무료 체험이 끝났습니다</div>
      <div style="color:#666;font-size:12px;margin-bottom:12px">월 \$3로 무제한 AI 오류 진단을 이용하세요</div>
      <button onclick="subscribe()" style="width:100%;padding:12px;border-radius:12px;border:none;background:#000;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.2s;margin-bottom:8px" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">구독하기 — \$3/월</button>
      <div style="color:#999;font-size:11px">언제든 해지 가능 · 안전한 결제</div>
    </div>\`;
    box.scrollTop = box.scrollHeight;
  }
  function subscribe() {
    // Creem checkout URL
    // TODO: 프로덕션 전환 시 test URL을 프로덕션 URL로 교체
    // 현재: https://www.creem.io/test/payment/prod_6nhRuGebUqLLtBkGJcHrNO (테스트)
    // 프로덕션: https://www.creem.io/payment/prod_XXXXX (프로덕션 키 수령 후 전환)
    const creemUrl = 'https://www.creem.io/test/payment/prod_6nhRuGebUqLLtBkGJcHrNO?success_url=' + encodeURIComponent(window.location.origin + '?pro=activated');
    window.open(creemUrl, '_blank');
  }
  // Check for pro activation via URL param (after Creem redirect) or admin code
  (function() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pro') === 'activated') {
      const u = getUsage(); u.pro = true; setUsage(u);
      window.history.replaceState({}, '', window.location.pathname);
    }
  })();
  function unlockAdmin() {
    const code = prompt('관리자 코드를 입력하세요');
    if (code === 'ediboom-admin-2026') {
      const u = getUsage(); u.pro = true; setUsage(u); checkUsage();
      alert('관리자 모드 활성화!');
    }
  }
  // Triple-click on header title to open admin unlock
  document.addEventListener('DOMContentLoaded', () => {
    const badge = document.getElementById('usage-badge');
    if (badge) badge.addEventListener('dblclick', unlockAdmin);
  });
  async function sendChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    // Check usage
    const u = getUsage();
    if (!u.pro && u.count >= 10) { showPaywall(); input.value = ''; return; }

    const box = document.getElementById('chat-messages');
    box.innerHTML += '<div style="background:#000;padding:10px 16px;border-radius:14px;color:#fff;font-size:13px;max-width:85%;align-self:flex-end">'+msg.replace(/</g,'&lt;')+'</div>';
    input.value = '';
    box.innerHTML += '<div id="typing" style="background:#fff;padding:12px 16px;border-radius:14px;color:#999;font-size:13px;box-shadow:0 1px 3px rgba(0,0,0,0.08)"><span style="animation:pulse 1.5s infinite">분석 중</span><style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}</style></div>';
    box.scrollTop = box.scrollHeight;

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ message: msg })
      });
      const d = await r.json();
      document.getElementById('typing')?.remove();
      if (d.error) throw new Error(d.error);
      let html = d.answer.replace(/</g,'&lt;').replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g,'<a href="$2" style="color:#000;font-weight:600;text-decoration:underline;text-underline-offset:2px" target="_blank">$1 →</a>').replace(/\\*\\*(.+?)\\*\\*/g,'<b>$1</b>').replace(/\`([^\`]+)\`/g,'<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:12px;color:#333">$1</code>').replace(/\\n/g,'<br>');
      box.innerHTML += '<div style="background:#fff;padding:12px 16px;border-radius:14px;color:#333;font-size:13px;max-width:85%;line-height:1.6;box-shadow:0 1px 3px rgba(0,0,0,0.08)">'+html+'</div>';
      // Update usage
      u.count++; setUsage(u); checkUsage();
      saveChatHistory();
    } catch(e) {
      document.getElementById('typing')?.remove();
      box.innerHTML += '<div style="background:#fff;border:1px solid #e0e0e0;padding:12px 16px;border-radius:14px;color:#c00;font-size:13px">일시적 오류가 발생했습니다. 다시 시도해주세요.</div>';
      saveChatHistory();
    }
    box.scrollTop = box.scrollHeight;
  }
  </script>`;
}

const SITE_URL = 'https://openclaw-error-guide.vercel.app';

function headHtml(title, cssPath, pageUrl, description) {
  const fullTitle = `${escapeHtml(title)} - OpenClaw Guide`;
  const desc = description || 'OpenClaw 설치 및 설정 오류를 빠르게 해결하세요. 검증된 해결 방법과 단계별 가이드를 제공합니다.';
  const canonical = pageUrl ? `${SITE_URL}/${pageUrl}` : SITE_URL;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="ko_KR">
  <link rel="stylesheet" href="${cssPath}">
  <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0"></script>
</head>
<body>`;
}

// Generate category page
function generateCategoryPage(category) {
  const prefix = '../';
  const desc = `${category.name} - ${category.errors.length}개 오류 유형과 검증된 해결 방법. OpenClaw 오류 해결 가이드.`;
  let html = headHtml(category.name, '../css/style.css', `pages/${category.id}.html`, desc);
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
        <div class="accordion-item" id="error-${error.id}">
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
    (error.symptoms || []).forEach(s => {
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
                <p>${escapeHtml(error.cause || '확인 중')}</p>
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
      </div>

      <!-- 에러 제보 -->
      <div class="error-report-section" style="margin-top:2rem;padding:1.5rem;border:1px dashed var(--border);border-radius:var(--radius);text-align:center">
        <h3 style="margin-bottom:0.5rem">찾는 오류가 없나요?</h3>
        <p style="color:var(--text-secondary);font-size:14px;margin-bottom:1rem">새로운 오류를 제보해주시면 가이드에 추가하겠습니다.</p>
        <button onclick="openReportModal()" style="padding:10px 24px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg-tertiary);color:var(--text-primary);cursor:pointer;font-size:14px;font-weight:600;transition:all 0.2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'"><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' style='vertical-align:middle'><path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/></svg> 새 오류 제보하기</button>
      </div>

      <!-- 제보 모달 -->
      <div id="reportModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:none;align-items:center;justify-content:center">
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:24px;width:90%;max-width:420px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h3>오류 제보</h3>
            <span onclick="closeReportModal()" style="cursor:pointer;font-size:20px;color:var(--text-muted)">✕</span>
          </div>
          <input id="reportTitle" placeholder="오류 제목" style="width:100%;padding:10px;margin-bottom:10px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg-tertiary);color:var(--text-primary);font-size:14px">
          <textarea id="reportSymptom" placeholder="증상 설명" rows="3" style="width:100%;padding:10px;margin-bottom:10px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg-tertiary);color:var(--text-primary);font-size:14px;resize:vertical"></textarea>
          <input id="reportScreenshot" placeholder="스크린샷 URL (선택)" style="width:100%;padding:10px;margin-bottom:16px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg-tertiary);color:var(--text-primary);font-size:14px">
          <button onclick="submitReport()" style="width:100%;padding:12px;border-radius:var(--radius);border:none;background:var(--accent);color:#fff;font-size:14px;font-weight:600;cursor:pointer">제출하기</button>
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

// Generate index page
function generateIndexPage() {
  let html = headHtml('OpenClaw 종합 오류 해결 가이드', 'css/style.css', '', 'OpenClaw 설치·설정 오류 121개의 종합 해결 가이드. Windows, macOS, Linux, 인증, 게이트웨이 등 모든 오류 유형을 다룹니다.');
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

      <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> 자주 찾는 오류 TOP 5</h2>
      <div class="card-grid top5-grid">
        <a href="pages/windows.html#error-win-1" class="card top5-card">
          <span class="top5-rank">1</span>
          <h4>PowerShell 실행정책 오류</h4>
          <p>Windows에서 스크립트 실행 차단</p>
        </a>
        <a href="pages/common.html#error-common-1" class="card top5-card">
          <span class="top5-rank">2</span>
          <h4>EACCES Permission 오류</h4>
          <p>npm 글로벌 설치 권한 문제</p>
        </a>
        <a href="pages/channels.html#error-ch-3" class="card top5-card">
          <span class="top5-rank">3</span>
          <h4>Telegram 그룹 메시지 수신 오류</h4>
          <p>Privacy Mode 설정 문제</p>
        </a>
        <a href="pages/oauth.html#error-oauth-3" class="card top5-card">
          <span class="top5-rank">4</span>
          <h4>OAuth 토큰 만료</h4>
          <p>setup-token 갱신 필요</p>
        </a>
        <a href="pages/gateway.html#error-gw-3" class="card top5-card">
          <span class="top5-rank">5</span>
          <h4>WebSocket 연결 실패</h4>
          <p>게이트웨이 WebSocket 접속 불가</p>
        </a>
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

// Generate error index for AI chatbot
const errorIndex = [];
const catSlugs = { 'Windows 전용 오류':'windows','macOS 전용 오류':'macos','Linux 전용 오류':'linux','가상환경 설정 오류':'virtualenv','공통 오류':'common','인증 (OAuth) 오류':'oauth','게이트웨이 접속 오류':'gateway','채널 통합 오류':'channels','클라이언트 연결 오류':'client','런타임 오류':'runtime','브라우저 도구 오류':'browser','채널 확장 오류':'channels-ext','스킬 & 모델 오류':'skills' };
categories.forEach(cat => {
  const slug = cat.id || catSlugs[cat.name] || 'unknown';
  cat.errors.forEach(err => {
    errorIndex.push({ id:err.id, title:err.title, error:err.error||'', symptoms:err.symptoms||[], category:cat.name, url:`pages/${slug}.html#error-${err.id}`, solutions: err.solutions.slice(0,2).map(s => s.title + ': ' + (s.steps||[]).join(' → ')) });
  });
});
fs.writeFileSync(path.join(publicDir, 'error-index.json'), JSON.stringify(errorIndex, null, 0));
console.log(`Generated: public/error-index.json (${errorIndex.length} errors)`);

// SEO: sitemap.xml
const sitemapUrls = [`${SITE_URL}/`];
categories.forEach(cat => sitemapUrls.push(`${SITE_URL}/pages/${cat.id}.html`));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url><loc>${u}</loc><lastmod>${data.metadata.lastUpdated}</lastmod></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('Generated: public/sitemap.xml');

// SEO: robots.txt
fs.writeFileSync(path.join(publicDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('Generated: public/robots.txt');

console.log(`\nDone! ${categories.length + 1} pages + SEO files generated.`);
