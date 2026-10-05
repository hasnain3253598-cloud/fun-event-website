(()=>{
'use strict';
const KEY = 'fe-content-overrides-v1';
const path = (()=>{
  const clean = location.pathname || '/';
  return clean === '/' ? '/' : clean.replace(/\/+$/, '') + '/';
})();

function applyItem(item) {
  let el;
  try { el = document.querySelector(item.selector); } catch { return; }
  if(!el) return;
  if(item.html !== null && item.html !== undefined) el.innerHTML = item.html;
  Object.entries(item.attrs || {}).forEach(([name, value]) => {
    if(value) el.setAttribute(name, value);
    else el.removeAttribute(name);
  });
  Object.entries(item.style || {}).forEach(([name, value]) => {
    if(value) el.style[name] = value;
  });
}

function runOverrides() {
  // 1. Apply local browser overrides immediately
  let localEdits = [];
  try { localEdits = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { localEdits = []; }
  localEdits.filter(item => {
    const itemPath = (item.page || '/') === '/' ? '/' : String(item.page).split(/[?#]/)[0].replace(/\/+$/, '') + '/';
    return itemPath === path;
  }).forEach(applyItem);

  // 2. Fetch live published overrides from Supabase Cloud
  if(window.FunEventSupabase && typeof window.FunEventSupabase.fetchPageOverrides === 'function') {
    window.FunEventSupabase.fetchPageOverrides(path).then(remoteItems => {
      if(Array.isArray(remoteItems) && remoteItems.length) {
        remoteItems.forEach(applyItem);
      }
    }).catch(()=>{});
  }
}

// Run immediately and on DOMContentLoaded
runOverrides();
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runOverrides);
}
})();