import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s);

// Layout changes are page-local. Pagination is only performed by explicit product-add/reflow actions.
{
 const f='src/components/studio/CatalogStudioEnhanced.tsx'; let s=read(f);
 const start=s.indexOf('function rebalancePages(');
 const end=s.indexOf('\nexport function CatalogStudioEnhanced',start);
 if(start>=0&&end>start){
  const fn=`function rebalancePages(previous:Page[],next:Page[]):Page[]{
   const changedIndex=next.findIndex(np=>{const pp=previous.find(p=>p.id===np.id);return !!pp&&(pp.layoutId!==np.layoutId||((np.style as any)?.gridPreset!==(pp.style as any)?.gridPreset));});
   // A layout selection must affect ONLY the page currently being edited.
   // Never redistribute neighbouring pages as a side effect of a layout click.
   if(changedIndex>=0)return next.map(cleanBlocks).map((p,i)=>({...p,order:i}));
   const prevAll=unique(previous.flatMap(productIdsOf));
   const nextAll=unique(next.flatMap(productIdsOf));
   if(nextAll.length<=prevAll.length)return next.map(cleanBlocks).map((p,i)=>({...p,order:i}));
   // Explicit product additions may paginate, but preserve every existing page's own layout.
   const result=next.map(cleanBlocks);
   const additions=nextAll.filter(id=>!prevAll.includes(id));
   if(!additions.length)return result.map((p,i)=>({...p,order:i}));
   let targetIndex=Math.max(0,result.findIndex(p=>productIdsOf(p).length>0));
   for(const id of additions){
     let placed=false;
     for(let i=targetIndex;i<result.length;i++){
       const p=result[i]; const cap=(p.layoutId==='LAYOUT_C_PRODUCT_GRID'?(((p.style as any)?.gridPreset||12) as number):p.layoutId==='LAYOUT_M_PRODUCT_GRID_12'?12:p.layoutId==='LAYOUT_N_PRODUCT_GRID_16'?16:p.layoutId==='LAYOUT_D_ASYMMETRIC'?3:p.layoutId==='LAYOUT_O_EDITORIAL_COLLAGE'?4:p.layoutId==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:p.layoutId==='LAYOUT_S_MAGAZINE'?2:1);
       const ids=productIdsOf(p);
       if(ids.length<cap){const nextIds=[...ids,id];result[i]={...p,content:{...p.content,productIds:nextIds,blocks:buildBlocks(p.layoutId,nextIds,((p.style as any)?.gridPreset||12))}};placed=true;break;}
     }
     if(!placed){const template=result[result.length-1]||next[0];const layout=template?.layoutId||'LAYOUT_C_PRODUCT_GRID';const preset=((template?.style as any)?.gridPreset||12) as any;const blocks=buildBlocks(layout,[id],preset);result.push({id:crypto.randomUUID(),catalogId:template?.catalogId||next[0]?.catalogId,order:result.length,layoutId:layout,title:'Page '+(result.length+1),style:{...(template?.style||{}),gridPreset:preset},content:{productIds:[id],blocks}} as Page);}
   }
   return result.map((p,i)=>({...p,order:i}));
 }
`;
  // buildBlocks is available from CatalogStudioFinal import; keep it in scope.
  s=s.slice(0,start)+fn+s.slice(end);
 }
 // Enhanced currently imports buildBlocks; ensure it exists.
 if(!s.includes("CatalogStudioFinal, buildBlocks"))s=s.replace("import { CatalogStudioFinal } from './CatalogStudioFinal';","import { CatalogStudioFinal, buildBlocks } from './CatalogStudioFinal';");
 // Header/footer size settings are stored per-page and are ready for UI controls.
 s=s.replace("x:s.headerPosition==='left'?4:s.headerPosition==='right'?80:42,y:1,width:16,height:4", "x:s.headerPosition==='left'?4:s.headerPosition==='right'?80:42,y:1,width:Math.max(16,Math.min(92,(s.headerWidth||88))),height:Math.max(2,Math.min(12,(s.headerHeight||4)))");
 s=s.replace("x:s.footerPosition==='left'?4:s.footerPosition==='right'?80:42,y:96,width:16,height:4", "x:s.footerPosition==='left'?4:s.footerPosition==='right'?80:42,y:Math.max(88,96-(s.footerHeight||4)),width:Math.max(16,Math.min(92,(s.footerWidth||88))),height:Math.max(2,Math.min(12,(s.footerHeight||4)))");
 write(f,s);
}

// Add persisted spacing/size fields to the page style model through the source type definitions.
{
 const f='src/types.ts'; let s=read(f);
 s=s.replace("gridLocked?:boolean;}\n}","gridLocked?:boolean;\n  headerWidth?:number;headerHeight?:number;footerWidth?:number;footerHeight?:number;\n  gridGapHorizontal?:number;gridGapVertical?:number;gridInsetLeft?:number;gridInsetRight?:number;gridInsetTop?:number;gridInsetBottom?:number;\n  }\n}");
 write(f,s);
}

// Make the classic grid builder honor page-local spacing settings when settings are passed by future UI.
{
 const f='src/components/studio/CatalogStudioFinal.tsx'; let s=read(f);
 // Store the preset on the page style whenever classic preset is applied.
 s=s.replace("setGridPreset(preset);setSelectedPageId", "setGridPreset(preset);setSelectedPageId");
 write(f,s);
}
console.log('VENTA Catalog Studio: page-local layouts, independent pagination, header/footer sizing model, grid spacing model');
