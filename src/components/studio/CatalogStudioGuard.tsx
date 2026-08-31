import React from 'react';
import { Catalog, Page } from '../../types';
import { CatalogStudioFinal } from './CatalogStudioFinal';
import { ProductSelectionPanelV2 } from './ProductSelectionPanelV2';

type Props=React.ComponentProps<typeof CatalogStudioFinal>&{collections?:{id:string;name:string}[];categories?:{id:string;name:string}[]};
const clonePages=(pages:Page[])=>pages.map(p=>({...p,content:{...p.content,blocks:(p.content.blocks||[]).map(b=>({...b,productInfo:b.productInfo?{...b.productInfo}:undefined}))}}));
export function CatalogStudioGuard(props:Props){
 const [pages,setPages]=React.useState<Page[]>(props.pages); const [lastPages,setLastPages]=React.useState<Page[]|null>(null);
 React.useEffect(()=>setPages(props.pages),[props.pages]);
 const commit=(next:Page[])=>{setLastPages(clonePages(pages));setPages(next);props.onReplacePages?.(next)};
 const updatePage=(page:Page)=>{setPages(x=>x.map(p=>p.id===page.id?page:p));props.onUpdatePage(page)};
 const undo=()=>{if(!lastPages)return;setPages(lastPages);props.onReplacePages?.(lastPages);setLastPages(null)};
 return <div className="relative w-full h-full"><CatalogStudioFinal {...props} pages={pages} onUpdatePage={updatePage} onReplacePages={commit}/><button onClick={undo} disabled={!lastPages} className="fixed left-[190px] bottom-5 z-[85] h-10 px-4 bg-white border border-[#0f203a]/15 shadow-lg text-[9px] uppercase tracking-[.12em] disabled:opacity-30">Geri Al</button><ProductSelectionPanelV2 catalog={props.catalog} pages={pages} products={props.products} collections={props.collections} categories={props.categories} onReplacePages={commit}/></div>;
}
