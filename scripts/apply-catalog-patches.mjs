import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s);

{
 const f='src/components/studio/CatalogStudioFinal.tsx'; let s=read(f);
 s=s.replace('function buildBlocks(layout:LayoutId,ids:string[],preset?:GridPreset):PageBlock[]','export function buildBlocks(layout:LayoutId,ids:string[],preset?:GridPreset):PageBlock[]');

 const helper=` const applyLayoutToPage=(sourcePages:Page[],pageIndex:number,layout:LayoutId,preset:GridPreset):Page[]=>{
  const result=sourcePages.map(p=>({...p,content:{...p.content,blocks:(p.content.blocks||[]).map(b=>({...b}))}}));
  if(pageIndex<0||pageIndex>=result.length)return result;
  const selected=result[pageIndex];
  const selectedIds=getProductIds(selected);
  const cap=capacity(layout,preset);
  const head=selectedIds.slice(0,cap);
  let overflow=selectedIds.slice(cap);
  result[pageIndex]={...replaceProductIds(selected,head,layout,preset),style:{...(selected.style||{}),gridPreset:preset}};
  let cursor=pageIndex+1;
  while(overflow.length){
   if(cursor<result.length){
    const target=result[cursor];
    const targetIds=getProductIds(target);
    const targetPreset=((target.style as any)?.gridPreset||12) as GridPreset;
    const targetCap=capacity(target.layoutId,targetPreset);
    const combined=[...targetIds,...overflow];
    const keep=combined.slice(0,targetCap);
    overflow=combined.slice(targetCap);
    result[cursor]={...replaceProductIds(target,keep,target.layoutId,targetPreset),style:{...(target.style||{}),gridPreset:targetPreset}};
    cursor++;
   }else{
    const template=result[result.length-1]||selected;
    const newLayout=template.layoutId;
    const newPreset=((template.style as any)?.gridPreset||12) as GridPreset;
    const newIds=overflow.slice(0,capacity(newLayout,newPreset));
    overflow=overflow.slice(newIds.length);
    const np={id:uid(),catalogId:template.catalogId,order:result.length,layoutId:newLayout,title:\`Page \${result.length+1}\`,style:{...(template.style||{}),gridPreset:newPreset},content:{blocks:[],productIds:[]}} as Page;
    result.push(replaceProductIds(np,newIds,newLayout,newPreset));
    cursor++;
   }
  }
  return result.map((p,i)=>({...p,order:i}));
 };
`;
 const helperMarker=' const selectLayout=(layout:LayoutId)=>{';
 if(!s.includes('const applyLayoutToPage='))s=s.replace(helperMarker,helper+helperMarker);

 // Replace the old global reflow handlers by slicing only the handler region.
 const selStart=s.indexOf(' const selectLayout=');
 const addStart=s.indexOf(' const addMany=',selStart);
 if(selStart>=0&&addStart>selStart){
  const handlers=` const selectLayout=(layout:LayoutId)=>{const index=pages.findIndex(p=>p.id===page.id);const next=applyLayoutToPage(pages,index,layout,gridPreset);updatePages(next);setSelectedPageId(page.id);setSelectedBlockId(undefined);setNotice(\`${'${layoutNames[layout]}'} seçildi · yalnızca seçili sayfa değiştirildi\`);setTimeout(()=>setNotice(''),1800)};
 const applyClassic=()=>{const index=pages.findIndex(p=>p.id===page.id);const next=applyLayoutToPage(pages,index,'LAYOUT_C_PRODUCT_GRID',gridPreset);updatePages(next);setSelectedPageId(page.id);setSelectedBlockId(undefined);setNotice(\`${'${gridPreset}'}’li klasik grid yalnızca seçili sayfaya uygulandı\`);setTimeout(()=>setNotice(''),1800)};
`;
  s=s.slice(0,selStart)+handlers+s.slice(addStart);
 }
 write(f,s);
}

{
 const f='src/components/studio/CatalogStudioEnhanced.tsx'; let s=read(f);
 const start=s.indexOf('function rebalancePages(');
 const end=s.indexOf('\nexport function CatalogStudioEnhanced',start);
 if(start>=0&&end>start){
  const fn=`function rebalancePages(previous:Page[],next:Page[]):Page[]{
   const changedIndex=next.findIndex(np=>{const pp=previous.find(p=>p.id===np.id);return !!pp&&(pp.layoutId!==np.layoutId||((np.style as any)?.gridPreset!==(pp.style as any)?.gridPreset));});
   if(changedIndex>=0)return next.map(cleanBlocks).map((p,i)=>({...p,order:i}));
   const prevAll=unique(previous.flatMap(productIdsOf));
   const nextAll=unique(next.flatMap(productIdsOf));
   if(nextAll.length<=prevAll.length)return next.map(cleanBlocks).map((p,i)=>({...p,order:i}));
   const result=next.map(cleanBlocks);
   const additions=nextAll.filter(id=>!prevAll.includes(id));
   for(const id of additions){
     let placed=false;
     for(let i=0;i<result.length;i++){
       const p=result[i];
       const preset=((p.style as any)?.gridPreset||12) as number;
       const cap=p.layoutId==='LAYOUT_C_PRODUCT_GRID'?preset:p.layoutId==='LAYOUT_M_PRODUCT_GRID_12'?12:p.layoutId==='LAYOUT_N_PRODUCT_GRID_16'?16:p.layoutId==='LAYOUT_D_ASYMMETRIC'?3:p.layoutId==='LAYOUT_O_EDITORIAL_COLLAGE'?4:p.layoutId==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:p.layoutId==='LAYOUT_S_MAGAZINE'?2:1;
       const ids=productIdsOf(p);
       if(ids.length<cap){const nextIds=[...ids,id];result[i]={...p,content:{...p.content,productIds:nextIds,blocks:buildBlocks(p.layoutId,nextIds,preset as any)}};placed=true;break;}
     }
     if(!placed){const template=result[result.length-1]||next[0];const layout=(template?.layoutId||'LAYOUT_C_PRODUCT_GRID') as LayoutId;const preset=((template?.style as any)?.gridPreset||12) as any;result.push({id:crypto.randomUUID(),catalogId:template?.catalogId||next[0]?.catalogId,order:result.length,layoutId:layout,title:'Page '+(result.length+1),style:{...(template?.style||{}),gridPreset:preset},content:{productIds:[id],blocks:buildBlocks(layout,[id],preset)}} as Page);}
   }
   return result.map((p,i)=>({...p,order:i}));
 }
`;
  s=s.slice(0,start)+fn+s.slice(end);
 }
 if(!s.includes("CatalogStudioFinal, buildBlocks"))s=s.replace("import { CatalogStudioFinal } from './CatalogStudioFinal';","import { CatalogStudioFinal, buildBlocks } from './CatalogStudioFinal';");
 write(f,s);
}

{
 const f='src/types.ts'; let s=read(f);
 if(!s.includes('headerWidth?:number'))s=s.replace('gridLocked?:boolean;}','gridLocked?:boolean;headerWidth?:number;headerHeight?:number;footerWidth?:number;footerHeight?:number;gridGapHorizontal?:number;gridGapVertical?:number;gridInsetLeft?:number;gridInsetRight?:number;gridInsetTop?:number;gridInsetBottom?:number;}');
 write(f,s);
}
console.log('VENTA Catalog Studio: page-local layout behavior and independent page model applied');
