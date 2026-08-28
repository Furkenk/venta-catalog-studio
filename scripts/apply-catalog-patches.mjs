import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s);
{
 const f='src/components/studio/CatalogStudioFinal.tsx'; let s=read(f);
 const makeRe=/const makeChunkPage=\(base:Page,ids:string\[\],layout:LayoutId,preset:GridPreset\):Page=>replaceProductIds\([\s\S]*?\n const reflowFrom=/;
 const makeNew="const makeChunkPage=(base:Page,ids:string[],layout:LayoutId,preset:GridPreset):Page=>{const next=replaceProductIds({...base,id:base.id,content:{...base.content},title:base.title},ids,layout,preset);const catalogInfo=catalog.settings?.productInfoDefaults||infoDefaults;return {...next,style:{...(next.style||{}),gridPreset:preset},content:{...next.content,blocks:(next.content.blocks||[]).map(b=>b.frameKind==='product'?{...b,productInfo:{...infoDefaults,...catalogInfo}}:b)}}};\n const reflowFrom=";
 s=s.replace(makeRe,makeNew);
 const reflowRe=/const reflowFrom=\(startIndex:number,ids:string\[\],layout:LayoutId,preset:GridPreset,sourcePages=pages\):Page\[\]=>\{[\s\S]*?\n const selectLayout=/;
 const reflowNew="const reflowFrom=(startIndex:number,ids:string[],layout:LayoutId,preset:GridPreset,sourcePages=pages):Page[]=>{const prefix=sourcePages.slice(0,startIndex);const tail=sourcePages.slice(startIndex+1);const current=sourcePages[startIndex]||{id:uid(),catalogId:catalog.id,order:startIndex,layoutId:layout,title:'Page '+(startIndex+1),content:{blocks:[]}};const cap=capacity(layout,preset);const count=Math.max(1,Math.ceil(ids.length/cap));const inserted:Page[]=[];for(let i=0;i<count;i++){const base=i===0?current:{id:uid(),catalogId:catalog.id,order:startIndex+i,layoutId:layout,title:'Page '+(startIndex+i+1),content:{blocks:[]}};inserted.push(makeChunkPage(base,ids.slice(i*cap,(i+1)*cap),layout,preset));}return [...prefix,...inserted,...tail].map((p,i)=>({...p,order:i}));};\n const selectLayout=";
 s=s.replace(reflowRe,reflowNew);
 const applyRe=/ const applyClassic=\(\)=>\{[\s\S]*?\};\n const addMany=/;
 const applyNew=" const applyClassicPreset=(preset:GridPreset)=>{const start=Math.max(0,pages.findIndex(p=>p.id===page.id));const ids=Array.from(new Set(pages.flatMap(p=>(p.content?.productIds||[]).concat((p.content?.blocks||[]).filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!)))));const next=reflowFrom(start,ids,'LAYOUT_C_PRODUCT_GRID',preset,pages);updatePages(next);setGridPreset(preset);setSelectedPageId(next[start]?.id||page.id);setSelectedBlockId(undefined);setNotice(`${preset}’li klasik grid uygulandı`);setTimeout(()=>setNotice(''),1800)}; const applyClassic=()=>applyClassicPreset(gridPreset);\n const addMany=";
 s=s.replace(applyRe,applyNew);
 s=s.replace(/onClick=\{\(\)=>setGridPreset\(n\)\}/g,"onClick={()=>applyClassicPreset(n)}");
 s=s.replace('function buildBlocks(layout:LayoutId,ids:string[],preset?:GridPreset):PageBlock[]','export function buildBlocks(layout:LayoutId,ids:string[],preset?:GridPreset):PageBlock[]');
 write(f,s);
}
{
 const f='src/components/studio/CatalogStudioEnhanced.tsx'; let s=read(f);
 s=s.replace("import { CatalogStudioFinal } from './CatalogStudioFinal';","import { CatalogStudioFinal, buildBlocks } from './CatalogStudioFinal';");
 s=s.replace("const productIdsOf=(p:Page)=>((p.content.blocks||[]).filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!)||[]);","const productIdsOf=(p:Page)=>Array.from(new Set([...(p.content?.productIds||[]),...((p.content?.blocks||[]).filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!)||[])]));");
 const start=s.indexOf('function rebalancePages(');
 const end=s.indexOf('\nexport function CatalogStudioEnhanced',start);
 if(start>=0&&end>start){
  const fn=`function rebalancePages(previous:Page[],next:Page[]):Page[]{
 const prevAll=unique(previous.flatMap(productIdsOf));
 const nextAll=unique(next.flatMap(productIdsOf));
 const changed=next.findIndex(np=>{const pp=previous.find(p=>p.id===np.id);return !!pp&&(pp.layoutId!==np.layoutId||((np.style as any)?.gridPreset!==(pp.style as any)?.gridPreset));});
 const added=nextAll.length>prevAll.length;
 if(changed<0&&!added)return next.map(cleanBlocks).map((p,i)=>({...p,order:i}));
 const startIndex=changed>=0?changed:Math.max(0,next.findIndex(p=>productIdsOf(p).length>0));
 const before=next.slice(0,startIndex).map(cleanBlocks);
 const source=next.slice(startIndex).map(cleanBlocks);
 const all=unique([...prevAll,...nextAll]);
 if(!all.length)return next.map(cleanBlocks).map((p,i)=>({...p,order:i}));
 const result=[...before];
 let offset=0;
 for(let i=0;i<source.length&&offset<all.length;i++){
   const base=source[i];
   const preset=((base.style as any)?.gridPreset||12) as 6|9|12|16|20;
   const layout=base.layoutId as LayoutId;
   const cap=layout==='LAYOUT_C_PRODUCT_GRID'?preset:(layout==='LAYOUT_M_PRODUCT_GRID_12'?12:layout==='LAYOUT_N_PRODUCT_GRID_16'?16:layout==='LAYOUT_D_ASYMMETRIC'?3:layout==='LAYOUT_O_EDITORIAL_COLLAGE'?4:layout==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:layout==='LAYOUT_S_MAGAZINE'?2:1);
   const ids=all.slice(offset,offset+cap); offset+=ids.length;
   const generated=buildBlocks(layout,ids,preset);
   const custom=(base.content.blocks||[]).filter(b=>b.frameKind!=='product'&&!b.id.startsWith('__'));
   result.push({...base,content:{...base.content,productIds:ids,blocks:[...custom,...generated]}});
 }
 if(offset<all.length){
   const template=source[source.length-1]||next[next.length-1];
   const preset=((template?.style as any)?.gridPreset||12) as 6|9|12|16|20;
   const layout=(template?.layoutId||'LAYOUT_C_PRODUCT_GRID') as LayoutId;
   const cap=layout==='LAYOUT_C_PRODUCT_GRID'?preset:(layout==='LAYOUT_M_PRODUCT_GRID_12'?12:layout==='LAYOUT_N_PRODUCT_GRID_16'?16:layout==='LAYOUT_D_ASYMMETRIC'?3:layout==='LAYOUT_O_EDITORIAL_COLLAGE'?4:layout==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:layout==='LAYOUT_S_MAGAZINE'?2:1);
   while(offset<all.length){
     const ids=all.slice(offset,offset+cap); offset+=ids.length;
     const generated=buildBlocks(layout,ids,preset);
     result.push({id:crypto.randomUUID(),catalogId:template?.catalogId||next[0]?.catalogId,order:result.length,layoutId:layout,title:'Page '+(result.length+1),style:{...(template?.style||{}),gridPreset:preset},content:{productIds:ids,blocks:generated}} as Page);
   }
 }
 return result.map((p,i)=>({...p,order:i}));
}`;
  s=s.slice(0,start)+fn+s.slice(end);
 }
 s=s.replace("x:6,y:1,width:88,height:4,zIndex:100,alt:s.headerText||'VENTA JEWELRY',fontFamily:'Arial, sans-serif',fontSize:6,fontStyle:'normal',textAlign:'center'","x:s.headerPosition==='left'?4:s.headerPosition==='right'?80:42,y:1,width:16,height:4,zIndex:100,alt:s.headerText||'VENTA JEWELRY',fontFamily:'Arial, sans-serif',fontSize:6,fontStyle:'normal',textAlign:s.headerPosition||'center'");
 s=s.replace("x:6,y:96,width:88,height:4,zIndex:100,alt:s.footerText||'VENTA JEWELRY',fontFamily:'Arial, sans-serif',fontSize:6,fontStyle:'normal',textAlign:'center'","x:s.footerPosition==='left'?4:s.footerPosition==='right'?80:42,y:96,width:16,height:4,zIndex:100,alt:s.footerText||'VENTA JEWELRY',fontFamily:'Arial, sans-serif',fontSize:6,fontStyle:'normal',textAlign:s.footerPosition||'center'");
 write(f,s);
}
console.log('VENTA Catalog Studio: full product-id pagination, generated frames, and independent page layouts');
