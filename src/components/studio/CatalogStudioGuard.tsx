import React from 'react';
import { Catalog, Page } from '../../types';
import { CatalogStudioFinal } from './CatalogStudioFinal';
import { ProductSelectionPanelV2 } from './ProductSelectionPanelV2';

type Props=React.ComponentProps<typeof CatalogStudioFinal>&{collections?:{id:string;name:string}[];categories?:{id:string;name:string}[]};
const clonePages=(pages:Page[])=>pages.map(p=>({...p,content:{...p.content,blocks:(p.content.blocks||[]).map(b=>({...b,productInfo:b.productInfo?{...b.productInfo}:undefined}))}});
const idsOf=(p:Page)=>{const ids=(p.content?.blocks||[]).filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!);return ids.length?ids:(p.content?.productIds||[])};
const sameIds=(a:Page,b:Page)=>{const x=idsOf(a),y=idsOf(b);return x.length===y.length&&x.every((v,i)=>v===y[i]);};
const uid=()=>crypto.randomUUID();
export function CatalogStudioGuard(props:Props){
 const [pages,setPages]=React.useState<Page[]>(props.pages); const [lastPages,setLastPages]=React.useState<Page[]|null>(null);
 React.useEffect(()=>setPages(props.pages),[props.pages]);
 const commit=(incoming:Page[])=>{
   const old=pages;
   let next=incoming;
   const firstChanged=old.findIndex((p,i)=>{const n=incoming[i];return !n||p.id!==n.id||p.layoutId!==n.layoutId||!sameIds(p,n)});
   if(firstChanged>=0){
     const changed=old[firstChanged];
     const candidate=incoming[firstChanged];
     const oldAll=new Set(old.flatMap(idsOf));
     const incomingAll=incoming.flatMap(idsOf);
     const newIds=incomingAll.filter(id=>!oldAll.has(id));
     const targetIds=Array.from(new Set([...idsOf(changed),...newIds]));
     const layout=candidate?.layoutId||changed.layoutId;
     const grid=(candidate?.layoutId==='LAYOUT_C_PRODUCT_GRID'?12:12) as 6|9|12|16|20;
     const cap=layout==='LAYOUT_C_PRODUCT_GRID'?grid:layout==='LAYOUT_M_PRODUCT_GRID_12'?12:layout==='LAYOUT_N_PRODUCT_GRID_16'?16:layout==='LAYOUT_D_ASYMMETRIC'?3:layout==='LAYOUT_O_EDITORIAL_COLLAGE'?4:layout==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:layout==='LAYOUT_S_MAGAZINE'?2:1;
     const build=(base:Page,ids:string[])=>{const cols=cap===1?1:cap===2?2:cap===3?3:cap===4?4:cap===5?5:4;const blocks=ids.slice(0,cap).map((productId,i)=>({id:`safe-${uid()}`,type:'frame' as const,x:cap===1?5:5+(i%cols)*((90-(cols-1)*2)/cols+2),y:cap===1?5:12+Math.floor(i/cols)*((82-(Math.ceil(cap/cols)-1)*2)/Math.ceil(cap/cols)+2),width:cap===1?90:(90-(cols-1)*2)/cols,height:cap===1?85:(82-(Math.ceil(cap/cols)-1)*2)/Math.ceil(cap/cols),zIndex:10,frameKind:'product' as const,productId,borderWidth:1,borderRadius:0,borderColor:'#d5dbe3',objectFit:'contain' as const,fitMode:'contain' as const,imageScale:1,imagePositionX:50,imagePositionY:50,locked:true}));return {...base,layoutId:layout,content:{...base.content,productIds:ids,blocks}}};
     const rebuilt:Page[]=[]; for(let i=0;i<targetIds.length;i+=cap) rebuilt.push(build(i===0?changed:{id:uid(),catalogId:changed.catalogId,order:firstChanged+rebuilt.length,layoutId:layout,title:`Page ${firstChanged+rebuilt.length+1}`,content:{blocks:[]}},targetIds.slice(i,i+cap)));
     next=[...old.slice(0,firstChanged),...rebuilt,...old.slice(firstChanged+1)];
   }
   setLastPages(clonePages(old));setPages(next);props.onReplacePages?.(next);
 };
 const updatePage=(page:Page)=>{setPages(x=>x.map(p=>p.id===page.id?page:p));props.onUpdatePage(page)};
 const undo=()=>{if(!lastPages)return;setPages(lastPages);props.onReplacePages?.(lastPages);setLastPages(null)};
 return <div className="relative w-full h-full"><CatalogStudioFinal {...props} pages={pages} onUpdatePage={updatePage} onReplacePages={commit}/><button onClick={undo} disabled={!lastPages} className="fixed left-[190px] bottom-5 z-[85] h-10 px-4 bg-white border border-[#0f203a]/15 shadow-lg text-[9px] uppercase tracking-[.12em] disabled:opacity-30">Geri Al</button><ProductSelectionPanelV2 catalog={props.catalog} pages={pages} products={props.products} collections={props.collections} categories={props.categories} onReplacePages={commit}/></div>;
}
