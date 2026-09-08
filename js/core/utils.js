export const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const val=(r,k)=>r?.[k]??'';
export const rows=(a)=>Array.isArray(a)?a.filter(r=>Object.values(r||{}).some(v=>v!==''&&v!=null)):[];
export function dateValue(v){if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10)}
export function formatDate(v){if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):new Intl.DateTimeFormat(undefined,{day:'2-digit',month:'short',year:'numeric'}).format(d)}
export function formatDateTime(v){if(!v)return '—';const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):new Intl.DateTimeFormat(undefined,{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}
export function statusClass(v=''){const x=String(v).toLowerCase();if(['active','online','completed','scheduled','production','available','https','healthy'].some(k=>x.includes(k)))return 'success';if(['pending','progress','development','soon','medium','warning'].some(k=>x.includes(k)))return 'warning';if(['overdue','problem','offline','error','archived','cancelled','unreachable','critical'].some(k=>x.includes(k)))return 'danger';return 'info'}
export const badge=v=>v?`<span class="badge ${statusClass(v)}">${esc(v)}</span>`:'';
export const money=v=>v===''||v==null?'—':new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(Number(v)||0);
export const normalize=p=>Array.isArray(p)?p:Array.isArray(p?.data)?p.data:[];
export const activeStatus=s=>!['archived','cancelled','closed','completed'].includes(String(s||'').toLowerCase());
export const matches=(r,q)=>!q||Object.values(r||{}).join(' ').toLowerCase().includes(q.toLowerCase());
export function selectOptions(values,current=''){return ['<option value="">Select…</option>',...values.filter((v,i,a)=>v&&a.indexOf(v)===i).map(v=>`<option value="${esc(v)}" ${String(v)===String(current)?'selected':''}>${esc(v)}</option>`)].join('')}
export function uniqueValues(arr,key){return [...new Set(rows(arr).map(r=>String(r[key]??'')).filter(Boolean))].sort()}
