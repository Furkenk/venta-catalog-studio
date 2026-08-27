import React from 'react';
import {PageRenderer3} from './PageRenderer3';
import {PageRendererEditor} from './PageRendererEditor';
import {Page,Product,PageBlock,CatalogSettings,LayoutId} from '../../types';

function block(id:string,type:PageBlock['type'],x:number,y:number,width:number,height:number,extra:Partial<PageBlock>={}):PageBlock{
  return {id,type,x,y,width,height,zIndex:10,...extra};
}

function productFrame(id:string,x:number,y:number,w:number,h:number,product?:Product):PageBlock{
  return block(id,'frame',x,y,w,h,{frameKind:'product',productId:product?.id,borderWidth:1,productInfo:{showName:false,showSku:false,showPrice:false,showMaterial:false,showCategory:false,showDescription:false,position:'below',align:'left'}});
}

function imageFrame(id:string,x:number,y:number,w:number,h:number,product?:Product):PageBlock{
  return block(id,'frame',x,y,w,h,{frameKind:'image',url:product?.images?.[0],borderWidth:1,objectFit:'cover'});
}

function textBlock(id:string,text:string,x:number,y:number,w:number,h:number,size=18):PageBlock{
  return block(id,'text',x,y,w,h,{alt:text,fontFamily:'Georgia, serif',fontSize:size,fontStyle:'italic',textAlign:'left'});
}

