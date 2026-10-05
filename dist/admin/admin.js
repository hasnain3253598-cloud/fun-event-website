(()=>{
'use strict';
const KEYS={pin:'fe-admin-pin-v1',edits:'fe-content-overrides-v1',submissions:'fe-form-submissions-v1'};
const PAGES=[
 {name:'Home',path:'/',note:'Main landing page'},
 {name:'About',path:'/about/',note:'Company story'},
 {name:'Services',path:'/services/',note:'Complete services'},
 {name:'Weddings',path:'/weddings/',note:'Wedding setups'},
 {name:'Celebrations',path:'/celebrations/',note:'Private events'},
 {name:'Hospitality',path:'/hospitality/',note:'Emirati hospitality'},
 {name:'Gallery',path:'/gallery/',note:'Portfolio collection'},
 {name:'Experience',path:'/experience/',note:'Events & legacy'},
 {name:'Contact',path:'/contact/',note:'Enquiry form'}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const getJSON=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
const setJSON=(key,value)=>{localStorage.setItem(key,JSON.stringify(value))};
const toast=message=>{const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)};
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
const normalPath=path=>{const clean=(path||'/').split('?')[0].split('#')[0];return clean==='/'?'/':clean.replace(/\/+$/,'')+'/'};
const hash=async value=>{const bytes=new TextEncoder().encode(value);const result=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(result)].map(b=>b.toString(16).padStart(2,'0')).join('')};
let activePage='/',selectedElement=null,selectedSelector='',hoveredElement=null;

function initAuth(){
 const saved=localStorage.getItem(KEYS.pin),screen=$('#auth-screen'),shell=$('#admin-shell'),confirmWrap=$('#confirm-wrap');
 if(saved){$('#auth-title').textContent='Unlock content studio';$('#auth-copy').textContent='Enter the local PIN created for this browser.';$('#auth-submit').textContent='Unlock admin';confirmWrap.hidden=true}
 const unlock=()=>{screen.hidden=true;shell.hidden=false;sessionStorage.setItem('fe-admin-session','1');bootAdmin()};
 if(saved&&sessionStorage.getItem('fe-admin-session')==='1'){unlock();return}
 $('#auth-form').addEventListener('submit',async event=>{
  event.preventDefault();const pin=$('#admin-pin').value,status=$('#auth-status');
  if(pin.length<4){status.textContent='Use at least 4 characters.';return}
  const digest=await hash(pin);
  if(saved){
   if(digest!==saved){status.textContent='Incorrect PIN for this browser.';return}
  }else{
   if(pin!==$('#admin-pin-confirm').value){status.textContent='PIN confirmation does not match.';return}
   localStorage.setItem(KEYS.pin,digest);
  }
  unlock();
 });
}

function bootAdmin(){
 renderPages();renderStats();renderSubmissions();bindAdmin();
 loadPreview('/');
 syncFromSupabase();
}
async function syncFromSupabase(){
 const statusEl=$('#backend-status');
 if(!window.FunEventSupabase){if(statusEl)statusEl.textContent='● Local fallback';return}
 try{
  const res=await window.FunEventSupabase.fetchSubmissions(50);
  if(res&&res.success){
   if(statusEl){
    statusEl.textContent='● Supabase Live';
    statusEl.style.background='rgba(34,197,94,0.15)';
    statusEl.style.color='#22c55e';
    statusEl.style.borderColor='rgba(34,197,94,0.3)';
   }
   if(Array.isArray(res.data)&&res.data.length){
    const local=getJSON(KEYS.submissions);
    const map=new Map();
    local.forEach(item=>map.set(item.id,item));
    res.data.forEach(item=>{
     if(!map.has(item.id)){
      map.set(item.id,{
       id:item.id,
       createdAt:item.created_at||item.createdAt||new Date().toISOString(),
       status:item.status||'new',
       name:item.name,
       email:item.email,
       phone:item.phone,
       occasion:item.occasion,
       date:item.date,
       venue:item.venue,
       message:item.message
      });
     }else{
      const ex=map.get(item.id);
      ex.status=item.status||ex.status;
     }
    });
    const merged=Array.from(map.values()).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    setJSON(KEYS.submissions,merged);
    renderSubmissions();renderStats();
   }
  }else{
   if(statusEl){statusEl.textContent='● Supabase Ready (Pending Table)';statusEl.title='Run supabase-schema.sql in Supabase SQL editor to activate database tables'}
  }
 }catch(e){
  if(statusEl)statusEl.textContent='● Local fallback';
 }
}
function switchView(view){
 $$('.admin-view').forEach(p=>p.classList.toggle('is-active',p.dataset.viewPanel===view));
 $$('.nav-item').forEach(b=>b.classList.toggle('is-active',b.dataset.view===view));
 $('#view-title').textContent=({dashboard:'Dashboard',pages:'Pages',editor:'Visual Editor',submissions:'Submissions',settings:'Settings'})[view]||view;
 $('.sidebar').classList.remove('is-open');
 if(view==='submissions')renderSubmissions();
 if(view==='dashboard')renderStats();
}
function bindAdmin(){
 $$('.nav-item').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.view)));
 $$('[data-switch-view]').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.switchView)));
 $$('[data-open-editor]').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.openEditor)));
 $('#quick-edit').addEventListener('click',()=>openEditor('/'));
 $('#mobile-nav-toggle').addEventListener('click',()=>$('.sidebar').classList.toggle('is-open'));
 $('#logout-button').addEventListener('click',()=>{sessionStorage.removeItem('fe-admin-session');location.reload()});
 $('#editor-page').addEventListener('change',event=>loadPreview(event.target.value));
 $('#refresh-preview').addEventListener('click',()=>loadPreview(activePage));
 $('#open-live-page').addEventListener('click',()=>window.open(activePage,'_blank','noopener'));
 $$('.viewport-switch button').forEach(button=>button.addEventListener('click',()=>{
  $$('.viewport-switch button').forEach(b=>b.classList.toggle('is-active',b===button));
  $('#preview-frame-wrap').style.width=button.dataset.width;
 }));
 $('#inspector-form').addEventListener('submit',saveSelected);
 $('#remove-override').addEventListener('click',restoreSelected);
 $('#field-upload').addEventListener('change',handleUpload);
 $('#mark-all-read').addEventListener('click',()=>{
  const rows=getJSON(KEYS.submissions);
  rows.forEach(row=>{
   if(row.status!=='read'){
    row.status='read';
    if(window.FunEventSupabase&&typeof window.FunEventSupabase.updateSubmissionStatus==='function'){
     window.FunEventSupabase.updateSubmissionStatus(row.id,'read').catch(()=>{});
    }
   }
  });
  setJSON(KEYS.submissions,rows);renderSubmissions();renderStats();toast('All enquiries marked as read');
 });
 $('#export-submissions').addEventListener('click',exportCSV);
 $('#export-backup').addEventListener('click',exportBackup);
 $('#import-backup').addEventListener('change',importBackup);
 $('#change-pin-form').addEventListener('submit',changePin);
 $('#reset-data').addEventListener('click',resetData);
 const dialog=$('#submission-dialog');
 $('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
}
function renderPages(){
 const options=PAGES.map(page=>'<option value="'+page.path+'">'+page.name+'</option>').join('');
 $('#editor-page').innerHTML=options;
 const cards=PAGES.map((page,index)=>'<article class="page-card"><span>'+String(index+1).padStart(2,'0')+' / PAGE</span><h3>'+page.name+'</h3><p>'+page.note+'</p><div class="card-actions"><button class="primary-btn" data-edit-page="'+page.path+'">Edit page</button><a class="ghost-btn" href="'+page.path+'" target="_blank" rel="noopener">View ↗</a></div></article>').join('');
 $('#page-grid').innerHTML=cards;
 $('#quick-pages').innerHTML=PAGES.slice(0,6).map(page=>'<button class="quick-page" data-edit-page="'+page.path+'">'+page.name+'<small>'+page.note+'</small></button>').join('');
 $$('[data-edit-page]').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.editPage)));
}
function openEditor(path){switchView('editor');loadPreview(path)}
function loadPreview(path){
 activePage=normalPath(path);$('#editor-page').value=activePage;selectedElement=null;selectedSelector='';
 $('#inspector-empty').hidden=false;$('#inspector-form').hidden=true;
 const frame=$('#site-preview');
 frame.onload=()=>wirePreview(frame);
 frame.src=activePage+(activePage.includes('?')?'&':'?')+'fe_admin_preview=1&t='+Date.now();
}
function wirePreview(frame){
 let doc;
 try{doc=frame.contentDocument}catch{return}
 if(!doc)return;
 const style=doc.createElement('style');
 style.textContent='.fe-admin-hover{outline:2px dashed #c69b68!important;outline-offset:2px!important;cursor:pointer!important}.fe-admin-selected{outline:3px solid #d69249!important;outline-offset:2px!important}';
 doc.head.appendChild(style);
 doc.addEventListener('mouseover',event=>{
  const el=event.target;if(!(el instanceof frame.contentWindow.HTMLElement)||el===doc.body||el===doc.documentElement)return;
  if(hoveredElement&&hoveredElement!==selectedElement)hoveredElement.classList.remove('fe-admin-hover');
  hoveredElement=el;if(el!==selectedElement)el.classList.add('fe-admin-hover');
 },true);
 doc.addEventListener('mouseout',event=>{if(event.target!==selectedElement)event.target.classList?.remove('fe-admin-hover')},true);
 doc.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  let el=event.target;
  if(el.closest('.fe-whatsapp-float'))el=el.closest('.fe-whatsapp-float');
  selectElement(el,doc);
 },true);
 doc.addEventListener('submit',event=>event.preventDefault(),true);
}
function selectorFor(el){
 if(el.id)return '#'+CSS.escape(el.id);
 const parts=[];let node=el;
 while(node&&node.nodeType===1&&node.tagName.toLowerCase()!=='body'){
  let part=node.tagName.toLowerCase();
  if(node.classList.length){
   const stable=[...node.classList].filter(c=>!c.startsWith('fe-admin-')&&!['entered','entry-pending','visible','media-visible','is-active'].includes(c)).slice(0,2);
   if(stable.length)part+='.'+stable.map(c=>CSS.escape(c)).join('.');
  }
  const parent=node.parentElement;
  if(parent){
   const same=[...parent.children].filter(child=>child.tagName===node.tagName);
   if(same.length>1)part+=':nth-of-type('+(same.indexOf(node)+1)+')';
  }
  parts.unshift(part);node=parent;
 }
 return 'body > '+parts.join(' > ');
}
function selectElement(el,doc){
 if(selectedElement)selectedElement.classList.remove('fe-admin-selected');
 selectedElement=el;selectedElement.classList.remove('fe-admin-hover');selectedElement.classList.add('fe-admin-selected');
 selectedSelector=selectorFor(el);
 $('#inspector-empty').hidden=true;$('#inspector-form').hidden=false;
 const tag=el.tagName.toLowerCase(),saved=getJSON(KEYS.edits).find(item=>normalPath(item.page)===activePage&&item.selector===selectedSelector);
 $('#selected-tag').textContent=tag.toUpperCase();$('#selected-selector').textContent=selectedSelector;
 $('.text-field').hidden=tag==='img'||tag==='video'||tag==='source';
 $('#field-content').value=saved?.html??el.innerHTML;
 $('.image-fields').hidden=tag!=='img';
 $('#field-src').value=saved?.attrs?.src??el.getAttribute('src')??'';
 $('#field-alt').value=saved?.attrs?.alt??el.getAttribute('alt')??'';
 $('.link-fields').hidden=tag!=='a';
 $('#field-href').value=saved?.attrs?.href??el.getAttribute('href')??'';
 $('#field-new-tab').checked=(saved?.attrs?.target??el.getAttribute('target'))==='_blank';
 const cs=doc.defaultView.getComputedStyle(el),styles=saved?.style||{};
 $('#field-color').value=toHex(styles.color||cs.color,'#111111');
 $('#field-bg').value=toHex(styles.backgroundColor||cs.backgroundColor,'#ffffff');
 $('#field-size').value=parseInt(styles.fontSize||cs.fontSize)||'';
 $('#field-align').value=styles.textAlign||(['left','center','right'].includes(cs.textAlign)?cs.textAlign:'');
 $('#field-pt').value=parseInt(styles.paddingTop||cs.paddingTop)||0;
 $('#field-pb').value=parseInt(styles.paddingBottom||cs.paddingBottom)||0;
 $('#field-hidden').checked=(saved?.style?.display==='none');
}
function toHex(color,fallback){
 if(!color||color==='transparent'||color==='rgba(0, 0, 0, 0)')return fallback;
 if(color.startsWith('#'))return color.slice(0,7);
 const nums=color.match(/\d+/g);if(!nums||nums.length<3)return fallback;
 return '#'+nums.slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('');
}
function saveSelected(event){
 event.preventDefault();if(!selectedElement||!selectedSelector)return;
 const tag=selectedElement.tagName.toLowerCase(),attrs={};
 if(tag==='img'){attrs.src=$('#field-src').value.trim();attrs.alt=$('#field-alt').value.trim()}
 if(tag==='a'){attrs.href=$('#field-href').value.trim();attrs.target=$('#field-new-tab').checked?'_blank':'_self';attrs.rel=$('#field-new-tab').checked?'noopener noreferrer':''}
 const style={
  color:$('#field-color').value,
  backgroundColor:$('#field-bg').value,
  fontSize:($('#field-size').value||'')?$('#field-size').value+'px':'',
  textAlign:$('#field-align').value,
  paddingTop:($('#field-pt').value||'')?$('#field-pt').value+'px':'',
  paddingBottom:($('#field-pb').value||'')?$('#field-pb').value+'px':'',
  display:$('#field-hidden').checked?'none':''
 };
 const edit={page:activePage,selector:selectedSelector,html:(tag==='img'||tag==='video'||tag==='source')?null:$('#field-content').value,attrs,style,updatedAt:new Date().toISOString()};
 const edits=getJSON(KEYS.edits),index=edits.findIndex(item=>normalPath(item.page)===activePage&&item.selector===selectedSelector);
 if(index>-1)edits[index]=edit;else edits.push(edit);
 try{setJSON(KEYS.edits,edits)}catch{toast('Storage full. Use a smaller image or export and reset.');return}
 applyEdit(selectedElement,edit);renderStats();

 if(window.FunEventSupabase&&typeof window.FunEventSupabase.saveContentOverride==='function'){
  // Quota safeguard: do not send oversized base64 dumps to database
  if(attrs.src&&attrs.src.startsWith('data:image/')&&attrs.src.length>50000){
   toast('Saved locally. (Image is large base64: use an asset URL to sync to cloud without quota bloat)');
   return;
  }
  window.FunEventSupabase.saveContentOverride(edit).then(res=>{
   if(res&&res.success)toast('Change saved & synced to Supabase');
   else toast('Saved in this browser (Supabase table pending)');
  }).catch(()=>{toast('Change saved in this browser')});
 }else{
  toast('Change saved in this browser');
 }
}
function applyEdit(el,edit){
 if(edit.html!==null&&edit.html!==undefined)el.innerHTML=edit.html;
 Object.entries(edit.attrs||{}).forEach(([name,value])=>{if(value)el.setAttribute(name,value);else el.removeAttribute(name)});
 Object.entries(edit.style||{}).forEach(([name,value])=>el.style[name]=value);
}
function restoreSelected(){
 if(!selectedSelector)return;
 const edits=getJSON(KEYS.edits).filter(item=>!(normalPath(item.page)===activePage&&item.selector===selectedSelector));
 setJSON(KEYS.edits,edits);renderStats();loadPreview(activePage);
 if(window.FunEventSupabase&&typeof window.FunEventSupabase.deleteContentOverride==='function'){
  window.FunEventSupabase.deleteContentOverride(activePage,selectedSelector).catch(()=>{});
 }
 toast('Original content restored');
}
function handleUpload(event){
 const file=event.target.files[0];if(!file)return;
 if(file.size>1572864){toast('Image is larger than 1.5 MB');event.target.value='';return}
 const reader=new FileReader();reader.onload=()=>{$('#field-src').value=reader.result;toast('Image ready — click Save change')};reader.readAsDataURL(file);
}
function renderStats(){
 const edits=getJSON(KEYS.edits),subs=getJSON(KEYS.submissions),fresh=subs.filter(item=>item.status!=='read').length;
 $('#stat-pages').textContent=PAGES.length;$('#stat-edits').textContent=edits.length;$('#stat-new').textContent=fresh;$('#submission-badge').textContent=fresh;
 const bytes=(localStorage.getItem(KEYS.edits)||'').length+(localStorage.getItem(KEYS.submissions)||'').length;
 $('#stat-storage').textContent=bytes>1024?(bytes/1024).toFixed(1)+' KB':bytes+' B';
 const recent=$('#recent-submissions');
 if(!subs.length){recent.className='empty-state';recent.textContent='No local enquiries yet.'}
 else{recent.className='';recent.innerHTML=subs.slice().reverse().slice(0,4).map(s=>'<button class="quick-page" data-open-sub="'+escapeHTML(s.id)+'">'+escapeHTML(s.name||'Unnamed')+'<small>'+escapeHTML(s.occasion||'Event enquiry')+' · '+formatDate(s.createdAt)+'</small></button>').join('');$$('[data-open-sub]').forEach(b=>b.addEventListener('click',()=>openSubmission(b.dataset.openSub)))}
}
function renderSubmissions(){
 const rows=getJSON(KEYS.submissions).slice().reverse(),container=$('#submission-list');
 if(!rows.length){container.innerHTML='<div class="panel empty-state">No enquiries have been prepared on this browser yet.</div>';renderStats();return}
 container.innerHTML=rows.map(row=>'<article class="submission-row '+(row.status==='read'?'':'is-new')+'"><i class="status-dot"></i><div><strong>'+escapeHTML(row.name||'Unnamed')+'</strong><br><small>'+escapeHTML(row.email||'No email')+'</small></div><span class="occasion">'+escapeHTML(row.occasion||'Event')+'</span><small class="date">'+formatDate(row.createdAt)+'</small><button data-view-sub="'+escapeHTML(row.id)+'">View details ↗</button></article>').join('');
 $$('[data-view-sub]').forEach(button=>button.addEventListener('click',()=>openSubmission(button.dataset.viewSub)));
 renderStats();
}
function openSubmission(id){
 const rows=getJSON(KEYS.submissions),row=rows.find(item=>item.id===id);if(!row)return;
 row.status='read';setJSON(KEYS.submissions,rows);
 if(window.FunEventSupabase&&typeof window.FunEventSupabase.updateSubmissionStatus==='function'){
  window.FunEventSupabase.updateSubmissionStatus(id,'read').catch(()=>{});
 }
 $('#submission-detail').innerHTML='<p class="kicker">Event enquiry</p><h2>'+escapeHTML(row.name||'Unnamed enquiry')+'</h2><dl class="detail-grid">'+[
  ['Received',formatDate(row.createdAt)],['Email',row.email],['Phone',row.phone||'Not provided'],['Occasion',row.occasion],['Preferred date',row.date||'To be confirmed'],['Venue',row.venue||'To be confirmed'],['Message',row.message]
 ].map(([label,value])=>'<dt>'+escapeHTML(label)+'</dt><dd>'+escapeHTML(value||'')+'</dd>').join('')+'</dl>';
 $('#submission-dialog').showModal();renderSubmissions();
}
function formatDate(value){try{return new Intl.DateTimeFormat('en-AE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return value||''}}
function download(name,type,content){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportCSV(){
 const rows=getJSON(KEYS.submissions),heads=['Created','Name','Email','Phone','Occasion','Date','Venue','Message','Status'];
 const cell=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
 const csv=[heads.map(cell).join(','),...rows.map(r=>[r.createdAt,r.name,r.email,r.phone,r.occasion,r.date,r.venue,r.message,r.status].map(cell).join(','))].join('\n');
 download('fun-event-enquiries.csv','text/csv;charset=utf-8',csv);toast('CSV exported');
}
function exportBackup(){
 const data={version:1,exportedAt:new Date().toISOString(),edits:getJSON(KEYS.edits),submissions:getJSON(KEYS.submissions)};
 download('fun-event-local-backup.json','application/json',JSON.stringify(data,null,2));toast('Backup exported');
}
function importBackup(event){
 const file=event.target.files[0];if(!file)return;const reader=new FileReader();
 reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!Array.isArray(data.edits)||!Array.isArray(data.submissions))throw new Error();setJSON(KEYS.edits,data.edits);setJSON(KEYS.submissions,data.submissions);renderStats();renderSubmissions();loadPreview(activePage);toast('Backup imported')}catch{toast('This is not a valid Fun Event backup')}event.target.value=''};
 reader.readAsText(file);
}
async function changePin(event){event.preventDefault();const value=$('#new-pin').value;if(value.length<4)return;localStorage.setItem(KEYS.pin,await hash(value));event.target.reset();toast('Local PIN updated')}
function resetData(){
 if(!confirm('Remove all local edits, submissions and the admin PIN from this browser?'))return;
 Object.values(KEYS).forEach(key=>localStorage.removeItem(key));sessionStorage.removeItem('fe-admin-session');location.reload();
}
initAuth();
})();