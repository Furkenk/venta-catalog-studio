import React from 'react';
import { Undo2, X } from 'lucide-react';
import { Catalog, Page, Product, LayoutId, PageBlock } from '../../types';
import { CatalogStudioEnhanced } from './CatalogStudioEnhanced';

const layouts: {id: LayoutId; name: string; capacity: number}[] = [
 {id:'COVER',name:'Kapak',capacity:1},
 {id:'LAYOUT_B_HERO_PRODUCT',name:'Hero Ürün',capacity:1},
 {id:'LAYOUT_D_ASYMMETRIC',name:'Asimetrik Editorial',capacity:3},
 {id:'LAYOUT_C_PRODUCT_GRID',name:'Klasik Grid',capacity:12},
 {id:'LAYOUT_M_PRODUCT_GRID_12',name:'12’li Grid',capacity:12},
 {id:'LAYOUT_N_PRODUCT_GRID_16',name:'16’lı Grid',capacity:16},
 {id:'LAYOUT_O_EDITORIAL_COLLAGE',name:'Editorial Kolaj',capacity:4},
 {id:'LAYOUT_P_IMAGE_4_PRODUCTS',name:'4 Ürün Editorial',capacity:5},
 {id:'LAYOUT_Q_SPLIT_EDITORIAL',name:'Split Editorial',capacity:1},
 {id:'LAYOUT_S_MAGAZINE',name:'Magazine Spread',capacity:2},
];

type Props = React.ComponentProps<typeof CatalogStudioEnhanced>;

function productIds(p: Page) {
 const ids=(p.content?.blocks||[]).filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!);
 return ids.length?ids:(p.content?.productIds||[]);
}
function block(id:string,x:number,y:number,width:number,height:number,productId?:string):PageBlock {
 return {id,type:'frame',x,y,width,height,zIndex:10,frameKind:'product',productId,borderWidth:1,borderRadius:0,borderColor:'#d5dbe3',objectFit:'contain',fitMode:'contain',imageScale:1,imagePositionX:50,imagePositionY:50,locked:true};
}
function makeBlocks(layout:LayoutId,ids:string[]):PageBlock[] {
 const p=(i:number)=>ids[i];
 if(layout==='COVER') return [block('cover-product',7,7,86,72,p(0))];
 if(layout==='LAYOUT_B_HERO_PRODUCT') return [block('hero-product',4,4,55,88,p(0))];
 if(layout==='LAYOUT_D_ASYMMETRIC') return [block('asym-main',4,4,55,72,p(0)),block('asym-small-1',67,8,25,28,p(1)),block('asym-small-2',67,42,25,28,p(2))];
 if(layout==='LAYOUT_O_EDITORIAL_COLLAGE') return [block('collage-main',4,4,57,63,p(0)),block('collage-top',66,6,27,27,p(1)),block('collage-small-1',66,73,12,20,p(2)),block('collage-small-2',81,73,12,20,p(3))];
 if(layout==='LAYOUT_P_IMAGE_4_PRODUCTS') return [block('p-main',4,4,42,80,p(0)),...ids.slice(1,5).map((id,i)=>block(`p-${i}`,51+(i%2)*22,7+Math.floor(i/2)*39,19,32,id))];
 if(layout==='LAYOUT_Q_SPLIT_EDITORIAL') return [block('split-main',3,3,57,94,p(0))];
 if(layout==='LAYOUT_S_MAGAZINE') return [block('mag-main',4,7,58,68,p(0)),block('mag-small',68,8,25,27,p(1))];
 const count=layout==='LAYOUT_N_PRODUCT_GRID_16'?16:layout==='LAYOUT_M_PRODUCT_GRID_12'?12:Math.min(ids.length||12,12);
 const cols=count>=16?4:4, rows=Math.ceil(count/cols), gap=2, w=(90-gap*(cols-1))/cols, h=(82-gap*(rows-1))/rows;
 return ids.slice(0,count).map((id,i)=>block(`grid-${i}`,5+(i%cols)*(w+gap),12+Math.floor(i/cols)*(h+gap),w,h,id));
}

