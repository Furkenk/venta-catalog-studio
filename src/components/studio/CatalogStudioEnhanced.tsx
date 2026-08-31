import React from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { Catalog, Page, Product, LayoutId } from '../../types';
import { CatalogStudioFinal } from './CatalogStudioFinal';
import { ProductSelectionPanel } from './ProductSelectionPanel';

interface Props {
  catalog: Catalog;
  pages: Page[];
  products: Product[];
  collections?: {id:string;name:string}[];
  categories?: {id:string;name:string}[];
  onUpdatePage:(p:Page)=>void;
  onUpdateCatalog:(u:Partial<Catalog>)=>void;
  onAddPage:()=>void;
  onDeletePage:(id:string)=>void;
  onDuplicatePage?:(id:string)=>void;
  onReplacePages?:(pages:Page[])=>void;
  onExit:()=>void;
  canPublish?:boolean;
  onPublish?:()=>Promise<void>|void;
  onPreview?:()=>void;
}

const cleanPage=(page:Page):Page=>({
  ...page,
  content:{...page.content,blocks:(page.content.blocks||[]).filter(b=>!b.id.startsWith('__'))}
});

const layouts: {id:LayoutId; name:string; products:number}[] = [
  {id:'COVER',name:'Kapak',products:1},
  {id:'LAYOUT_B_HERO_PRODUCT',name:'Hero Ürün',products:1},
  {id:'LAYOUT_D_ASYMMETRIC',name:'Asimetrik Editorial',products:3},
  {id:'LAYOUT_C_PRODUCT_GRID',name:'Klasik Grid',products:12},
  {id:'LAYOUT_M_PRODUCT_GRID_12',name:'12’li Grid',products:12},
  {id:'LAYOUT_N_PRODUCT_GRID_16',name:'16’lı Grid',products:16},
  {id:'LAYOUT_O_EDITORIAL_COLLAGE',name:'Editorial Kolaj',products:4},
  {id:'LAYOUT_P_IMAGE_4_PRODUCTS',name:'4 Ürün Editorial',products:5},
  {id:'LAYOUT_Q_SPLIT_EDITORIAL',name:'Split Editorial',products:1},
  {id:'LAYOUT_S_MAGAZINE',name:'Magazine Spread',products:2}
];

function productIds(page:Page){
  const fromBlocks=(page.content?.blocks||[]).filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!);
  return fromBlocks.length ? fromBlocks : (page.content?.productIds||[]);
}

export function CatalogStudioEnhanced(props:Props){
  const [showLayouts,setShowLayouts]=React.useState(true);
  const [lastPages,setLastPages]=React.useState<Page[]|null>(null);
  const [undoLabel,setUndoLabel]=React.useState('');
  const previousRef=React.useRef<Page[]|null>(null);

  const handleReplacePages=(next:Page[])=>{
    previousRef.current=props.pages.map(p=>({...p,content:{...p.content,blocks:[...(p.content.blocks||[])]}}));
    setLastPages(previousRef.current);
    setUndoLabel('Son işlemi geri al');
    props.onReplacePages?.(next.map((p,i)=>({...cleanPage(p),order:i})));
  };

  const handleUndo=()=>{
    if(!lastPages || !props.onReplacePages) return;
    props.onReplacePages(lastPages.map((p,i)=>({...cleanPage(p),order:i})));
    setLastPages(null);
    previousRef.current=null;
    setUndoLabel('');
  };

  const changeLayout=(layout:LayoutId)=>{
    const page=props.pages[0];
    if(!page) return;
    const next=props.pages.map((p,i)=>p.id===page.id?{...p,layoutId:layout,content:{...p.content,blocks:[]}}:{...p});
    handleReplacePages(next);
  };

  return <div className="relative h-full">
    <CatalogStudioFinal
      {...props}
      onReplacePages={handleReplacePages}
      onUpdatePage={p=>props.onUpdatePage(cleanPage(p))}
    />

    <div className="fixed right-0 top-0 bottom-0 w-[300px] z-[80] bg-white border-l border-[#0f203a]/10 shadow-xl flex flex-col">
      <div className="h-14 px-4 border-b flex items-center justify-between">
        <div><div className="text-[8px] uppercase tracking-[.2em] opacity-45">Catalog Studio</div><div className="text-sm font-semibold">Layout</div></div>
        <button onClick={()=>setShowLayouts(v=>!v)} className="text-[8px] uppercase border px-2 py-1">{showLayouts?'Kapat':'Aç'}</button>
      </div>
      {showLayouts && <div className="flex-1 overflow-auto p-3 space-y-2">
        {layouts.map(l=>{
          const active=props.pages[0]?.layoutId===l.id;
          return <button key={l.id} onClick={()=>changeLayout(l.id)} className={`w-full text-left border p-3 transition ${active?'border-[#0f203a] bg-[#f5f7fa]':'border-[#0f203a]/10 hover:border-[#0f203a]/35'}`}>
            <div className="text-[10px] font-semibold">{l.name}</div>
            <div className="text-[8px] opacity-45 mt-1">{l.products} ürün kapasitesi</div>
          </button>;
        })}
      </div>}
      {lastPages && <div className="p-3 border-t"><button onClick={handleUndo} className="w-full h-10 bg-[#0f203a] text-white flex items-center justify-center gap-2 text-[9px] uppercase tracking-[.12em]"><Undo2 size={14}/> {undoLabel}</button></div>}
    </div>

    <button onClick={handleUndo} disabled={!lastPages} className="fixed right-[315px] bottom-5 z-[86] h-10 px-4 bg-white border border-[#0f203a]/15 shadow-lg flex items-center gap-2 text-[9px] uppercase disabled:opacity-30"><RotateCcw size={14}/> Geri Al</button>

    <ProductSelectionPanel
      catalog={props.catalog}
      pages={props.pages}
      products={props.products}
      collections={props.collections}
      categories={props.categories}
      onReplacePages={handleReplacePages}
    />
  </div>;
}
