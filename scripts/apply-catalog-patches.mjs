import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const write = (f, s) => fs.writeFileSync(path.join(root, f), s);

// 1) Shopify karat field
{
  const f = 'api/products.js';
  let s = read(f);
  if (!s.includes('const karatRaw=p.metafield?.value')) {
    s = s.replace(
      "return{id:p.id,name:p.title,description:p.descriptionHtml||'',price:Number(variant?.price||0),sku:variant?.sku||'',material:p.vendor||'',images:",
      "const karatRaw=p.metafield?.value;const karat=karatRaw!=null?Number.parseFloat(String(karatRaw).replace(',','.').replace(/[^0-9.]/g,''))||undefined:undefined;return{id:p.id,name:p.title,description:p.descriptionHtml||'',price:Number(variant?.price||0),sku:variant?.sku||'',material:p.vendor||'',karat,images:"
    );
    s = s.replace(
      'images(first:10){nodes{id url altText}} variants(first:20)',
      'images(first:10){nodes{id url altText}} metafield(namespace:"custom",key:"karat"){value} variants(first:20)'
    );
    write(f, s);
  }
}

// 2) Product type carries karat
{
  const f = 'src/types.ts';
  let s = read(f);
  if (!s.includes('images:string[];karat?:number;category:string;')) {
    s = s.replace('images:string[];category:string;', 'images:string[];karat?:number;category:string;');
    write(f, s);
  }
}

