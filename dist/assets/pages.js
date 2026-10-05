const toggle=document.querySelector('.site-menu-toggle'),menu=document.querySelector('#main-menu');
if(toggle&&menu){
  const close=()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')};
  toggle.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open))});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('is-open')){close();toggle.focus()}});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('entered');observer.unobserve(e.target)}}),{threshold:.08});
  document.querySelectorAll('[data-enter]').forEach(el=>{el.classList.add('entry-pending');observer.observe(el)});
}

const filterButtons=[...document.querySelectorAll('.gallery-filters button')];
const galleryCards=[...document.querySelectorAll('.gallery-card')];
const applyFilter=filter=>{
  const selected=filterButtons.find(button=>button.dataset.filter===filter)||filterButtons[0];
  if(!selected)return;
  filterButtons.forEach(button=>button.setAttribute('aria-pressed',String(button===selected)));
  galleryCards.forEach(card=>card.hidden=selected.dataset.filter!=='all'&&card.dataset.category!==selected.dataset.filter);
};
filterButtons.forEach(button=>button.addEventListener('click',()=>{
  applyFilter(button.dataset.filter);
  const url=new URL(location.href);
  if(button.dataset.filter==='all')url.searchParams.delete('filter');else url.searchParams.set('filter',button.dataset.filter);
  history.replaceState(null,'',url.pathname+(url.searchParams.toString()?'?'+url.searchParams:'')+url.hash);
}));
if(filterButtons.length)applyFilter(new URLSearchParams(location.search).get('filter')||'all');

const lightbox=document.getElementById('gallery-lightbox');
if(lightbox){
  const lbImg=lightbox.querySelector('.lightbox-img'),lbCap=lightbox.querySelector('.lightbox-caption'),lbClose=lightbox.querySelector('.lightbox-close'),lbBg=lightbox.querySelector('.lightbox-backdrop');
  let returnFocus=null;
  const openLb=card=>{
    returnFocus=card;
    lbImg.src=card.dataset.src||card.querySelector('img')?.src;
    lbCap.textContent=card.dataset.caption||card.querySelector('figcaption')?.textContent||'';
    lightbox.hidden=false;
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    lbClose?.focus();
  };
  const closeLb=()=>{
    lightbox.hidden=true;
    lightbox.setAttribute('aria-hidden','true');
    lbImg.src='';
    document.body.style.overflow='';
    returnFocus?.focus();
  };
  galleryCards.forEach((card,index)=>{
    card.tabIndex=0;
    card.setAttribute('role','button');
    card.setAttribute('aria-label','Open image '+(index+1)+': '+(card.dataset.caption||card.querySelector('figcaption')?.textContent||'gallery image'));
    card.addEventListener('click',()=>openLb(card));
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLb(card)}});
  });
  lbClose?.addEventListener('click',closeLb);
  lbBg?.addEventListener('click',closeLb);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden)closeLb()});
}

const enquiryForm=document.querySelector('#event-enquiry');
if(enquiryForm){
  const occasion=new URLSearchParams(location.search).get('occasion');
  if(occasion&&enquiryForm.elements.occasion&&[...enquiryForm.elements.occasion.options].some(option=>option.value===occasion)){
    enquiryForm.elements.occasion.value=occasion;
  }
  const summary=document.querySelector('#enquiry-summary'),result=document.querySelector('#enquiry-result'),status=document.querySelector('#copy-status');
  enquiryForm.addEventListener('submit',e=>{
    e.preventDefault();
    if(!enquiryForm.reportValidity())return;
    const d=new FormData(enquiryForm);
    const subData = {
      name: String(d.get('name') || ''),
      email: String(d.get('email') || ''),
      phone: String(d.get('phone') || ''),
      occasion: String(d.get('occasion') || ''),
      date: String(d.get('date') || ''),
      venue: String(d.get('venue') || ''),
      message: String(d.get('message') || ''),
      _hp_check: String(d.get('_hp_check') || '')
    };

    try{
      const submissionKey='fe-form-submissions-v1';
      const submissions=JSON.parse(localStorage.getItem(submissionKey)||'[]');
      submissions.push({
        id:'FE-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),
        createdAt:new Date().toISOString(),
        status:'new',
        ...subData
      });
      localStorage.setItem(submissionKey,JSON.stringify(submissions));
    }catch(error){console.warn('Local enquiry storage is unavailable.',error)}

    // Sync to Supabase in background
    if(window.FunEventSupabase && typeof window.FunEventSupabase.submitEnquiry === 'function'){
      window.FunEventSupabase.submitEnquiry(subData).then(res=>{
        if(res && res.success){
          console.log('Enquiry saved to Supabase successfully.');
        }
      }).catch(err=>{
        console.warn('Supabase enquiry submit note:', err.message);
      });
    }

    summary.textContent=[
      'Fun Event — Event Enquiry',
      'Name: '+d.get('name'),
      'Email: '+d.get('email'),
      'Phone: '+(d.get('phone')||'Not provided'),
      'Occasion: '+d.get('occasion'),
      'Preferred date: '+(d.get('date')||'To be confirmed'),
      'Venue: '+(d.get('venue')||'To be confirmed'),
      '',
      'Event details:',
      d.get('message')
    ].join('\n');
    const waBtn=document.querySelector('#enquiry-whatsapp');
    if(waBtn)waBtn.href='https://wa.me/971567612222?text='+encodeURIComponent(summary.textContent);
    const mailBtn=document.querySelector('#enquiry-email');
    if(mailBtn)mailBtn.href='mailto:info@funevents.ae?subject='+encodeURIComponent('Event enquiry — '+d.get('occasion'))+'&body='+encodeURIComponent(summary.textContent);
    result.hidden=false;
    status.textContent='Enquiry saved. Choose WhatsApp or Email below to continue.';
    result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  });
  const copyBtn=document.querySelector('#copy-enquiry');
  copyBtn?.addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(summary.textContent);
      status.textContent='Enquiry copied to clipboard.';
    }catch{
      const range=document.createRange();
      range.selectNodeContents(summary);
      const selection=getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent='Select Copy from your browser to copy the highlighted enquiry.';
    }
  });
}

