import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s);
{
 const f='src/components/studio/CatalogStudioFinal.tsx'; let s=read(f);
 const makeRe=/const makeChunkPage=\(base:Page,ids:string\[\],layout:LayoutId,preset:GridPreset\):Page=>replaceProductIds\([\s\S]*?\n const reflowFrom=/;
 const makeNew="const makeChunkPage=(base:Page,ids:string[],layout:LayoutId,preset:GridPreset):Page=>{const next=replaceProductIds({...base,id:base.id,content:{...base.content},title:base.title},ids,layout,preset);const catalogInfo=catalog.settings?.productInfoDefaults||infoDefaults;return {...next,content:{...next.content,blocks:(next.content.blocks||[]).map(b=>b.frameKind==='product'?{...b,productInfo:{...infoDefaults,...catalogInfo}}:b)}}};\n const reflowFrom=";
 s=s.replace(makeRe,makeNew);
 const reflowRe=/const reflowFrom=\(startIndex:number,ids:string\[\],layout:LayoutId,preset:GridPreset,sourcePages=pages\):Page\[\]=>\{[\s\S]*?\n const selectLayout=/;
 const reflowNew="const reflowFrom=(startIndex:number,ids:string[],layout:LayoutId,preset:GridPreset,sourcePages=pages):Page[]=>{const cap=capacity(layout,preset);const prefix=sourcePages.slice(0,startIndex);const tail=sourcePages.slice(startIndex+1);const current=sourcePages[startIndex]||{id:uid(),catalogId:catalog.id,order:startIndex,layoutId:layout,title:'Page '+(startIndex+1),content:{blocks:[]}};const count=Math.max(1,Math.ceil(ids.length/cap));const inserted:Page[]=[];for(let i=0;i<count;i++){const base=i===0?current:{id:uid(),catalogId:catalog.id,order:startIndex+i,layoutId:layout,title:'Page '+(startIndex+i+1),content:{blocks:[]}};inserted.push(makeChunkPage(base,ids.slice(i*cap,(i+1)*cap),layout,preset));}return [...prefix,...inserted,...tail].map((p,i)=>({...p,order:i}));};\n const selectLayout=";
 s=s.replace(reflowRe,reflowNew);
 const applyRe=/ const applyClassic=\(\)=>\{[\s\S]*?\};\n const addMany=/;
 const applyNew=" const applyClassicPreset=(preset:GridPreset)=>{const start=Math.max(0,pages.findIndex(p=>p.id===page.id));const ids=getProductIds(page);const next=reflowFrom(start,ids,'LAYOUT_C_PRODUCT_GRID',preset,pages);updatePages(next);setGridPreset(preset);setSelectedPageId(next[start]?.id||page.id);setSelectedBlockId(undefined);setNotice(`${preset}’li klasik grid uygulandı`);setTimeout(()=>setNotice(''),1800)}; const applyClassic=()=>applyClassicPreset(gridPreset);\n const addMany=";
 s=s.replace(applyRe,applyNew);
 const presetButtonRe=/onClick=\{\(\)=>setGridPreset\(n\)\}/g;
 s=s.replace(presetButtonRe,"onClick={()=>applyClassicPreset(n)}");
 write(f,s);
}
{
 const f='src/components/studio/CatalogStudioEnhanced.tsx'; let s=read(f);
 s=s.replace("x:6,y:1,width:88,height:4,zIndex:100,alt:s.headerText||'VENTA JEWELRY',fontFamily:'Arial, sans-serif',fontSize:6,fontStyle:'normal',textAlign:'center'","x:s.headerPosition==='left'?4:s.headerPosition==='right'?80:42,y:1,width:16,height:4,zIndex:100,alt:s.headerText||'VENTA JEWELRY',fontFamily:'Arial, sans-serif',fontSize:6,fontStyle:'normal',textAlign:s.headerPosition||'center'");
 s=s.replace("x:6,y:96,width:88,height:4,zIndex:100,alt:s.footerText||'VENTA JEWELRY',fontFamily:'Arial, sans-serif',fontSize:6,fontStyle:'normal',textAlign:'center'","x:s.footerPosition==='left'?4:s.footerPosition==='right'?80:42,y:96,width:16,height:4,zIndex:100,alt:s.footerText||'VENTA JEWELRY',fontFamily:'Arial, sans-serif',fontSize:6,fontStyle:'normal',textAlign:s.footerPosition||'center'");
 write(f,s);
}
console.log('VENTA Catalog Studio: pagination, header/footer and direct grid preset patches applied');
