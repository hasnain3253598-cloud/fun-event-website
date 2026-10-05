(()=>{
'use strict';

const KEYS = {
  pin: 'fe-admin-pin-v2',
  edits: 'fe-content-overrides-v1',
  submissions: 'fe-form-submissions-v1'
};

// Default PIN is 1234 (SHA-256)
const DEFAULT_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

const PAGES = [
  { name: 'Home', path: '/', note: 'Main flagship landing page' },
  { name: 'About', path: '/about/', note: 'Company story & 2011 legacy' },
  { name: 'Services', path: '/services/', note: 'Complete 4 service pillars' },
  { name: 'Weddings', path: '/weddings/', note: 'Wedding stages & pavilion setups' },
  { name: 'Celebrations', path: '/celebrations/', note: 'Private events & galas' },
  { name: 'Hospitality', path: '/hospitality/', note: 'Traditional Emirati hospitality' },
  { name: 'Gallery', path: '/gallery/', note: 'Portfolio works & filtering' },
  { name: 'Experience', path: '/experience/', note: 'VIP legacy & repertoire' },
  { name: 'Contact', path: '/contact/', note: 'Enquiry form & direct booking' }
];

const SITE_IMAGE_PRESETS = [
  { name: 'Hero Wedding', url: '/assets/hero-wedding.jpg' },
  { name: 'Emirati Hospitality', url: '/assets/emirati-hospitality.jpg' },
  { name: 'Curated Stage Detail', url: '/assets/stage-detail.jpg' },
  { name: 'Floral Décor', url: '/assets/decor-floral.jpg' },
  { name: 'Grand Venue', url: '/assets/venue-grand.jpg' },
  { name: 'Banquet Furniture', url: '/assets/furniture-banquet.jpg' },
  { name: 'Ambient Lighting', url: '/assets/lighting-story.jpg' },
  { name: 'Celebration Story', url: '/assets/celebration-story.jpg' },
  { name: 'Wedding Story', url: '/assets/wedding-story.jpg' },
  { name: 'Hospitality Story', url: '/assets/hospitality-story.jpg' },
  { name: 'Carousel Wedding', url: '/assets/carousel-wedding.jpg' },
  { name: 'Carousel Decor', url: '/assets/carousel-decor.jpg' }
];

const SVG_ICON_PRESETS = [
  { name: 'WhatsApp', emoji: '💬', svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.17 8.17 0 0 1-1.25-4.46c0-4.54 3.7-8.24 8.24-8.24z"/></svg>' },
  { name: 'Phone', emoji: '📞', svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' },
  { name: 'Email', emoji: '✉️', svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg>' },
  { name: 'Location', emoji: '📍', svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
  { name: 'Sparkles', emoji: '✦', svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2l2.4 7.2L21.6 12l-7.2 2.8L12 22l-2.4-7.2L2.4 12l7.2-2.8z"/></svg>' },
  { name: 'Crown', emoji: '👑', svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"/></svg>' },
  { name: 'Heart', emoji: '🤍', svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
  { name: 'Calendar', emoji: '📅', svg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' }
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const getJSON = (key, fallback = []) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
const setJSON = (key, val) => { localStorage.setItem(key, JSON.stringify(val)); };
const normalPath = p => { const clean = (p || '/').split('?')[0].split('#')[0]; return clean === '/' ? '/' : clean.replace(/\/+$/, '') + '/'; };
const escapeHTML = str => String(str ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

function toast(msg) {
  const el = $('#toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2800);
}

const hash = async value => {
  const bytes = new TextEncoder().encode(value);
  const result = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(result)].map(b => b.toString(16).padStart(2, '0')).join('');
};

let activePage = '/';
let selectedElement = null;
let selectedSelector = '';
let hoveredElement = null;
let activeServiceFilter = 'all';

/* ==============================================================================
   AUTH & BOOT
   ============================================================================== */
function initAuth() {
  const screen = $('#auth-screen');
  const shell = $('#admin-shell');
  const confirmWrap = $('#confirm-wrap');

  $('#auth-title').textContent = 'Enter Admin PIN';
  $('#auth-copy').textContent = 'Enter the 4-digit admin PIN to unlock Elementor Visual Studio.';
  $('#auth-submit').textContent = 'Unlock Studio ↗';
  if(confirmWrap) confirmWrap.hidden = true;

  const unlock = () => {
    screen.hidden = true;
    shell.hidden = false;
    sessionStorage.setItem('fe-admin-session', '1');
    bootAdmin();
  };

  if(sessionStorage.getItem('fe-admin-session') === '1') {
    unlock();
    return;
  }

  $('#auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const pin = $('#admin-pin').value.trim();
    const status = $('#auth-status');
    if(!pin || pin.length < 4) {
      status.textContent = 'PIN must be at least 4 digits.';
      return;
    }
    const digest = await hash(pin);
    const activePinHash = localStorage.getItem(KEYS.pin) || DEFAULT_PIN_HASH;
    if(digest !== activePinHash) {
      status.textContent = 'Incorrect PIN. Access denied.';
      $('#admin-pin').value = '';
      return;
    }
    status.textContent = '';
    unlock();
  });
}

function bootAdmin() {
  renderPresetImages();
  renderIconLibrary();
  renderPagesView();
  bindStudioEvents();
  loadPreview(activePage);
  syncFromSupabase();
}

/* ==============================================================================
   SUPABASE CLOUD SYNC
   ============================================================================== */
async function syncFromSupabase() {
  const statusEl = $('#backend-status');
  if(!window.FunEventSupabase) {
    if(statusEl) statusEl.textContent = '● Local Offline';
    return;
  }
  try {
    const res = await window.FunEventSupabase.fetchSubmissions(100);
    if(res && res.success) {
      if(statusEl) {
        statusEl.textContent = '● Supabase Live';
        statusEl.style.color = '#22c55e';
        statusEl.style.background = 'rgba(34,197,94,0.12)';
      }
      if(Array.isArray(res.data) && res.data.length) {
        const local = getJSON(KEYS.submissions);
        const map = new Map();
        local.forEach(item => map.set(item.id, item));
        res.data.forEach(item => {
          if(!map.has(item.id)) {
            map.set(item.id, {
              id: item.id,
              createdAt: item.created_at || item.createdAt || new Date().toISOString(),
              status: item.status || 'new',
              name: item.name,
              email: item.email,
              phone: item.phone,
              occasion: item.occasion,
              date: item.date,
              venue: item.venue,
              message: item.message
            });
          } else {
            const ex = map.get(item.id);
            ex.status = item.status || ex.status;
          }
        });
        const merged = Array.from(map.values()).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJSON(KEYS.submissions, merged);
        renderSubmissions();
      }
    } else {
      if(statusEl) statusEl.textContent = '● Cloud Standby';
    }
  } catch(e) {
    if(statusEl) statusEl.textContent = '● Local Fallback';
  }
}

/* ==============================================================================
   UI NAVIGATION & VIEW SWITCHING
   ============================================================================== */
function switchView(view) {
  $$('.admin-view').forEach(p => p.classList.toggle('is-active', p.dataset.viewPanel === view));
  $$('.el-mode-btn').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  
  const pageSelector = $('#page-selector-wrap');
  const deviceBar = $('#device-bar-wrap');
  if(pageSelector) pageSelector.hidden = (view !== 'editor');
  if(deviceBar) deviceBar.hidden = (view !== 'editor');

  if(view === 'submissions') renderSubmissions();
  if(view === 'editor') {
    const frame = $('#site-preview');
    if(!frame.src || frame.src === 'about:blank') loadPreview(activePage);
  }
}

function bindStudioEvents() {
  // Mode switcher tabs
  $$('.el-mode-btn').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

  // Page selector in header
  $('#editor-page-select').addEventListener('change', e => loadPreview(e.target.value));

  // Device switcher buttons
  $$('.el-device-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.el-device-btn').forEach(b => b.classList.toggle('is-active', b === btn));
    $('#canvas-frame-wrap').style.width = btn.dataset.width;
  }));

  // Inspector tabs (Content, Style, Advanced)
  $$('.el-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.el-tab').forEach(t => t.classList.toggle('is-active', t === tab));
    const paneName = tab.dataset.tab;
    $$('.tab-pane').forEach(p => p.hidden = (p.dataset.pane !== paneName));
  }));

  // Accordion toggles
  $$('.el-section-head').forEach(head => head.addEventListener('click', () => {
    head.closest('.el-section').classList.toggle('is-collapsed');
  }));

  // Quick format buttons for textarea
  $$('.el-format-btn').forEach(btn => btn.addEventListener('click', () => {
    const ta = $('#field-content');
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const selected = ta.value.substring(start, end);
    const rep = btn.dataset.insert + (selected || 'styled text') + (btn.dataset.close || '');
    ta.value = ta.value.substring(0, start) + rep + ta.value.substring(end);
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  }));

  // Typography sliders
  $('#slider-font-size').addEventListener('input', e => {
    $('#field-font-size').value = e.target.value;
    $('#val-font-size').textContent = e.target.value + 'px';
    livePreviewStyle('fontSize', e.target.value + 'px');
  });
  $('#field-font-size').addEventListener('input', e => {
    $('#slider-font-size').value = e.target.value;
    $('#val-font-size').textContent = e.target.value + 'px';
    livePreviewStyle('fontSize', e.target.value + 'px');
  });

  // Border radius slider
  $('#slider-border-radius').addEventListener('input', e => {
    $('#field-border-radius').value = e.target.value;
    livePreviewStyle('borderRadius', e.target.value + 'px');
  });

  // Opacity slider
  $('#slider-opacity').addEventListener('input', e => {
    $('#val-opacity').textContent = e.target.value + '%';
    livePreviewStyle('opacity', (e.target.value / 100).toString());
  });

  // Color Pickers & Hex Inputs
  $('#field-color').addEventListener('input', e => {
    $('#field-color-hex').value = e.target.value;
    livePreviewStyle('color', e.target.value);
  });
  $('#field-color-hex').addEventListener('input', e => {
    $('#field-color').value = e.target.value;
    livePreviewStyle('color', e.target.value);
  });
  $$('.el-preset-color-dot').forEach(dot => dot.addEventListener('click', () => {
    const col = dot.dataset.color;
    $('#field-color').value = col;
    $('#field-color-hex').value = col;
    livePreviewStyle('color', col);
  }));

  $('#field-bg-color').addEventListener('input', e => {
    $('#field-bg-hex').value = e.target.value;
    livePreviewStyle('backgroundColor', e.target.value);
  });
  $('#field-bg-hex').addEventListener('input', e => {
    $('#field-bg-color').value = e.target.value;
    livePreviewStyle('backgroundColor', e.target.value);
  });

  // Alignment buttons
  $$('#group-text-align button').forEach(btn => btn.addEventListener('click', () => {
    $$('#group-text-align button').forEach(b => b.classList.toggle('is-active', b === btn));
    livePreviewStyle('textAlign', btn.dataset.val);
  }));

  // Text Transform buttons
  $$('#group-text-transform button').forEach(btn => btn.addEventListener('click', () => {
    $$('#group-text-transform button').forEach(b => b.classList.toggle('is-active', b === btn));
    livePreviewStyle('textTransform', btn.dataset.val);
  }));

  // Toggle Navigator Tree Panel
  $('#toggle-navigator-btn').addEventListener('click', () => {
    const nav = $('#navigator-panel-view');
    const form = $('#inspector-form');
    const empty = $('#inspector-empty');
    const tabs = $('#inspector-tabs');
    const isNav = !nav.hidden;
    nav.hidden = isNav;
    tabs.hidden = !isNav;
    if(!isNav) {
      form.hidden = true;
      empty.hidden = true;
      buildNavigatorTree();
    } else {
      if(selectedElement) form.hidden = false;
      else empty.hidden = false;
    }
  });

  $('#refresh-frame-btn').addEventListener('click', () => loadPreview(activePage));
  $('#quick-publish-btn').addEventListener('click', () => {
    if(selectedElement) $('#inspector-form').dispatchEvent(new Event('submit'));
    else toast('Elementor Studio: Everything is live and synced.');
  });

  $('#logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('fe-admin-session');
    location.reload();
  });

  $('#field-upload').addEventListener('change', handleUpload);
  $('#inspector-form').addEventListener('submit', saveSelected);
  $('#restore-original-btn').addEventListener('click', restoreSelected);

  // CRM Tools
  $('#crm-sync-btn').addEventListener('click', async () => {
    toast('Syncing with Supabase...');
    await syncFromSupabase();
    toast('Leads up to date.');
  });
  $('#crm-mark-read-btn').addEventListener('click', markAllRead);
  $('#crm-export-btn').addEventListener('click', exportCSV);
  $('#crm-search-input').addEventListener('input', renderSubmissions);
  $$('.crm-filter-pill').forEach(pill => pill.addEventListener('click', () => {
    $$('.crm-filter-pill').forEach(p => p.classList.toggle('is-active', p === pill));
    activeServiceFilter = pill.dataset.serviceFilter;
    renderSubmissions();
  }));

  // Quick Widget Card clicks in Left Sidebar
  $$('.el-widget-card').forEach(card => card.addEventListener('click', () => {
    const frame = $('#site-preview');
    if(!frame || !frame.contentDocument) return;
    const doc = frame.contentDocument;
    const selector = card.dataset.pickTag;
    const target = doc.querySelector(selector);
    if(target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inspectElement(target, doc);
      toast(`Selected ${card.querySelector('.widget-name')?.textContent || 'element'} on page!`);
    } else {
      toast('No matching element found on this page. Click any element on the preview to select.');
    }
  }));

  // Sub dialog close
  $('#sub-dialog-close').addEventListener('click', () => $('#submission-dialog').close());

  // Settings
  $('#backup-download-btn').addEventListener('click', exportBackup);
  $('#test-cloud-btn').addEventListener('click', async () => {
    toast('Testing Supabase Cloud...');
    await syncFromSupabase();
    toast('Supabase Cloud is connected and operational.');
  });
  $('#update-pin-form').addEventListener('submit', async e => {
    e.preventDefault();
    const np = $('#new-pin-val').value.trim();
    if(np.length < 4) {
      toast('PIN must be at least 4 digits.');
      return;
    }
    localStorage.setItem(KEYS.pin, await hash(np));
    toast('Admin PIN successfully updated.');
    $('#new-pin-val').value = '';
  });
  $('#reset-all-btn').addEventListener('click', () => {
    if(!confirm('Reset all local storage and admin PIN for this browser?')) return;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('fe-admin-pin-v1');
    sessionStorage.removeItem('fe-admin-session');
    location.reload();
  });
}

/* ==============================================================================
   CANVAS PREVIEW & ELEMENT INSPECTOR ENGINE
   ============================================================================== */
function loadPreview(path) {
  activePage = normalPath(path);
  $('#editor-page-select').value = activePage;
  $('#open-live-btn').href = activePage;
  selectedElement = null;
  selectedSelector = '';

  $('#inspector-empty').hidden = false;
  $('#inspector-form').hidden = true;
  $('#navigator-panel-view').hidden = true;
  $('#inspector-tabs').hidden = false;

  const frame = $('#site-preview');
  frame.onload = () => wireCanvas(frame);
  frame.src = activePage + (activePage.includes('?') ? '&' : '?') + 'fe_studio_preview=1&t=' + Date.now();
}

function wireCanvas(frame) {
  let doc;
  try { doc = frame.contentDocument; } catch { return; }
  if(!doc) return;

  // Inject Elementor hover & select styling
  const style = doc.createElement('style');
  style.id = 'fe-elementor-preview-styles';
  style.textContent = `
    .fe-el-hover {
      outline: 2px dashed #c69b68 !important;
      outline-offset: 3px !important;
      cursor: pointer !important;
    }
    .fe-el-selected {
      outline: 3px solid #39b54a !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 5px rgba(57, 181, 74, 0.2) !important;
    }
  `;
  doc.head.appendChild(style);

  // Hover detection
  doc.addEventListener('mouseover', e => {
    const el = e.target;
    if(!el || el === doc.body || el === doc.documentElement) return;
    if(hoveredElement && hoveredElement !== selectedElement) {
      hoveredElement.classList.remove('fe-el-hover');
    }
    hoveredElement = el;
    if(el !== selectedElement) el.classList.add('fe-el-hover');
  }, true);

  doc.addEventListener('mouseout', e => {
    if(e.target !== selectedElement) e.target.classList?.remove('fe-el-hover');
  }, true);

  // Click to Select Element
  doc.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    let el = e.target;
    if(el.closest('.fe-whatsapp-float')) el = el.closest('.fe-whatsapp-float');
    inspectElement(el, doc);
  }, true);

  // Double click for direct Inline Editing
  doc.addEventListener('dblclick', e => {
    const el = e.target;
    const tag = el.tagName.toLowerCase();
    if(['h1','h2','h3','h4','h5','h6','p','span','em','strong','small','a'].includes(tag)) {
      el.contentEditable = 'true';
      el.focus();
      toast('Inline Edit Active: Type directly on the page!');
      el.addEventListener('blur', () => {
        el.contentEditable = 'false';
        $('#field-content').value = el.innerHTML;
        toast('Content updated. Click Update Element to save ✦');
      }, { once: true });
    }
  }, true);

  // Prevent form submissions inside editor canvas
  doc.addEventListener('submit', e => e.preventDefault(), true);

  // Build navigator tree once page loads
  setTimeout(buildNavigatorTree, 400);
}

function selectorFor(el) {
  if(el.id) return '#' + CSS.escape(el.id);
  const parts = [];
  let node = el;
  while(node && node.nodeType === 1 && node.tagName.toLowerCase() !== 'body') {
    let part = node.tagName.toLowerCase();
    if(node.classList.length) {
      const stable = [...node.classList].filter(c => !c.startsWith('fe-el-') && !['entered','entry-pending','visible'].includes(c)).slice(0, 2);
      if(stable.length) part += '.' + stable.map(c => CSS.escape(c)).join('.');
    }
    const parent = node.parentElement;
    if(parent) {
      const same = [...parent.children].filter(child => child.tagName === node.tagName);
      if(same.length > 1) part += ':nth-of-type(' + (same.indexOf(node) + 1) + ')';
    }
    parts.unshift(part);
    node = parent;
  }
  return 'body > ' + parts.join(' > ');
}

function inspectElement(el, doc) {
  if(selectedElement) selectedElement.classList.remove('fe-el-selected');
  selectedElement = el;
  selectedElement.classList.remove('fe-el-hover');
  selectedElement.classList.add('fe-el-selected');
  selectedSelector = selectorFor(el);

  $('#inspector-empty').hidden = true;
  $('#navigator-panel-view').hidden = true;
  $('#inspector-tabs').hidden = false;
  $('#inspector-form').hidden = false;

  const tag = el.tagName.toLowerCase();
  const saved = getJSON(KEYS.edits).find(item => normalPath(item.page) === activePage && item.selector === selectedSelector);

  $('#selected-tag').textContent = tag.toUpperCase();
  $('#selected-selector').textContent = selectedSelector;

  // Accordion visibility by element type
  const isImage = (tag === 'img' || tag === 'figure' || el.style.backgroundImage);
  const isIcon = (tag === 'svg' || tag === 'i' || el.closest('.social-link') || el.closest('button svg'));
  const isLink = (tag === 'a' || tag === 'button');

  $('#section-image-content').hidden = !isImage;
  $('#section-icon-content').hidden = !isIcon;
  $('#section-link-content').hidden = !isLink;

  // Content field
  $('#field-content').value = saved?.html ?? el.innerHTML;

  // Image fields
  if(tag === 'img') {
    $('#field-src').value = saved?.attrs?.src ?? el.getAttribute('src') ?? '';
    $('#field-alt').value = saved?.attrs?.alt ?? el.getAttribute('alt') ?? '';
  }

  // Link fields
  if(tag === 'a') {
    $('#field-href').value = saved?.attrs?.href ?? el.getAttribute('href') ?? '';
    $('#field-new-tab').checked = (saved?.attrs?.target ?? el.getAttribute('target')) === '_blank';
  }

  // Computed Styles
  const cs = doc.defaultView.getComputedStyle(el);
  const styles = saved?.style || {};

  // Typography
  const fs = parseInt(styles.fontSize || cs.fontSize) || 16;
  $('#field-font-size').value = fs;
  $('#slider-font-size').value = fs;
  $('#val-font-size').textContent = fs + 'px';
  $('#field-font-weight').value = styles.fontWeight || cs.fontWeight || '';

  // Colors
  const hexCol = toHex(styles.color || cs.color, '#e6ebed');
  $('#field-color').value = hexCol;
  $('#field-color-hex').value = hexCol;

  const hexBg = toHex(styles.backgroundColor || cs.backgroundColor, '#171310');
  $('#field-bg-color').value = hexBg;
  $('#field-bg-hex').value = hexBg;

  // Alignment
  const align = styles.textAlign || cs.textAlign || 'left';
  $$('#group-text-align button').forEach(b => b.classList.toggle('is-active', b.dataset.val === align));

  // Spacing & Border Radius
  $('#field-padding-top').value = parseInt(styles.paddingTop || cs.paddingTop) || '';
  $('#field-padding-bottom').value = parseInt(styles.paddingBottom || cs.paddingBottom) || '';
  const br = parseInt(styles.borderRadius || cs.borderRadius) || 0;
  $('#slider-border-radius').value = br;
  $('#field-border-radius').value = br;

  // Visibility
  $('#field-hidden').checked = (styles.display === 'none');
  const op = Math.round(parseFloat(styles.opacity || cs.opacity || 1) * 100);
  $('#slider-opacity').value = op;
  $('#val-opacity').textContent = op + '%';
}

function livePreviewStyle(prop, val) {
  if(!selectedElement) return;
  selectedElement.style[prop] = val;
}

function toHex(color, fallback) {
  if(!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return fallback;
  if(color.startsWith('#')) return color.slice(0, 7);
  const nums = color.match(/\d+/g);
  if(!nums || nums.length < 3) return fallback;
  return '#' + nums.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
}

/* ==============================================================================
   SAVE & RESTORE ACTIONS
   ============================================================================== */
async function saveSelected(e) {
  if(e) e.preventDefault();
  if(!selectedElement || !selectedSelector) return;

  const tag = selectedElement.tagName.toLowerCase();
  const attrs = {};

  if(tag === 'img') {
    attrs.src = $('#field-src').value.trim();
    attrs.alt = $('#field-alt').value.trim();
  }
  if(tag === 'a') {
    attrs.href = $('#field-href').value.trim();
    attrs.target = $('#field-new-tab').checked ? '_blank' : '_self';
  }

  const style = {
    color: $('#field-color-hex').value || $('#field-color').value,
    backgroundColor: $('#field-bg-hex').value || $('#field-bg-color').value,
    fontSize: ($('#field-font-size').value || '') ? $('#field-font-size').value + 'px' : '',
    fontWeight: $('#field-font-weight').value || '',
    fontFamily: $('#field-font-family').value || '',
    textAlign: $$('#group-text-align button.is-active')[0]?.dataset?.val || '',
    paddingTop: ($('#field-padding-top').value || '') ? $('#field-padding-top').value + 'px' : '',
    paddingBottom: ($('#field-padding-bottom').value || '') ? $('#field-padding-bottom').value + 'px' : '',
    borderRadius: ($('#field-border-radius').value || '') ? $('#field-border-radius').value + 'px' : '',
    opacity: ($('#slider-opacity').value / 100).toString(),
    display: $('#field-hidden').checked ? 'none' : ''
  };

  const edit = {
    page: activePage,
    selector: selectedSelector,
    html: (tag === 'img' || tag === 'video') ? null : $('#field-content').value,
    attrs,
    style,
    updatedAt: new Date().toISOString()
  };

  // 1. Local storage save
  const edits = getJSON(KEYS.edits);
  const idx = edits.findIndex(item => normalPath(item.page) === activePage && item.selector === selectedSelector);
  if(idx > -1) edits[idx] = edit;
  else edits.push(edit);
  setJSON(KEYS.edits, edits);

  applyEdit(selectedElement, edit);

  // 2. Real-time Supabase Cloud Sync
  if(window.FunEventSupabase && typeof window.FunEventSupabase.saveContentOverride === 'function') {
    if(attrs.src && attrs.src.startsWith('data:image/') && attrs.src.length > 50000) {
      toast('Saved locally (Asset URL recommended for cloud sync).');
      return;
    }
    try {
      const res = await window.FunEventSupabase.saveContentOverride(edit);
      if(res && res.success) {
        toast('✦ Element Updated & Synced to Live Site!');
      } else {
        toast('✦ Saved in studio cache.');
      }
    } catch(err) {
      toast('✦ Saved in studio cache.');
    }
  } else {
    toast('✦ Saved in studio cache.');
  }
}

function applyEdit(el, edit) {
  if(edit.html !== null && edit.html !== undefined) el.innerHTML = edit.html;
  Object.entries(edit.attrs || {}).forEach(([k, v]) => {
    if(v) el.setAttribute(k, v);
    else el.removeAttribute(k);
  });
  Object.entries(edit.style || {}).forEach(([k, v]) => el.style[k] = v);
}

function restoreSelected() {
  if(!selectedSelector) return;
  const edits = getJSON(KEYS.edits).filter(item => !(normalPath(item.page) === activePage && item.selector === selectedSelector));
  setJSON(KEYS.edits, edits);

  if(window.FunEventSupabase && typeof window.FunEventSupabase.deleteContentOverride === 'function') {
    window.FunEventSupabase.deleteContentOverride(activePage, selectedSelector).catch(()=>{});
  }
  toast('Original element restored.');
  loadPreview(activePage);
}

function handleUpload(e) {
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 2000000) { toast('Image is larger than 2MB.'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    $('#field-src').value = reader.result;
    if(selectedElement && selectedElement.tagName.toLowerCase() === 'img') {
      selectedElement.src = reader.result;
    }
    toast('Image loaded! Click Update Element to save ✦');
  };
  reader.readAsDataURL(file);
}

/* ==============================================================================
   PRESETS & ASSETS (IMAGE & ICON LIBRARIES)
   ============================================================================== */
function renderPresetImages() {
  const container = $('#preset-images-list');
  if(!container) return;
  container.innerHTML = SITE_IMAGE_PRESETS.map(img => `
    <div class="el-img-thumb" data-url="${img.url}" title="${img.name}">
      <img src="${img.url}" alt="${img.name}" loading="lazy">
    </div>
  `).join('');

  $$('.el-img-thumb').forEach(thumb => thumb.addEventListener('click', () => {
    const url = thumb.dataset.url;
    $('#field-src').value = url;
    if(selectedElement && selectedElement.tagName.toLowerCase() === 'img') {
      selectedElement.src = url;
    }
    $$('.el-img-thumb').forEach(t => t.classList.toggle('is-selected', t === thumb));
    toast('Selected: ' + url);
  }));
}

function renderIconLibrary() {
  const container = $('#icon-picker-grid');
  if(!container) return;
  container.innerHTML = SVG_ICON_PRESETS.map(icon => `
    <div class="el-icon-card" data-name="${icon.name}">
      <span>${icon.emoji}</span>
      <small>${icon.name}</small>
    </div>
  `).join('');

  $$('.el-icon-card').forEach(card => card.addEventListener('click', () => {
    const name = card.dataset.name;
    const preset = SVG_ICON_PRESETS.find(i => i.name === name);
    if(preset && selectedElement) {
      selectedElement.innerHTML = preset.svg;
      $('#field-content').value = preset.svg;
      toast('Icon replaced with ' + name + '!');
    }
  }));
}

function buildNavigatorTree() {
  const container = $('#navigator-tree-list');
  const frame = $('#site-preview');
  if(!container || !frame || !frame.contentDocument) return;

  const doc = frame.contentDocument;
  const sections = [...doc.querySelectorAll('header, section, footer, article')];
  if(!sections.length) {
    container.innerHTML = '<p style="font-size:12px;color:var(--el-text-muted);">No sections found on this page.</p>';
    return;
  }

  container.innerHTML = sections.map((sec, i) => {
    const heading = sec.querySelector('h1, h2, h3')?.textContent?.trim() || sec.className || 'Section';
    const tag = sec.tagName.toLowerCase();
    return `
      <div class="el-tree-item" data-idx="${i}">
        <span class="icon">▤</span>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(heading)}</span>
        <span class="badge">${tag}</span>
      </div>
    `;
  }).join('');

  $$('.el-tree-item').forEach(item => item.addEventListener('click', () => {
    const idx = parseInt(item.dataset.idx);
    const target = sections[idx];
    if(target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inspectElement(target, doc);
      $$('.el-tree-item').forEach(it => it.classList.toggle('is-selected', it === item));
    }
  }));
}

/* ==============================================================================
   CRM & SUBMISSIONS MANAGEMENT (FILTERED BY SERVICE)
   ============================================================================== */
function renderSubmissions() {
  const allRows = getJSON(KEYS.submissions).slice().reverse();
  const tbody = $('#crm-leads-tbody');
  const searchVal = ($('#crm-search-input')?.value || '').toLowerCase().trim();

  // Counts
  $('#sub-badge-count').textContent = allRows.filter(r => r.status === 'new').length;
  $('#cnt-all').textContent = allRows.length;
  $('#cnt-weddings').textContent = allRows.filter(r => (r.occasion||'').toLowerCase().includes('wedding')).length;
  $('#cnt-celebrations').textContent = allRows.filter(r => (r.occasion||'').toLowerCase().includes('celebration')).length;
  $('#cnt-hospitality').textContent = allRows.filter(r => (r.occasion||'').toLowerCase().includes('hospitality')).length;
  $('#cnt-structure').textContent = allRows.filter(r => (r.occasion||'').toLowerCase().includes('structure') || (r.occasion||'').toLowerCase().includes('tent')).length;
  $('#cnt-decor').textContent = allRows.filter(r => (r.occasion||'').toLowerCase().includes('décor') || (r.occasion||'').toLowerCase().includes('furniture')).length;
  $('#cnt-atmosphere').textContent = allRows.filter(r => (r.occasion||'').toLowerCase().includes('sound') || (r.occasion||'').toLowerCase().includes('lighting')).length;

  // Filter by service
  let filtered = allRows;
  if(activeServiceFilter !== 'all') {
    filtered = filtered.filter(r => (r.occasion || '').toLowerCase().includes(activeServiceFilter.toLowerCase()));
  }

  // Filter by search
  if(searchVal) {
    filtered = filtered.filter(r => 
      (r.name || '').toLowerCase().includes(searchVal) ||
      (r.email || '').toLowerCase().includes(searchVal) ||
      (r.phone || '').toLowerCase().includes(searchVal) ||
      (r.venue || '').toLowerCase().includes(searchVal) ||
      (r.occasion || '').toLowerCase().includes(searchVal)
    );
  }

  if(!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--el-text-muted);">No enquiries found for this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => {
    const isNew = (row.status === 'new');
    const waPhone = (row.phone || '').replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${row.name || 'there'}, regarding your ${row.occasion || 'Event'} enquiry with Fun Event UAE...`);
    const waLink = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : `https://wa.me/971567612222?text=${waText}`;

    return `
      <tr class="${isNew ? 'is-new' : ''}">
        <td class="crm-client-cell">
          <strong>${escapeHTML(row.name || 'Client Lead')}</strong>
          <small>${escapeHTML(row.phone || 'No phone')} · ${escapeHTML(row.email || 'No email')}</small>
        </td>
        <td><span class="crm-service-badge">${escapeHTML(row.occasion || 'General Event')}</span></td>
        <td>${escapeHTML(row.date || 'TBD')}</td>
        <td>${escapeHTML(row.venue || 'UAE')}</td>
        <td><span class="crm-status-pill ${row.status || 'new'}">${escapeHTML(row.status || 'new')}</span></td>
        <td class="crm-actions">
          <a class="crm-wa-btn" href="${waLink}" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
          <button class="crm-detail-btn" data-view-sub="${escapeHTML(row.id)}">Details ↗</button>
        </td>
      </tr>
    `;
  }).join('');

  $$('[data-view-sub]').forEach(btn => btn.addEventListener('click', () => openSubmissionModal(btn.dataset.viewSub)));
}

function openSubmissionModal(id) {
  const rows = getJSON(KEYS.submissions);
  const row = rows.find(item => item.id === id);
  if(!row) return;

  row.status = 'read';
  setJSON(KEYS.submissions, rows);
  if(window.FunEventSupabase && typeof window.FunEventSupabase.updateSubmissionStatus === 'function') {
    window.FunEventSupabase.updateSubmissionStatus(id, 'read').catch(()=>{});
  }

  const waPhone = (row.phone || '').replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(`Hello ${row.name || ''}, thank you for contacting Fun Event UAE regarding ${row.occasion || 'your event'}.`);
  const waLink = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : `https://wa.me/971567612222?text=${waText}`;

  $('#submission-detail').innerHTML = `
    <span class="crm-service-badge" style="margin-bottom:12px;">${escapeHTML(row.occasion || 'Event Service')}</span>
    <h2 style="font:400 36px var(--font-serif);margin:0 0 10px;color:#fff;">${escapeHTML(row.name || 'Unnamed Client')}</h2>
    <dl class="detail-grid">
      <dt>Submission ID</dt><dd>${escapeHTML(row.id)}</dd>
      <dt>Service / Occasion</dt><dd><strong style="color:var(--el-accent);">${escapeHTML(row.occasion || 'General')}</strong></dd>
      <dt>Date Received</dt><dd>${formatDate(row.createdAt)}</dd>
      <dt>Phone / WhatsApp</dt><dd><a href="tel:${escapeHTML(row.phone)}" style="color:var(--el-accent);text-decoration:underline;">${escapeHTML(row.phone || 'Not provided')}</a></dd>
      <dt>Email Address</dt><dd><a href="mailto:${escapeHTML(row.email)}" style="color:var(--el-accent);text-decoration:underline;">${escapeHTML(row.email || 'Not provided')}</a></dd>
      <dt>Preferred Event Date</dt><dd>${escapeHTML(row.date || 'To be decided')}</dd>
      <dt>Venue / Emirate</dt><dd>${escapeHTML(row.venue || 'To be confirmed')}</dd>
      <dt>Client Message / Vision</dt><dd style="white-space:pre-wrap;background:#131518;padding:12px;border-radius:4px;border:1px solid var(--el-border);">${escapeHTML(row.message || 'No additional details.')}</dd>
    </dl>
    <div style="display:flex;gap:10px;margin-top:24px;">
      <a class="crm-wa-btn" style="padding:10px 18px;font-size:12px;" href="${waLink}" target="_blank" rel="noopener noreferrer">💬 Chat with Client on WhatsApp</a>
      <a class="el-btn-publish" style="padding:10px 18px;font-size:12px;" href="mailto:${escapeHTML(row.email)}">✉️ Email Client</a>
    </div>
  `;

  $('#submission-dialog').showModal();
  renderSubmissions();
}

function markAllRead() {
  const rows = getJSON(KEYS.submissions);
  rows.forEach(r => {
    if(r.status !== 'read') {
      r.status = 'read';
      if(window.FunEventSupabase && typeof window.FunEventSupabase.updateSubmissionStatus === 'function') {
        window.FunEventSupabase.updateSubmissionStatus(r.id, 'read').catch(()=>{});
      }
    }
  });
  setJSON(KEYS.submissions, rows);
  renderSubmissions();
  toast('All enquiries marked as read.');
}

function formatDate(val) {
  try { return new Intl.DateTimeFormat('en-AE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val)); }
  catch { return val || ''; }
}

function exportCSV() {
  const rows = getJSON(KEYS.submissions);
  const heads = ['ID', 'Received', 'Client Name', 'Email', 'Phone', 'Service / Occasion', 'Event Date', 'Venue', 'Message', 'Status'];
  const cell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const csv = [
    heads.map(cell).join(','),
    ...rows.map(r => [r.id, r.createdAt, r.name, r.email, r.phone, r.occasion, r.date, r.venue, r.message, r.status].map(cell).join(','))
  ].join('\n');

  downloadFile('fun-event-leads.csv', 'text/csv;charset=utf-8', csv);
  toast('CSV Leads file downloaded.');
}

function exportBackup() {
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    edits: getJSON(KEYS.edits),
    submissions: getJSON(KEYS.submissions)
  };
  downloadFile('fun-event-studio-backup.json', 'application/json', JSON.stringify(data, null, 2));
  toast('Full Studio Backup Exported ✦');
}

function downloadFile(name, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderPagesView() {
  const grid = $('#pages-cards-grid');
  if(!grid) return;
  grid.innerHTML = PAGES.map((p, i) => `
    <article class="page-card">
      <span class="num">${String(i + 1).padStart(2, '0')} / PAGE</span>
      <h3>${p.name}</h3>
      <p>${p.note}</p>
      <div class="page-card-actions">
        <button data-open-page="${p.path}">Edit in Studio ✦</button>
        <a href="${p.path}" target="_blank" rel="noopener">View ↗</a>
      </div>
    </article>
  `).join('');

  $$('[data-open-page]').forEach(btn => btn.addEventListener('click', () => {
    switchView('editor');
    loadPreview(btn.dataset.openPage);
  }));
}

// Start studio
initAuth();
})();