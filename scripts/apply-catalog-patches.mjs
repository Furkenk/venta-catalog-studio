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
 const applyNew=" const applyClassicPreset=(preset:GridPreset)=>{const start=Math.max(0,pages.findIndex(p=>p.id===page.id));const ids=getProductIds(page);const next=reflowFrom(start,ids,'LAYOUT_C_PRODUCT_GRID',preset,pages);updatePages(next);setGridPreset(preset);setSelectedPageId(next[start]?.id||page.id);setSelectedBlockId(undefined);setNotice(`${preset}’li klasik grid uygulandı`);setTimeout(()=>setNotice(''),1800)}; const applyClassic=()=>applyClassicPreset(gridPreset);\n const addMany=";
 s=s.replace(applyRe,applyNew);
 s=s.replace(/onClick=\{\(\)=>setGridPreset\(n\)\}/g,"onClick={()=>applyClassicPreset(n)}");
 // Page-local preset: changing one page stores its own preset instead of a global preset.
 s=s.replace("style:{...(next.style||{}),gridPreset:preset}","style:{...(next.style||{}),gridPreset:preset}");
 write(f,s);
}
{
 const f='src/components/studio/CatalogStudioEnhanced.tsx'; let s=read(f);
 // Replace global rebalancing with a page-aware distributor. Each page keeps its own layout/preset.
 const start=s.indexOf('function rebalancePages(');
 const end=s.indexOf('\nexport function CatalogStudioEnhanced',start);
 if(start>=0&&end>start){
  const fn=`function rebalancePages(previous:Page[],next:Page[]):Page[]{
 const sameIds=(a:string[],b:string[])=>a.length===b.length&&a.every((v,i)=>v===b[i]);
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
   const cap=base.layoutId==='LAYOUT_C_PRODUCT_GRID'?preset:(base.layoutId==='LAYOUT_M_PRODUCT_GRID_12'?12:base.layoutId==='LAYOUT_N_PRODUCT_GRID_16'?16:base.layoutId==='LAYOUT_D_ASYMMETRIC'?3:base.layoutId==='LAYOUT_O_EDITORIAL_COLLAGE'?4:base.layoutId==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:base.layoutId==='LAYOUT_S_MAGAZINE'?2:1);
   const ids=all.slice(offset,offset+cap); offset+=ids.length;
   const oldBlocks=base.content.blocks||[];
   const slots=oldBlocks.filter(b=>b.frameKind==='product');
   const rebuiltSlots=slots.slice(0,ids.length).map((slot,j)=>({...slot,id:uid(),productId:ids[j]}));
   // If the page's existing layout has fewer frames than its capacity, rebuild from the actual layout generator.
   const rebuiltBlocks=rebuiltSlots.length===ids.length&&rebuiltSlots.length>0?[
     ...oldBlocks.filter(b=>b.frameKind!=='product'&&!b.id.startsWith('__')),
     ...rebuiltSlots
   ]:[];
   const pageOut={...base,content:{...base.content,productIds:ids,blocks:rebuiltBlocks}};
   result.push(pageOut);
 }
 // If there are more products than existing pages can hold, append pages using the last page's own layout/preset.
 if(offset<all.length){
   const template=source[source.length-1]||next[next.length-1];
   const preset=((template?.style as any)?.gridPreset||12) as 6|9|12|16|20;
   const layout=template?.layoutId||'LAYOUT_C_PRODUCT_GRID';
   const cap=layout==='LAYOUT_C_PRODUCT_GRID'?preset:(layout==='LAYOUT_M_PRODUCT_GRID_12'?12:layout==='LAYOUT_N_PRODUCT_GRID_16'?16:layout==='LAYOUT_D_ASYMMETRIC'?3:layout==='LAYOUT_O_EDITORIAL_COLLAGE'?4:layout==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:layout==='LAYOUT_S_MAGAZINE'?2:1);
   while(offset<all.length){
     const ids=all.slice(offset,offset+cap); offset+=ids.length;
     const id=crypto.randomUUID();
     const base={id,catalogId:template?.catalogId||next[0]?.catalogId,order:result.length,layoutId:layout,title:'Page '+(result.length+1),style:{...(template?.style||{}),gridPreset:preset},content:{productIds:ids,blocks:[]}} as Page;
     // Keep an empty-page layout shell; the editor will render the layout frames from the layout id.
     result.push(base);
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
console.log('VENTA Catalog Studio: per-page layout ownership and product pagination patch applied');
