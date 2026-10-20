let products=[],selection={};
const API_ORIGIN=window.location?.hostname?.endsWith('.github.io')?'https://cerise-demoiselle-studio.rich-trout-3520.chatgpt.site':'';
const $=id=>document.getElementById(id);
const money=n=>'Rs '+n.toLocaleString('en-MU',{minimumFractionDigits:2,maximumFractionDigits:2});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{const saved=JSON.parse(localStorage.getItem('cerise-selection'));selection=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{}}catch{}
function save(){try{localStorage.setItem('cerise-selection',JSON.stringify(selection))}catch{}$('count').textContent=Object.values(selection).reduce((a,b)=>a+b,0)}
function add(id){const p=products.find(p=>p.id===String(id));if(!p||p.status==='out-of-stock'||p.stock===0)return false;if(p.stock!==null&&(selection[id]||0)>=p.stock)return false;selection[id]=(selection[id]||0)+1;save();render();return true;}
function availability(p){if(p.status==='out-of-stock'||p.stock===0)return 'Out of stock';if(p.stock!==null)return p.stock+' in stock';return p.status==='in-stock'?'In stock':'Made to order';}
// Keep both coasters first, Christmas Edition third, personalized Nigel fourth.
const expandedDescriptions=new Set();
function productPriority(p){
  const n=String(p.name||'').toLowerCase();
  if(n.includes('wooden')&&n.includes('coaster')){
    if(/\bbig\b/.test(n))return 0;
    if(/\bsmall\b/.test(n))return 1;
  }
  if(n.includes('nigel')&&n.includes('christmas')&&n.includes('edition'))return 2;
  if(n==='nigel - personalized 1 of 1')return 3;
  return 4;
}
function updateDescriptionToggles(){
  document.querySelectorAll('.desc-area:not(.is-expanded)').forEach(wrap=>{
    const desc=wrap.querySelector('.product-desc'),toggle=wrap.querySelector('.desc-toggle');
    if(!desc||!toggle)return;
    const clippedHeight=desc.getBoundingClientRect().height;
    desc.style.webkitLineClamp='unset';
    const fullHeight=desc.getBoundingClientRect().height;
    desc.style.webkitLineClamp='';
    toggle.hidden=fullHeight<=clippedHeight+1;
  });
}
function render(){
  const q=$('search').value.toLowerCase();
  const list=products.filter(p=>[p.name,p.reference,p.description].join(' ').toLowerCase().includes(q))
    .sort((a,b)=>productPriority(a)-productPriority(b));
  $('grid').innerHTML=list.map(p=>{
    const expanded=expandedDescriptions.has(String(p.id));
    const descId='desc-'+String(p.id).replace(/[^a-zA-Z0-9_-]/g,'_');
    return `<article class="card"><button class="photo-button" data-open="${escape(p.id)}" aria-label="View ${escape(p.name)}"><img src="${p.image}" alt="${escape(p.name)}" loading="lazy"></button><p class="category">${availability(p)}</p><h3>${escape(p.name)}</h3><div class="desc-area${expanded?' is-expanded':''}"><p class="product-desc" id="${descId}">${escape(p.description||'')}</p><button type="button" class="desc-toggle" data-toggle-desc="${escape(p.id)}" aria-controls="${descId}" aria-expanded="${expanded}">${expanded?'Less':'…more'}</button></div><div class="card-bottom"><span>${money(p.price)}</span><button class="add" data-add="${escape(p.id)}" ${p.status==='out-of-stock'||p.stock===0?'disabled':''}>${selection[p.id]?'In cart ('+selection[p.id]+') +':'Add to cart +'}</button></div></article>`;
  }).join('');
  $('empty').textContent='No pieces match your search. Try another name.';
  $('empty').hidden=!!list.length;
  $('results').textContent=list.length+' products shown';
  updateDescriptionToggles();
}
function openProduct(id){const p=products.find(p=>p.id===String(id));if(!p)return;$('productDialog').dataset.product=id;$('productDetails').innerHTML=`<img src="${p.image}" alt="${escape(p.name)}"><div class="detail-copy"><p class="eyebrow">${availability(p)}</p><h2>${escape(p.name)}</h2>${p.description?'<p>'+escape(p.description)+'</p>':''}<p class="price">${money(p.price)}</p><button class="primary" data-add="${p.id}" ${p.status==='out-of-stock'||p.stock===0?'disabled':''}>Add to cart +</button><p id="detailStatus" class="small" aria-live="polite"></p></div>`;if(!$('productDialog').open)$('productDialog').showModal();}
function renderSelection(){const list=products.filter(p=>selection[p.id]);$('selectedItems').innerHTML=list.length?list.map(p=>`<div class="selected-row"><img src="${p.image}" alt=""><div class="item-info">${escape(p.name)}<p class="small">${money(p.price)} each</p></div><div class="qty"><button data-change="${p.id}" data-delta="-1" aria-label="Remove one ${escape(p.name)}">−</button><span>${selection[p.id]}</span><button data-change="${p.id}" data-delta="1" aria-label="Add one ${escape(p.name)}">+</button></div></div>`).join(''):'<p>Your cart is empty. Explore the collection to add a piece.</p>';$('selectionTotal').textContent=money(list.reduce((n,p)=>n+p.price*selection[p.id],0));$('copy').disabled=!list.length;}
document.addEventListener('click',e=>{const toggle=e.target.closest('[data-toggle-desc]');if(toggle){const wrap=toggle.closest('.desc-area');if(!wrap)return;const id=toggle.dataset.toggleDesc;const expanded=!wrap.classList.contains('is-expanded');wrap.classList.toggle('is-expanded',expanded);if(expanded)expandedDescriptions.add(id);else expandedDescriptions.delete(id);toggle.setAttribute('aria-expanded',String(expanded));toggle.textContent=expanded?'Less':'…more';if(!expanded)updateDescriptionToggles();return;}const open=e.target.closest('[data-open]'),a=e.target.closest('[data-add]'),change=e.target.closest('[data-change]');if(open)openProduct(open.dataset.open);if(a){const added=add(a.dataset.add);if($('detailStatus'))$('detailStatus').textContent=added?'Added to your cart.':'No more units are available to add.'}if(change){const id=change.dataset.change;const p=products.find(p=>p.id===id);const max=p?.status==='out-of-stock'?0:p?.stock??Infinity;selection[id]=Math.min(max,Math.max(0,(selection[id]||0)+Number(change.dataset.delta)));if(!selection[id])delete selection[id];save();renderSelection();render()}if(e.target.closest('.close'))e.target.closest('dialog').close();});
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});
$('selectionBtn').onclick=()=>{renderSelection();$('copyStatus').textContent='';$('selectionDialog').showModal()};$('search').oninput=render;
function cartMessage(){const list=products.filter(p=>selection[p.id]);return 'Hello Cerise Demoiselle Studio!\nI would like to order the following items:\n\n'+list.map((p,i)=>`${i+1}. ${p.name.replace(/\s+/g,' ').trim()}\n   Quantity: ${selection[p.id]} × ${money(p.price)}\n   Subtotal: ${money(p.price*selection[p.id])}`).join('\n\n')+'\n\nTotal: '+money(list.reduce((sum,p)=>sum+p.price*selection[p.id],0))+'\n\nPlease confirm availability and delivery or collection details. Thank you!';}
$('copy').onclick=()=>{if(!products.some(p=>selection[p.id]))return;window.open('https://wa.me/23055003777?text='+encodeURIComponent(cartMessage()),'_blank','noopener,noreferrer');};
async function refresh(){try{const r=await fetch(API_ORIGIN+'/api/products',{cache:'no-store'});if(!r.ok)throw Error();products=(await r.json()).map(p=>({...p,name:String(p.name||'').trim().toLowerCase()==='nigel'?'Nigel - personalized 1 of 1':p.name,image:API_ORIGIN?new URL(p.image,API_ORIGIN+'/').href:p.image}));selection=Object.fromEntries(Object.entries(selection).filter(([id,n])=>products.some(p=>p.id===id&&p.status!=='out-of-stock'&&p.stock!==0)&&Number.isSafeInteger(n)&&n>0).map(([id,n])=>[id,Math.min(n,products.find(p=>p.id===id).stock??n)]));$('total').textContent=products.length+' pieces';save();render();if($('selectionDialog').open)renderSelection();if($('productDialog').open){const id=$('productDialog').dataset.product;if(products.some(p=>p.id===id))openProduct(id);else $('productDialog').close()}}catch{$('empty').hidden=false;$('empty').textContent='The collection could not load. Please refresh to try again.'}}
const intro=$('brandIntro');if(intro){setTimeout(()=>intro.remove(),1900);intro.addEventListener('click',()=>intro.remove())}
refresh();setInterval(refresh,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
window.addEventListener('resize',updateDescriptionToggles);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(updateDescriptionToggles);

