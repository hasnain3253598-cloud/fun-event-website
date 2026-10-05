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