export function CatalogStudioGuard(props: Props) {
 const [pages,setPages]=React.useState(props.pages);
 const [layoutOpen,setLayoutOpen]=React.useState(false);
 const [history,setHistory]=React.useState<Page[][]>([]);
 React.useEffect(()=>setPages(props.pages),[props.pages]);
 const commit=(next:Page[])=>{setHistory(h=>[...h,pages].slice(-30));setPages(next);props.onReplacePages?.(next);};
 const updatePage=(p:Page)=>commit(pages.map(x=>x.id===p.id?p:x));
 const replacePages=(next:Page[])=>commit(next);
 const chooseLayout=(layout:LayoutId)=>{
   const page=pages[0]; if(!page)return;
   const ids=productIds(page);
   const next=pages.map((p,i)=>i===0?{...p,layoutId:layout,content:{...p.content,productIds:ids,blocks:makeBlocks(layout,ids)}}:p);
   commit(next);setLayoutOpen(false);
 };
 const undo=()=>{const previous=history[history.length-1];if(!previous)return;setHistory(h=>h.slice(0,-1));setPages(previous);props.onReplacePages?.(previous);};
 return <div className="relative w-full h-full">
   <CatalogStudioEnhanced {...props} pages={pages} onUpdatePage={updatePage} onReplacePages={replacePages}/>
   <div className="fixed right-5 top-24 z-[95] flex gap-2">
    <button onClick={undo} disabled={!history.length} title="Son işlemi geri al" className="h-10 px-3 bg-white border shadow-lg text-[#0f203a] text-[9px] uppercase tracking-[.14em] disabled:opacity-30 flex items-center gap-2"><Undo2 size={14}/> Geri Al</button>
    <button onClick={()=>setLayoutOpen(v=>!v)} className="h-10 px-4 bg-[#0f203a] text-white shadow-lg text-[9px] uppercase tracking-[.14em]">Layout</button>
   </div>
   {layoutOpen&&<div className="fixed right-5 top-36 z-[96] w-[300px] max-h-[70vh] overflow-auto bg-white border shadow-2xl p-4 text-[#0f203a]">
    <div className="flex items-center justify-between mb-3"><div><div className="text-[9px] uppercase tracking-[.2em] opacity-45">Sayfa Layout</div><div className="text-sm font-semibold">Yerleşim seç</div></div><button onClick={()=>setLayoutOpen(false)}><X size={16}/></button></div>
    <div className="grid grid-cols-2 gap-2">{layouts.map(l=><button key={l.id} onClick={()=>chooseLayout(l.id)} className="text-left border p-2 hover:border-[#0f203a]"><div className="h-20 mb-2 bg-[#f7f8fa] relative overflow-hidden"><LayoutThumb layout={l.id}/></div><div className="text-[9px] font-semibold">{l.name}</div><div className="text-[8px] opacity-45">{l.capacity} ürün / sayfa</div></button>)}</div>
   </div>}
 </div>;
}
function LayoutThumb({layout}:{layout:LayoutId}){
 if(layout==='LAYOUT_C_PRODUCT_GRID'||layout==='LAYOUT_M_PRODUCT_GRID_12'||layout==='LAYOUT_N_PRODUCT_GRID_16') return <div className="grid grid-cols-4 gap-1 p-2 h-full">{Array.from({length:12}).map((_,i)=><i key={i} className="bg-white border border-[#0f203a]/15"/>)}</div>;
 if(layout==='LAYOUT_D_ASYMMETRIC'||layout==='LAYOUT_O_EDITORIAL_COLLAGE'||layout==='LAYOUT_P_IMAGE_4_PRODUCTS') return <><i className="absolute left-2 top-2 w-1/2 h-4/5 bg-white border"/><i className="absolute right-2 top-2 w-1/4 h-1/3 bg-white border"/><i className="absolute right-2 bottom-2 w-1/4 h-1/3 bg-white border"/></>;
 if(layout==='LAYOUT_S_MAGAZINE') return <><i className="absolute left-2 top-2 w-3/5 h-4/5 bg-white border"/><i className="absolute right-2 top-2 w-1/4 h-1/3 bg-white border"/></>;
 return <i className="absolute left-3 top-2 right-3 bottom-2 bg-white border"/>;
}
