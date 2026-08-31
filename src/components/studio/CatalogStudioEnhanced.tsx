import React from 'react';
import { Catalog, Page, Product } from '../../types';
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
  content:{
    ...page.content,
    blocks:(page.content.blocks||[]).filter(b=>!b.id.startsWith('__'))
  }
});

export function CatalogStudioEnhanced(props:Props){
  const handleReplacePages=(next:Page[])=>{
    // Do not rebuild or partially restore pages here. CatalogStudioFinal already
    // performs the complete layout reflow and ProductSelectionPanel already
    // produces the complete page set. Intercepting that result was causing
    // layout changes to be reverted/duplicated.
    props.onReplacePages?.(next.map((p,i)=>({...cleanPage(p),order:i})));
  };

  return <div className="relative h-full">
    <CatalogStudioFinal
      {...props}
      onReplacePages={handleReplacePages}
      onUpdatePage={p=>props.onUpdatePage(cleanPage(p))}
    />
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