// 3) Product picker: filtered select-all + karat sorting
{
  const f = 'src/components/studio/CatalogStudio3.tsx';
  let s = read(f);
  const start = s.indexOf('function ProductsPanel(');
  const end = s.indexOf('function CatalogPanel(', start);
  if (start !== -1 && end !== -1 && !s.includes("[sort,setSort]=React.useState<'none'|'karat-asc'|'karat-desc'>('none')")) {
    const replacement = `function ProductsPanel({page,products,collections,categories,onUpdate}:{page:Page;products:Product[];collections:{id:string;name:string}[];categories:{id:string;name:string}[];onUpdate:(p:Page)=>void}){const[q,setQ]=React.useState(''),[mode,setMode]=React.useState('all'),[filter,setFilter]=React.useState(''),[sort,setSort]=React.useState<'none'|'karat-asc'|'karat-desc'>('none');const ids=page.content.productIds||[];const list=products.filter(p=>{if(mode==='collection'&&filter&&!(p.collectionNames||[]).includes(filter))return false;if(mode==='category'&&filter&&p.category!==filter&&p.categoryFullName!==filter)return false;const ss=q.toLocaleLowerCase('tr-TR');if(!ss)return true;if(mode==='name')return p.name.toLocaleLowerCase('tr-TR').includes(ss);if(mode==='sku')return p.sku.toLocaleLowerCase('tr-TR').includes(ss);if(mode==='collection')return (p.collectionNames||[]).join(' ').toLocaleLowerCase('tr-TR').includes(ss);if(mode==='category')return \u0060\${p.category} \${p.categoryFullName||''}\u0060.toLocaleLowerCase('tr-TR').includes(ss);return [p.name,p.sku,p.category,p.categoryFullName,...(p.collectionNames||[])].join(' ').toLocaleLowerCase('tr-TR').includes(ss)});const sortedList=[...list].sort((a,b)=>{if(sort==='none')return 0;const av=a.karat??-1,bv=b.karat??-1;return sort==='karat-asc'?av-bv:bv-av});const updateIds=(next:string[])=>onUpdate({...page,content:{...page.content,productIds:next,blocks:syncProductFrames(page.content.blocks||[],next)}});const toggle=(id:string,on:boolean)=>updateIds(on?Array.from(new Set([...ids,id])):ids.filter(x=>x!==id));const selectAll=()=>updateIds(Array.from(new Set([...ids,...list.map(p=>p.id)])));const clearFiltered=()=>updateIds(ids.filter(id=>!list.some(p=>p.id===id)));return <div className="p-5"><Section title="Shopify ürün seç"><div className="relative"><Search size={13} className="absolute left-2.5 top-2.5 opacity-40"/><input value={q} onChange={e=>setQ(e.target.value)} className="field pl-7" placeholder="Ürün, SKU, kategori veya koleksiyon"/></div><div className="grid grid-cols-2 gap-2 mt-2"><select value={mode} onChange={e=>{setMode(e.target.value);setFilter('')}} className="field"><option value="all">Tüm alanlar</option><option value="name">Ürün adına göre</option><option value="sku">SKU numarasına göre</option><option value="collection">Koleksiyona göre</option><option value="category">Kategoriye göre</option></select><select value={filter} onChange={e=>setFilter(e.target.value)} disabled={!['collection','category'].includes(mode)} className="field"><option value="">{mode==='category'?'Venta / Shopify kategorisi':'Koleksiyon seç'}</option>{(mode==='category'?categories.map(c=>c.name):collections.map(c=>c.name)).sort((a,b)=>a.localeCompare(b,'tr')).map(x=><option key={x}>{x}</option>)}</select></div><div className="grid grid-cols-2 gap-2 mt-2"><select value={sort} onChange={e=>setSort(e.target.value as any)} className="field"><option value="none">Sıralama</option><option value="karat-asc">Karat: düşükten yükseğe</option><option value="karat-desc">Karat: yüksekten düşüğe</option></select><div className="flex gap-1"><button onClick={selectAll} disabled={!list.length} className="smallbtn flex-1">Tümünü seç</button><button onClick={clearFiltered} disabled={!list.length} className="smallbtn">Temizle</button></div></div><div className="flex items-center justify-between mt-2"><p className="text-[8px] opacity-40">{list.length} ürün / {products.length} toplam</p><span className="text-[8px] font-semibold">{ids.length} seçili</span></div></Section><div className="max-h-[60vh] overflow-y-auto space-y-1">{sortedList.map(p=>{const checked=ids.includes(p.id);return <label key={p.id} className={cn('flex items-center gap-2 p-2 border rounded cursor-pointer',checked?'border-[#0f203a] bg-[#f7f9fb]':'border-transparent')}><input className="sr-only" type="checkbox" checked={checked} onChange={e=>toggle(p.id,e.target.checked)}/><span className={cn('w-4 h-4 border flex items-center justify-center',checked?'bg-[#0f203a] text-white':'')}>{checked&&<Check size={10}/>}</span>{p.images?.[0]?<img src={p.images[0]} className="w-10 h-10 object-cover rounded"/>:<Package size={15}/>}<span className="min-w-0 text-[9px] truncate">{p.name}<small className="block opacity-40">SKU {p.sku||'—'} · {p.karat?\u0060\${p.karat}K · \u0060:''}{p.category||'Venta'}</small></span></label>})}</div></div>}`;
    s = s.slice(0, start) + replacement + s.slice(end);
  }

  // 4) Product-grid layouts automatically adapt to all selected products.
  const marker = ' const applyLayout=(id:LayoutId)=>';
  const astart = s.indexOf(marker);
  const aend = s.indexOf(' const start=(id:string', astart);
  if (astart !== -1 && aend !== -1 && !s.includes('adaptiveProductBlocks=')) {
    const replacement = ` const adaptiveProductBlocks=(layout:LayoutId,ids:string[])=>{const base=buildLayoutBlocks(layout,ids);const productCount=base.filter(b=>b.type==='frame'&&b.frameKind==='product').length;const adaptiveLayouts=['LAYOUT_C_PRODUCT_GRID','LAYOUT_J_PRODUCT_FEATURE','LAYOUT_L_COLLECTION_INDEX','LAYOUT_M_PRODUCT_GRID_12','LAYOUT_N_PRODUCT_GRID_16','LAYOUT_R_PRODUCT_WALL','LAYOUT_T_PRODUCT_INDEX'];if(!adaptiveLayouts.includes(layout)||ids.length<=productCount)return syncProductFrames(base,ids);const cols=ids.length<=12?4:ids.length<=20?4:5;const rows=Math.ceil(ids.length/cols);const gap=2;const x0=5,y0=8,totalW=90,totalH=86;const w=(totalW-gap*(cols-1))/cols;const h=Math.max(10,(totalH-gap*(rows-1))/rows);const keep=base.filter(b=>!(b.type==='frame'&&b.frameKind==='product'));const grid=ids.map((pid,i)=>productFrame(\u0060adaptive-\${layout}-\${i}\u0060,x0+(i%cols)*(w+gap),y0+Math.floor(i/cols)*(h+gap),w,h,pid));return [...keep,...grid]};\n const applyLayout=(id:LayoutId)=>{if(!page)return;const ids=page.content.productIds||[];const blocks=adaptiveProductBlocks(id,ids);commit({...page,layoutId:id,content:{...page.content,blocks,headline:'NEW COLLECTION',subheadline:'VENTA JEWELRY · DIGITAL COLLECTION',body:'A premium interactive catalog'}});setBlockId(null);setPanel('element')};\n`;
    s = s.slice(0, astart) + replacement + s.slice(aend);
  }
  write(f, s);
}

console.log('VENTA catalog patches applied');