function previewBlocks(layout:LayoutId,products:Product[]):PageBlock[]{
  const p=(i:number)=>products[i%Math.max(products.length,1)];
  const a:PageBlock[]=[];
  switch(layout){
    case 'COVER': a.push(imageFrame('preview-cover-image',3,3,94,94,p(0)),textBlock('preview-cover-title','NEW COLLECTION',18,40,64,12,28)); break;
    case 'BACK_COVER': a.push(textBlock('preview-back-title','THANK YOU',20,43,60,12,28)); break;
    case 'LAYOUT_A_FULL_BLEED': a.push(imageFrame('preview-a-image',3,3,94,78,p(0)),textBlock('preview-a-title','THE COLLECTION',8,82,62,9,22),textBlock('preview-a-copy','Editorial story',8,91,40,5,9)); break;
    case 'LAYOUT_B_HERO_PRODUCT': a.push(productFrame('preview-b-product',4,4,55,91,p(0)),textBlock('preview-b-title','FEATURED PIECE',64,46,30,9,20),textBlock('preview-b-copy','Product story',64,59,28,7,9)); break;
    case 'LAYOUT_C_PRODUCT_GRID': for(let i=0;i<8;i++)a.push(productFrame(`preview-c-${i}`,6+(i%4)*23,10+Math.floor(i/4)*42,19,34,p(i))); break;
    case 'LAYOUT_D_ASYMMETRIC': a.push(imageFrame('preview-d-image',4,4,57,70,p(0)),textBlock('preview-d-title','ARCHITECTURE',66,14,29,10,20),productFrame('preview-d-p1',67,54,12,32,p(1)),productFrame('preview-d-p2',82,54,12,32,p(2))); break;
    case 'LAYOUT_E_HERO_DETAILS': a.push(productFrame('preview-e-product',4,4,64,88,p(0)),textBlock('preview-e-title','SIGNATURE PIECE',72,58,22,9,19),textBlock('preview-e-info','SKU / MATERIAL',72,71,20,8,8)); break;
    case 'LAYOUT_F_TWO_UP': a.push(imageFrame('preview-f-left',3,3,46,94,p(0)),imageFrame('preview-f-right',51,3,46,94,p(1))); break;
    case 'LAYOUT_G_THREE_UP': for(let i=0;i<3;i++)a.push(imageFrame(`preview-g-${i}`,3+i*32,3,30,94,p(i))); break;
    case 'LAYOUT_H_TYPOGRAPHIC': a.push(textBlock('preview-h-kicker','VENTA JEWELRY',10,28,80,5,8),textBlock('preview-h-title','THE NEW OBJECTS',10,38,80,17,38),textBlock('preview-h-copy','Typography-led editorial',10,60,62,8,10)); break;
    case 'LAYOUT_I_IMAGE_TEXT': a.push(imageFrame('preview-i-image',3,3,48,94,p(0)),textBlock('preview-i-title','EDITORIAL STORY',57,42,34,10,24),textBlock('preview-i-copy','Campaign story',57,58,32,8,9)); break;
    case 'LAYOUT_J_PRODUCT_FEATURE': for(let i=0;i<3;i++)a.push(productFrame(`preview-j-${i}`,6+i*31,16,27,68,p(i))); a.push(textBlock('preview-j-title','FEATURED',6,7,50,6,16)); break;
    case 'LAYOUT_K_LOOK_PAGE': a.push(imageFrame('preview-k-image',3,3,94,94,p(0)),textBlock('preview-k-title','LOOK 01',8,10,40,9,22)); break;
    case 'LAYOUT_L_COLLECTION_INDEX': a.push(textBlock('preview-l-title','COLLECTION INDEX',8,7,72,8,24)); for(let i=0;i<6;i++)a.push(productFrame(`preview-l-${i}`,8,20+i*12,84,10,p(i))); break;
    case 'LAYOUT_M_PRODUCT_GRID_12': for(let i=0;i<12;i++)a.push(productFrame(`preview-m-${i}`,5+(i%4)*24,8+Math.floor(i/4)*30,20,24,p(i))); break;
    case 'LAYOUT_N_PRODUCT_GRID_16': for(let i=0;i<16;i++)a.push(productFrame(`preview-n-${i}`,4+(i%4)*24,6+Math.floor(i/4)*23,20,18,p(i))); break;
    case 'LAYOUT_O_EDITORIAL_COLLAGE': a.push(imageFrame('preview-o-main',5,5,56,65,p(0)),imageFrame('preview-o-small',65,10,28,25,p(1)),textBlock('preview-o-title','OBJECTS OF DESIRE',64,43,31,10,20),productFrame('preview-o-p1',65,76,13,18,p(2)),productFrame('preview-o-p2',80,76,13,18,p(3))); break;
    case 'LAYOUT_P_IMAGE_4_PRODUCTS': a.push(imageFrame('preview-p-main',4,4,40,92,p(0))); for(let i=0;i<4;i++)a.push(productFrame(`preview-p-${i}`,48+(i%2)*24,8+Math.floor(i/2)*44,20,36,p(i+1))); break;
    case 'LAYOUT_Q_SPLIT_EDITORIAL': a.push(imageFrame('preview-q-image',3,3,57,94,p(0)),textBlock('preview-q-title','EDITORIAL',66,37,28,10,25),textBlock('preview-q-copy','Build a story',66,52,26,8,9)); break;
    case 'LAYOUT_R_PRODUCT_WALL': for(let i=0;i<9;i++)a.push(productFrame(`preview-r-${i}`,6+(i%3)*31,7+Math.floor(i/3)*31,27,26,p(i))); break;
    case 'LAYOUT_S_MAGAZINE': a.push(imageFrame('preview-s-main',5,7,60,68,p(0)),imageFrame('preview-s-small',69,8,25,27,p(1)),textBlock('preview-s-title','VOLUME 01',68,45,26,8,20),textBlock('preview-s-copy','Objects of desire',68,58,25,8,9)); break;
    case 'LAYOUT_T_PRODUCT_INDEX': a.push(textBlock('preview-t-title','PRODUCT INDEX',7,6,70,8,24)); for(let i=0;i<12;i++)a.push(productFrame(`preview-t-${i}`,7+(i%2)*45,18+Math.floor(i/2)*12,39,10,p(i))); break;
  }
  return a;
}

