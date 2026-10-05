/**
 * Fun Event UAE — Supabase Client Integration
 * 
 * Optimized for:
 * 1. Zero bloat: Sanitized payloads and strict field lengths to prevent storage exhaustion.
 * 2. Bandwidth & request quota saving: Smart sessionStorage caching (5-min TTL) for public visitors.
 * 3. Spam protection: Honeypot verification and rate-limit cooldowns.
 * 4. Resilient fallback: Seamless local fallback if Supabase is offline or table is pending.
 */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://hqmtdbxyoocasjngnkdk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_WZCdkjuFWrNNHXJ5vgAH5w_kMRenoLr';

  const getHeaders = (extra = {}) => ({
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...extra
  });

  // Strict sanitization to prevent database bloat
  const sanitizeText = (val, maxLen) => {
    if (val === null || val === undefined) return '';
    return String(val).trim().slice(0, maxLen);
  };

  /**
   * Submit an event enquiry to Supabase
   * Table: enquiries
   */
  async function submitEnquiry(formData) {
    // 1. Honeypot check for bots
    if (formData._hp_check && String(formData._hp_check).trim().length > 0) {
      console.warn('Bot submission prevented.');
      return { success: true, bot: true };
    }

    // 2. Client-side cooldown (30 seconds) to prevent spam loops
    const lastSub = parseInt(sessionStorage.getItem('fe-last-sub-ts') || '0', 10);
    const now = Date.now();
    if (now - lastSub < 30000) {
      const waitSec = Math.ceil((30000 - (now - lastSub)) / 1000);
      throw new Error(`Please wait ${waitSec}s before submitting another enquiry.`);
    }

    // 3. Compact & sanitized payload
    const payload = {
      id: 'FE-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      created_at: new Date().toISOString(),
      name: sanitizeText(formData.name, 100),
      email: sanitizeText(formData.email, 160),
      phone: sanitizeText(formData.phone, 40),
      occasion: sanitizeText(formData.occasion, 100),
      date: sanitizeText(formData.date, 50),
      venue: sanitizeText(formData.venue, 180),
      message: sanitizeText(formData.message, 2000),
      status: 'new'
    };

    if (!payload.name || !payload.email || !payload.occasion || !payload.message) {
      throw new Error('Please fill in all required fields.');
    }

    const endpoint = `${SUPABASE_URL}/rest/v1/enquiries`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders({ 'Prefer': 'return=representation' }),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn('Supabase enquiries POST returned:', res.status, errJson);
        return { success: false, fallback: true, error: errJson.message || 'Database write error' };
      }

      sessionStorage.setItem('fe-last-sub-ts', String(now));
      return { success: true, payload };
    } catch (err) {
      console.warn('Network error reaching Supabase:', err);
      return { success: false, fallback: true, error: err.message };
    }
  }

  /**
   * Fetch submissions for Admin panel
   * Uses strict limit (50) and selected columns only
   */
  async function fetchSubmissions(limit = 50) {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const endpoint = `${SUPABASE_URL}/rest/v1/enquiries?select=id,created_at,name,email,phone,occasion,date,venue,message,status&order=created_at.desc&limit=${safeLimit}`;

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!res.ok) {
        return { success: false, data: [] };
      }

      const data = await res.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (err) {
      console.warn('Supabase fetchSubmissions error:', err);
      return { success: false, data: [] };
    }
  }

  /**
   * Update submission status in Supabase (e.g. 'read')
   */
  async function updateSubmissionStatus(id, status = 'read') {
    if (!id) return;
    const endpoint = `${SUPABASE_URL}/rest/v1/enquiries?id=eq.${encodeURIComponent(id)}`;

    try {
      await fetch(endpoint, {
        method: 'PATCH',
        headers: getHeaders({ 'Prefer': 'return=minimal' }),
        body: JSON.stringify({ status: sanitizeText(status, 20) })
      });
    } catch (err) {
      console.warn('Supabase updateSubmissionStatus error:', err);
    }
  }

  /**
   * Fetch visual overrides for a specific page
   * Uses 5-minute sessionStorage cache to protect Supabase request limits!
   */
  async function fetchPageOverrides(pagePath) {
    const cleanPath = (pagePath || '/').split(/[?#]/)[0].replace(/\/+$/, '') + '/';
    const cacheKey = `fe_sb_cache_${cleanPath}`;
    
    // Check session cache first
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && (Date.now() - parsed.timestamp < 300000)) { // 5 minutes
          return parsed.items || [];
        }
      }
    } catch (e) {}

    const endpoint = `${SUPABASE_URL}/rest/v1/content_overrides?page=eq.${encodeURIComponent(cleanPath)}&select=id,page,selector,html,attrs,style,updated_at`;

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!res.ok) {
        return [];
      }

      const items = await res.json();
      if (Array.isArray(items)) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), items }));
        } catch (e) {}
        return items;
      }
      return [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Save content override from Visual Editor
   * Rejects large base64 data to prevent database storage overflow!
   */
  async function saveContentOverride(override) {
    if (!override || !override.page || !override.selector) return { success: false };

    // Prevent giant base64 data bloat in Postgres
    if (override.attrs && override.attrs.src && String(override.attrs.src).startsWith('data:image/')) {
      if (String(override.attrs.src).length > 60000) {
        throw new Error('Image data is too large to sync to database. Please use a file path or URL under 50KB.');
      }
    }

    const cleanPath = (override.page || '/').split(/[?#]/)[0].replace(/\/+$/, '') + '/';
    const id = `${cleanPath}::${override.selector}`.slice(0, 255);

    const payload = {
      id,
      page: cleanPath,
      selector: sanitizeText(override.selector, 255),
      html: override.html ? sanitizeText(override.html, 50000) : null,
      attrs: override.attrs || {},
      style: override.style || {},
      updated_at: new Date().toISOString()
    };

    const endpoint = `${SUPABASE_URL}/rest/v1/content_overrides`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
        body: JSON.stringify(payload)
      });

      // Clear cache for this page
      sessionStorage.removeItem(`fe_sb_cache_${cleanPath}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete content override from Supabase
   */
  async function deleteContentOverride(pagePath, selector) {
    const cleanPath = (pagePath || '/').split(/[?#]/)[0].replace(/\/+$/, '') + '/';
    const id = `${cleanPath}::${selector}`.slice(0, 255);
    const endpoint = `${SUPABASE_URL}/rest/v1/content_overrides?id=eq.${encodeURIComponent(id)}`;

    try {
      await fetch(endpoint, {
        method: 'DELETE',
        headers: getHeaders()
      });
      sessionStorage.removeItem(`fe_sb_cache_${cleanPath}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  window.FunEventSupabase = {
    url: SUPABASE_URL,
    submitEnquiry,
    fetchSubmissions,
    updateSubmissionStatus,
    fetchPageOverrides,
    saveContentOverride,
    deleteContentOverride
  };
})();