/* ==============================================================================
   FUN EVENT — DYNAMIC SERVICE MODAL POPUP & CONTEXT ENGINE
   ============================================================================== */
(()=>{
  'use strict';
  
  // Detect default service from current page URL
  const pagePath = location.pathname || '/';
  const getContextualService = (customName) => {
    if(customName) return customName;
    if(pagePath.includes('/weddings')) return 'Weddings & Stage Décor';
    if(pagePath.includes('/celebrations')) return 'Private Celebrations & Galas';
    if(pagePath.includes('/hospitality')) return 'Traditional Emirati Hospitality';
    if(pagePath.includes('/services')) return 'Event Services Setup';
    if(pagePath.includes('/experience')) return 'VIP Legacy & Experience';
    return 'Full Event Management';
  };

  // Create & mount popup DOM if not present
  let modalBackdrop = document.querySelector('.fe-service-modal-backdrop');
  if(!modalBackdrop){
    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'fe-service-modal-backdrop';
    modalBackdrop.innerHTML = `
      <div class="fe-service-modal" role="dialog" aria-modal="true" aria-labelledby="fe-modal-title">
        <button class="fe-modal-close" aria-label="Close modal">×</button>
        <div id="fe-modal-body">
          <div class="fe-modal-head">
            <span class="fe-modal-service-badge" id="fe-modal-badge">✨ Luxury Wedding Service</span>
            <h2 id="fe-modal-title">Plan your <em>celebration.</em></h2>
            <p>Tell us your dates, venue & guest count. We will prepare an exact proposal with immediate WhatsApp & Email booking support.</p>
          </div>
          <form id="fe-service-form">
            <input type="text" name="_hp_check" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;height:0;width:0" tabindex="-1" autocomplete="off">
            <input type="hidden" name="occasion" id="fe-input-service" value="Wedding">
            <div class="fe-modal-fields">
              <label>Your Name *<input type="text" name="name" required placeholder="Full Name" maxlength="100"></label>
              <label>Phone / WhatsApp *<input type="tel" name="phone" required placeholder="+971 50 000 0000" maxlength="40"></label>
              <label>Email Address *<input type="email" name="email" required placeholder="your@email.com" maxlength="160"></label>
              <label>Service / Occasion
                <select id="fe-select-service" name="service_display">
                  <option value="Weddings & Stage Décor">Weddings & Stage Décor</option>
                  <option value="Structure & Luxury Tents">Structure & Luxury Tents</option>
                  <option value="Bespoke Floral & Furniture">Bespoke Floral & Furniture</option>
                  <option value="Atmosphere & Comfort (Sound, Light, AC)">Atmosphere & Comfort (Sound, Light, AC)</option>
                  <option value="Traditional Emirati Hospitality">Traditional Emirati Hospitality</option>
                  <option value="Private Celebrations & Galas">Private Celebrations & Galas</option>
                  <option value="Corporate Event & Majlis">Corporate Event & Majlis</option>
                </select>
              </label>
              <label>Preferred Date<input type="date" name="date"></label>
              <label>Venue / Emirate<input type="text" name="venue" placeholder="Dubai, Abu Dhabi, etc." maxlength="180"></label>
              <label class="full-width">Your Event Vision & Requirements *<textarea name="message" rows="3" required placeholder="Describe your theme, guest count, or special setup requests..." maxlength="2000"></textarea></label>
              <button type="submit" class="fe-modal-submit" id="fe-submit-btn">Send Enquiry & Request Booking ↗</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);
  }

  const closeBtn = modalBackdrop.querySelector('.fe-modal-close');
  const modalBody = modalBackdrop.querySelector('#fe-modal-body');
  const serviceBadge = modalBackdrop.querySelector('#fe-modal-badge');
  const serviceInput = modalBackdrop.querySelector('#fe-input-service');
  const serviceSelect = modalBackdrop.querySelector('#fe-select-service');
  const serviceForm = modalBackdrop.querySelector('#fe-service-form');

  const closeModal = () => {
    modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const openModal = (serviceName) => {
    const service = getContextualService(serviceName);
    serviceBadge.textContent = '✨ ' + service;
    serviceInput.value = service;
    if(serviceSelect) serviceSelect.value = service;
    
    // Reset form view if previously submitted
    const formEl = modalBackdrop.querySelector('#fe-service-form');
    if(formEl) {
      formEl.style.display = '';
      formEl.reset();
      serviceInput.value = service;
      if(serviceSelect) serviceSelect.value = service;
    }
    const successView = modalBackdrop.querySelector('.fe-modal-success');
    if(successView) successView.remove();
    const headEl = modalBackdrop.querySelector('.fe-modal-head');
    if(headEl) headEl.style.display = '';

    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  closeBtn?.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if(e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) closeModal();
  });

  serviceSelect?.addEventListener('change', (e) => {
    serviceInput.value = e.target.value;
    serviceBadge.textContent = '✨ ' + e.target.value;
  });

  // Handle Form Submission inside Popup
  serviceForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = modalBackdrop.querySelector('#fe-submit-btn');
    if(submitBtn) {
      submitBtn.textContent = 'Preparing Enquiry...';
      submitBtn.disabled = true;
    }

    const fd = new FormData(serviceForm);
    const serviceName = serviceInput.value || serviceSelect.value || 'General Enquiry';
    const subData = {
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      occasion: serviceName,
      date: String(fd.get('date') || ''),
      venue: String(fd.get('venue') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      _hp_check: String(fd.get('_hp_check') || '')
    };

    // 1. Local Storage Fallback
    try {
      const KEY = 'fe-form-submissions-v1';
      const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
      existing.push({
        id: 'FE-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
        createdAt: new Date().toISOString(),
        status: 'new',
        ...subData
      });
      localStorage.setItem(KEY, JSON.stringify(existing));
    } catch(err) {
      console.warn('Local storage write note:', err);
    }

    // 2. Direct Supabase Submission
    if(window.FunEventSupabase && typeof window.FunEventSupabase.submitEnquiry === 'function') {
      try {
        await window.FunEventSupabase.submitEnquiry(subData);
      } catch(err) {
        console.warn('Supabase enquiry error:', err.message);
      }
    }

    // 3. Render High-Conversion Success Screen
    const summaryText = [
      `Fun Event UAE — ${serviceName} Booking Request`,
      `Name: ${subData.name}`,
      `Phone: ${subData.phone}`,
      `Email: ${subData.email}`,
      `Service: ${serviceName}`,
      `Date: ${subData.date || 'TBD'}`,
      `Venue: ${subData.venue || 'TBD'}`,
      `Notes: ${subData.message}`
    ].join('\n');

    const waLink = 'https://wa.me/971567612222?text=' + encodeURIComponent(summaryText);
    const emailLink = 'mailto:info@funevents.ae?subject=' + encodeURIComponent(`Booking Enquiry: ${serviceName}`) + '&body=' + encodeURIComponent(summaryText);

    modalBackdrop.querySelector('.fe-modal-head').style.display = 'none';
    serviceForm.style.display = 'none';

    const successDiv = document.createElement('div');
    successDiv.className = 'fe-modal-success';
    successDiv.innerHTML = `
      <div class="success-icon">✓</div>
      <h3>Enquiry Sent Successfully</h3>
      <p>Thank you, <strong>${escapeHTML(subData.name)}</strong>. Your request for <em>${escapeHTML(serviceName)}</em> has been recorded. Connect with our event directors directly below:</p>
      <div class="fe-modal-actions">
        <a class="fe-modal-btn-wa" href="${waLink}" target="_blank" rel="noopener noreferrer">
          <span>💬 Continue in WhatsApp ↗</span>
        </a>
        <a class="fe-modal-btn-email" href="${emailLink}">
          <span>✉️ Send via Email ↗</span>
        </a>
      </div>
    `;
    modalBody.appendChild(successDiv);
  });

  // Attach triggers across all pages
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-service-popup], .service, .service-story, .inner-hero-cta-secondary');
    if(!trigger) return;
    
    // If on /contact/ and it's a hash jump to #event-enquiry, let it scroll
    if(pagePath.includes('/contact') && trigger.getAttribute('href')?.includes('#event-enquiry')) return;

    // Detect service name
    let sName = trigger.dataset.servicePopup;
    if(!sName && trigger.closest('.service-story')) {
      sName = trigger.closest('.service-story').querySelector('h2')?.textContent?.trim();
    }
    if(!sName && trigger.classList.contains('service')) {
      sName = trigger.querySelector('h3')?.textContent?.trim();
    }
    if(!sName && trigger.classList.contains('inner-hero-cta-secondary')) {
      sName = document.querySelector('h1')?.textContent?.trim();
    }

    if(sName) {
      e.preventDefault();
      openModal(sName);
    }
  });

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  // Export global trigger for visual editor or custom buttons
  window.openServiceModal = openModal;
})();
