import React from 'react';
import { Catalog, Page } from '../../types';
import { CatalogStudioFinal } from './CatalogStudioFinal';
import { ProductSelectionPanelV2 } from './ProductSelectionPanelV2';

type Props=React.ComponentProps<typeof CatalogStudioFinal>&{collections?:{id:string;name:string}[];categories?:{id:string;name:string}[]};
const clonePages=(pages:Page[])=>pages.map(p=>({...p,content:{...p.content,blocks:[...(p.content.blocks||[])]}}));
const idsOf=(p:Page)=>{const ids=(p.content?.blocks||[]).filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!);return ids.length?ids:(p.content?.productIds||[])};
const sameIds=(a:Page,b:Page)=>{const x=idsOf(a),y=idsOf(b);return x.length===y.length&&x.every((v,i)=>v===y[i]);};
export function CatalogStudioGuard(props:Props){
 const [pages,setPages]=React.useState<Page[]>(props.pages); const [lastPages,setLastPages]=React.useState<Page[]|null>(null);
 React.useEffect(()=>setPages(props.pages),[props.pages]);
 const commit=(incoming:Page[])=>{
   const old=pages; const firstChanged=old.findIndex((p,i)=>{const n=incoming[i];return !n||p.id!==n.id||p.layoutId!==n.layoutId||!sameIds(p,n)});
   let next=incoming;
   if(firstChanged>=0){
     const changed=old[firstChanged]; const candidate=incoming[firstChanged]; const oldAll=new Set(old.flatMap(idsOf)); const newIds=Array.from(new Set(incoming.flatMap(idsOf).filter(id=>!oldAll.has(id))));
     const targetIds=Array.from(new Set([...idsOf(changed),...newIds]));
     const layout=candidate?.layoutId||changed.layoutId;
     const cap=layout==='LAYOUT_C_PRODUCT_GRID'?12:layout==='LAYOUT_M_PRODUCT_GRID_12'?12:layout==='LAYOUT_N_PRODUCT_GRID_16'?16:layout==='LAYOUT_D_ASYMMETRIC'?3:layout==='LAYOUT_O_EDITORIAL_COLLAGE'?4:layout==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:layout==='LAYOUT_S_MAGAZINE'?2:1;
     const operationCount=Math.max(1,Math.ceil(targetIds.length/cap));
     const operationPages=incoming.slice(firstChanged,firstChanged+operationCount).map((p,i)=>i===0?p:{...p,id:crypto.randomUUID(),title:`Page ${firstChanged+i+1}`});
     next=[...old.slice(0,firstChanged),...operationPages,...old.slice(firstChanged+1)];
   }
   setLastPages(clonePages(old));setPages(next);props.onReplacePages?.(next);
 };
 const updatePage=(page:Page)=>{setPages(x=>x.map(p=>p.id===page.id?page:p));props.onUpdatePage(page)};
 const undo=()=>{if(!lastPages)return;setPages(lastPages);props.onReplacePages?.(lastPages);setLastPages(null)};
 return <div className="relative w-full h-full"><CatalogStudioFinal {...props} pages={pages} onUpdatePage={updatePage} onReplacePages={commit}/><button onClick={undo} disabled={!lastPages} className="fixed left-[190px] bottom-5 z-[85] h-10 px-4 bg-white border border-[#0f203a]/15 shadow-lg text-[9px] uppercase tracking-[.12em] disabled:opacity-30">Geri Al</button><ProductSelectionPanelV2 catalog={props.catalog} pages={pages} products={props.products} collections={props.collections} categories={props.categories} onReplacePages={commit}/></div>;
}