function blockFamily(id:string):string{
  const m=id.match(/^(?:preview-)?([a-z]+)(?:-|$)/i);
  return m?.[1]?.toLowerCase()||'';
}

function layoutMatchesBlocks(layout:LayoutId,blocks:PageBlock[]):boolean{
  if(!blocks.length)return false;
  const expected:Record<string,string>={
    COVER:'cover',BACK_COVER:'back',LAYOUT_A_FULL_BLEED:'full',LAYOUT_B_HERO_PRODUCT:'hero-product',LAYOUT_C_PRODUCT_GRID:'grid8',LAYOUT_D_ASYMMETRIC:'asym',LAYOUT_E_HERO_DETAILS:'hero-detail',LAYOUT_F_TWO_UP:'two',LAYOUT_G_THREE_UP:'three',LAYOUT_H_TYPOGRAPHIC:'type',LAYOUT_I_IMAGE_TEXT:'image',LAYOUT_J_PRODUCT_FEATURE:'feature',LAYOUT_K_LOOK_PAGE:'look',LAYOUT_L_COLLECTION_INDEX:'index',LAYOUT_M_PRODUCT_GRID_12:'grid12',LAYOUT_N_PRODUCT_GRID_16:'grid16',LAYOUT_O_EDITORIAL_COLLAGE:'collage',LAYOUT_P_IMAGE_4_PRODUCTS:'p',LAYOUT_Q_SPLIT_EDITORIAL:'split',LAYOUT_R_PRODUCT_WALL:'wall',LAYOUT_S_MAGAZINE:'mag',LAYOUT_T_PRODUCT_INDEX:'product'
  };
  const wanted=expected[layout];
  if(!wanted)return false;
  return blocks.some(b=>{
    const id=b.id.toLowerCase();
    if(wanted==='hero-product'||wanted==='hero-detail')return id.startsWith(wanted);
    if(wanted==='image')return id.startsWith('image-text-');
    if(wanted==='p')return id.startsWith('p-');
    if(wanted==='product')return id.startsWith('product-index-');
    return id.startsWith(`${wanted}-`)||blockFamily(id)===wanted;
  });
}

export function PageRenderer(props:{
  page:Page;
  products:Product[];
  thumbnail?:boolean;
  catalogSettings?:CatalogSettings;
  editor?:boolean;
  selectedBlockId?:string;
  onSelectBlock?:(id:string)=>void;
  onBlockPointerDown?:(id:string,e:React.PointerEvent)=>void;
  onBlockResizeStart?:(id:string,e:React.PointerEvent)=>void;
  onBlockPatch?:(id:string,p:Partial<PageBlock>)=>void;
}){
  const blocks=props.page.content?.blocks||[];
  const renderPage=(props.thumbnail&&!props.editor&&!layoutMatchesBlocks(props.page.layoutId,blocks))
    ? {...props.page,content:{...props.page.content,blocks:previewBlocks(props.page.layoutId,props.products)}}
    : props.page;
  const renderBlocks=renderPage.content?.blocks||[];
  const renderKey=[renderPage.id,renderPage.layoutId,renderBlocks.length,renderBlocks.map(b=>`${b.id}:${b.type}:${b.frameKind||''}:${b.productId||''}:${b.url||''}`).join('|')].join('::');
  if(props.editor){
    return <PageRendererEditor key={`editor-${renderKey}`} page={renderPage} products={props.products} catalogSettings={props.catalogSettings} selectedBlockId={props.selectedBlockId} onSelectBlock={props.onSelectBlock||(()=>{})} onBlockPointerDown={props.onBlockPointerDown||(()=>{})} onBlockResizeStart={props.onBlockResizeStart||(()=>{})} onBlockPatch={props.onBlockPatch||(()=>{})}/>;
  }
  return <PageRenderer3 key={`view-${renderKey}`} {...props} page={renderPage}/>;
}
