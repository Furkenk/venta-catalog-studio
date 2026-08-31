import React from 'react';
import { Check, Filter, Plus, Search, X } from 'lucide-react';
import { Catalog, Page, Product, PageBlock, LayoutId } from '../../types';

interface Props {
  catalog: Catalog;
  pages: Page[];
  products: Product[];
  collections?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  onReplacePages?: (pages: Page[]) => void;
}

type GridPreset = 6 | 9 | 12 | 16 | 20;
const uid = () => crypto.randomUUID();
const infoDefaults = { showName: true, showSku: true, showPrice: false, showMaterial: false, showCategory: false, showDescription: false, position: 'below' as const, align: 'left' as const, fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#0f203a', pricePrefix: '₺', lineGap: 2 };

function frame(id: string, x: number, y: number, w: number, h: number, productId?: string): PageBlock {
  return { id, type: 'frame', x, y, width: w, height: h, zIndex: 10, frameKind: 'product', productId, borderWidth: 1, borderRadius: 0, borderColor: '#d5dbe3', objectFit: 'contain', fitMode: 'contain', imageScale: 1, imagePositionX: 50, imagePositionY: 50, locked: true, productInfo: { ...infoDefaults } };
}
function text(id: string, value: string, x: number, y: number, w: number, h: number, size = 20, extra: Partial<PageBlock> = {}): PageBlock {
  return { id, type: 'text', x, y, width: w, height: h, zIndex: 20, alt: value, fontFamily: 'Georgia, serif', fontSize: size, fontStyle: 'italic', textAlign: 'left', ...extra };
}
function gridBlocks(ids: string[], count: number, cols: number, prefix: string): PageBlock[] {
  const rows = Math.ceil(count / cols), gap = 2, x0 = 5, y0 = 12, totalW = 90, totalH = 82;
  const w = (totalW - gap * (cols - 1)) / cols, h = (totalH - gap * (rows - 1)) / rows;
  return ids.slice(0, count).map((pid, i) => frame(`${prefix}-${i}-${uid().slice(0, 6)}`, x0 + (i % cols) * (w + gap), y0 + Math.floor(i / cols) * (h + gap), w, h, pid));
}
function buildBlocks(layout: LayoutId, ids: string[], preset: GridPreset): PageBlock[] {
  const p = (i: number) => ids[i]; const a: PageBlock[] = [];
  switch (layout) {
    case 'COVER': a.push(frame(`cover-product-${uid()}`, 7, 7, 86, 72, p(0)), text(`cover-title-${uid()}`, 'NEW COLLECTION', 12, 81, 76, 10, 32, { textAlign: 'center' }), text(`cover-sub-${uid()}`, 'VENTA JEWELRY · DIGITAL COLLECTION', 20, 92, 60, 4, 8, { fontFamily: 'Arial, sans-serif', fontStyle: 'normal', textAlign: 'center' })); break;
    case 'LAYOUT_B_HERO_PRODUCT': a.push(frame(`hero-product-${uid()}`, 4, 4, 55, 88, p(0)), text(`hero-title-${uid()}`, 'FEATURED PIECE', 64, 43, 30, 11, 28), text(`hero-copy-${uid()}`, 'Product story, material, craftsmanship and campaign copy.', 64, 59, 28, 18, 10, { fontFamily: 'Arial, sans-serif', fontStyle: 'normal' })); break;
    case 'LAYOUT_D_ASYMMETRIC': a.push(frame(`asym-main-${uid()}`, 4, 4, 55, 72, p(0)), frame(`asym-small-1-${uid()}`, 67, 8, 25, 28, p(1)), frame(`asym-small-2-${uid()}`, 67, 42, 25, 28, p(2)), text(`asym-title-${uid()}`, 'OBJECTS\nOF DESIRE', 66, 74, 28, 12, 24), text(`asym-copy-${uid()}`, 'A considered editorial composition.', 66, 89, 28, 6, 8, { fontFamily: 'Arial, sans-serif', fontStyle: 'normal' })); break;
    case 'LAYOUT_C_PRODUCT_GRID': { const n = preset; const cols = n === 6 ? 2 : n === 9 ? 3 : n === 12 ? 4 : n === 16 ? 4 : 5; a.push(...gridBlocks(ids, n, cols, 'grid')); break; }
    case 'LAYOUT_M_PRODUCT_GRID_12': a.push(...gridBlocks(ids, 12, 4, 'grid12')); break;
    case 'LAYOUT_N_PRODUCT_GRID_16': a.push(...gridBlocks(ids, 16, 4, 'grid16')); break;
    case 'LAYOUT_O_EDITORIAL_COLLAGE': a.push(frame(`collage-main-${uid()}`, 4, 4, 57, 63, p(0)), frame(`collage-top-${uid()}`, 66, 6, 27, 27, p(1)), frame(`collage-small-1-${uid()}`, 66, 73, 12, 20, p(2)), frame(`collage-small-2-${uid()}`, 81, 73, 12, 20, p(3)), text(`collage-title-${uid()}`, 'THE NEW OBJECTS', 65, 39, 29, 12, 22), text(`collage-copy-${uid()}`, 'Jewellery as image, object and story.', 65, 54, 28, 10, 9, { fontFamily: 'Arial, sans-serif', fontStyle: 'normal' })); break;
    case 'LAYOUT_P_IMAGE_4_PRODUCTS': a.push(frame(`p-main-${uid()}`, 4, 4, 42, 80, p(0))); for (let i = 0; i < 4; i++) a.push(frame(`p-${i}-${uid()}`, 51 + (i % 2) * 22, 7 + Math.floor(i / 2) * 39, 19, 32, p(i + 1))); a.push(text(`p-title-${uid()}`, 'EDIT / OBJECT', 51, 91, 40, 5, 12)); break;
    case 'LAYOUT_Q_SPLIT_EDITORIAL': a.push(frame(`split-main-${uid()}`, 3, 3, 57, 94, p(0)), text(`split-title-${uid()}`, 'FEATURED\nPIECE', 66, 39, 28, 17, 28), text(`split-copy-${uid()}`, 'Product story, material and craftsmanship.', 66, 61, 26, 13, 10, { fontFamily: 'Arial, sans-serif', fontStyle: 'normal' })); break;
    case 'LAYOUT_S_MAGAZINE': a.push(frame(`mag-main-${uid()}`, 4, 7, 58, 68, p(0)), frame(`mag-small-${uid()}`, 68, 8, 25, 27, p(1)), text(`mag-title-${uid()}`, 'VOLUME 01', 68, 43, 27, 9, 23), text(`mag-copy-${uid()}`, 'Objects of desire, composed as editorial.', 68, 57, 25, 14, 9, { fontFamily: 'Arial, sans-serif', fontStyle: 'normal' })); break;
    default: a.push(frame(`default-product-${uid()}`, 5, 5, 90, 85, p(0)));
  }
  return a;
}
function capacity(layout: LayoutId, preset: GridPreset) {
  switch (layout) {
    case 'LAYOUT_C_PRODUCT_GRID': return preset;
    case 'LAYOUT_M_PRODUCT_GRID_12': return 12;
    case 'LAYOUT_N_PRODUCT_GRID_16': return 16;
    case 'LAYOUT_D_ASYMMETRIC': return 3;
    case 'LAYOUT_O_EDITORIAL_COLLAGE': return 4;
    case 'LAYOUT_P_IMAGE_4_PRODUCTS': return 5;
    case 'LAYOUT_S_MAGAZINE': return 2;
    case 'LAYOUT_B_HERO_PRODUCT': case 'LAYOUT_Q_SPLIT_EDITORIAL': case 'COVER': return 1;
    default: return 1;
  }
}
function productIds(page: Page) {
  const ids = (page.content.blocks || []).filter(b => b.frameKind === 'product' && b.productId).map(b => b.productId!);
  return ids.length ? ids : (page.content.productIds || []);
}
function rebuild(base: Page, ids: string[], preset: GridPreset): Page {
  return { ...base, content: { ...base.content, productIds: ids, blocks: buildBlocks(base.layoutId, ids, preset) } };
}

export function ProductSelectionPanel({ catalog, pages, products, collections = [], categories = [], onReplacePages }: Props) {
  const [open, setOpen] = React.useState(false);
  const [pageId, setPageId] = React.useState(pages[0]?.id || '');
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [collection, setCollection] = React.useState('');
  const [karat, setKarat] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [preset, setPreset] = React.useState<GridPreset>(12);
  const page = pages.find(p => p.id === pageId) || pages[0];
  const used = React.useMemo(() => new Set(pages.flatMap(productIds)), [pages]);
  const karats = React.useMemo(() => Array.from(new Set(products.map(p => p.karat).filter((v): v is number => typeof v === 'number'))).sort((a,b)=>a-b), [products]);
  const filtered = React.useMemo(() => products.filter(p => {
    if (used.has(p.id)) return false;
    const n = name.trim().toLocaleLowerCase('tr-TR');
    const s = sku.trim().toLocaleLowerCase('tr-TR');
    if (n && !p.name.toLocaleLowerCase('tr-TR').includes(n)) return false;
    if (s && !`${p.sku} ${p.id}`.toLocaleLowerCase('tr-TR').includes(s)) return false;
    if (category && !(p.categoryId === category || p.category === category || p.categoryFullName === category)) return false;
    if (collection && !(p.collectionId === collection || (p.collectionIds || []).includes(collection))) return false;
    if (karat && String(p.karat || '') !== karat) return false;
    return true;
  }), [products, used, name, sku, category, collection, karat]);
  const selectedProducts = products.filter(p => selected.has(p.id) && !used.has(p.id));
  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));

  React.useEffect(() => { if (pages.length && !pages.some(p => p.id === pageId)) setPageId(pages[0].id); }, [pages, pageId]);
  const toggle = (id: string) => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const selectFiltered = () => setSelected(prev => { const next = new Set(prev); filtered.forEach(p => next.add(p.id)); return next; });
  const clearFiltered = () => setSelected(prev => { const next = new Set(prev); filtered.forEach(p => next.delete(p.id)); return next; });
  const clearFilters = () => { setName(''); setSku(''); setCategory(''); setCollection(''); setKarat(''); };

  const addSelected = (items: Product[]) => {
    if (!page || !items.length || !onReplacePages) return;
    const start = Math.max(0, pages.findIndex(p => p.id === page.id));
    const layout = page.layoutId;
    const current = productIds(page);
    const all = [...current, ...items.map(p => p.id).filter(id => !current.includes(id))];
    const cap = capacity(layout, preset);
    const result = pages.slice(0, start);
    const existing = pages.slice(start);
    const count = Math.max(1, Math.ceil(all.length / cap));
    for (let i = 0; i < count; i++) {
      const base = existing[i] || { id: uid(), catalogId: catalog.id, order: start + i, layoutId: layout, title: `Page ${start + i + 1}`, content: { blocks: [] } } as Page;
      result.push(rebuild(base, all.slice(i * cap, (i + 1) * cap), preset));
    }
    onReplacePages(result.map((p, i) => ({ ...p, order: i })));
    setSelected(new Set());
  };

  return <>
    <button onClick={() => setOpen(true)} className="fixed right-[348px] bottom-5 z-[85] h-10 px-4 bg-[#0f203a] text-white shadow-xl flex items-center gap-2 text-[9px] uppercase tracking-[.16em]"><Plus size={14}/> Ürün Seçimi</button>
    {open && <div className="fixed inset-0 z-[90] bg-black/30 flex items-center justify-center p-5" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="w-[900px] max-w-full h-[min(760px,calc(100vh-40px))] bg-white shadow-2xl flex flex-col text-[#0f203a]">
        <header className="h-14 border-b flex items-center justify-between px-5 shrink-0"><div><div className="text-[9px] uppercase tracking-[.22em] opacity-45">Ürün Havuzu</div><div className="text-sm font-semibold">Ürünleri filtrele ve toplu ekle</div></div><button onClick={() => setOpen(false)} className="p-2 hover:bg-[#f4f6f8]"><X size={17}/></button></header>
        <div className="p-4 border-b bg-[#fafbfc] space-y-3 shrink-0">
          <div className="grid grid-cols-2 gap-2"><div className="relative"><Search size={14} className="absolute left-3 top-3 opacity-35"/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ürün adına göre ara" className="field pl-9"/></div><div className="relative"><Filter size={14} className="absolute left-3 top-3 opacity-35"/><input value={sku} onChange={e=>setSku(e.target.value)} placeholder="Ürün kodu / SKU / ID" className="field pl-9"/></div></div>
          <div className="grid grid-cols-4 gap-2"><select value={category} onChange={e=>setCategory(e.target.value)} className="field"><option value="">Tüm kategoriler</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={collection} onChange={e=>setCollection(e.target.value)} className="field"><option value="">Tüm collection'lar</option>{collections.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={karat} onChange={e=>setKarat(e.target.value)} className="field"><option value="">Tüm karatlar</option>{karats.map(k=><option key={k} value={k}>{k}K</option>)}</select><select value={pageId} onChange={e=>setPageId(e.target.value)} className="field"><option value="">Sayfa seç</option>{pages.map((p,i)=><option key={p.id} value={p.id}>{String(i+1).padStart(2,'0')} · {p.title}</option>)}</select></div>
          <div className="flex items-center gap-2"><button onClick={clearFilters} className="h-8 px-3 border text-[9px] uppercase">Filtreleri Temizle</button><span className="text-[8px] opacity-45">Filtreler birlikte çalışır, örn. Collection + 18K + ürün adı.</span><div className="ml-auto flex items-center gap-1"><span className="text-[8px] opacity-45 mr-1">Grid</span>{([6,9,12,16,20] as GridPreset[]).map(n=><button key={n} onClick={()=>setPreset(n)} className={`h-7 min-w-7 px-2 border text-[8px] ${preset===n?'bg-[#0f203a] text-white':''}`}>{n}</button>)}</div></div>
        </div>
        <div className="px-4 py-3 border-b flex items-center gap-2 shrink-0"><div className="text-[9px] font-semibold">{filtered.length} uygun ürün</div><div className="text-[8px] opacity-40">· {selected.size} seçili</div><button onClick={allFilteredSelected ? clearFiltered : selectFiltered} className="ml-auto h-8 px-3 border text-[8px] uppercase">{allFilteredSelected ? 'Filtrelenenleri bırak' : 'Filtrelenenleri seç'}</button><button onClick={()=>addSelected(filtered)} disabled={!filtered.length} className="h-8 px-4 bg-[#0f203a] text-white text-[8px] uppercase disabled:opacity-30">Filtrelenenleri Ekle ({filtered.length})</button><button onClick={()=>addSelected(products.filter(p=>!used.has(p.id)))} className="h-8 px-4 border text-[8px] uppercase">Tüm Ürünleri Ekle</button></div>
        <div className="flex-1 overflow-auto p-4"><div className="grid grid-cols-3 gap-2">{filtered.map(p=><button key={p.id} onClick={()=>toggle(p.id)} className={`relative text-left border p-2 bg-white ${selected.has(p.id)?'border-[#0f203a] ring-1 ring-[#0f203a]':'border-[#0f203a]/10 hover:border-[#0f203a]/35'}`}><div className="absolute right-2 top-2 w-5 h-5 border bg-white flex items-center justify-center">{selected.has(p.id)&&<Check size={13}/>}</div><div className="h-28 bg-[#fafafa] mb-2" style={{backgroundImage:p.images?.[0]?`url(${p.images[0]})`:undefined,backgroundSize:'contain',backgroundPosition:'center',backgroundRepeat:'no-repeat'}}/><div className="text-[9px] font-semibold truncate pr-6">{p.name}</div><div className="text-[8px] opacity-45 mt-1">{p.sku}{p.karat ? ` · ${p.karat}K` : ''}</div><div className="text-[8px] opacity-45 truncate">{p.category}</div></button>)}</div>{!filtered.length&&<div className="h-full flex items-center justify-center text-[10px] opacity-45">Bu filtrelerle eklenebilecek ürün bulunamadı.</div>}</div>
        <footer className="h-14 border-t px-4 flex items-center gap-2 shrink-0"><div className="text-[9px] opacity-55">{selectedProducts.length} ürün seçildi</div><button onClick={()=>setSelected(new Set())} disabled={!selected.size} className="ml-auto h-9 px-3 border text-[8px] uppercase disabled:opacity-30">Seçimi Temizle</button><button onClick={()=>addSelected(selectedProducts)} disabled={!selectedProducts.length||!page} className="h-9 px-5 bg-[#0f203a] text-white text-[8px] uppercase disabled:opacity-30">Seçilenleri Ekle ({selectedProducts.length})</button></footer>
      </div>
    </div>}
  </>;
}
