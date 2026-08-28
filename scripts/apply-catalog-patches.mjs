import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s);
{
  const f='src/components/studio/CatalogStudioFinal.tsx';
  let s=read(f);
  s=s.replace("const adaptive=new Set<LayoutId>(['LAYOUT_C_PRODUCT_GRID','LAYOUT_J_PRODUCT_FEATURE','LAYOUT_L_COLLECTION_INDEX','LAYOUT_M_PRODUCT_GRID_12','LAYOUT_N_PRODUCT_GRID_16','LAYOUT_R_PRODUCT_WALL','LAYOUT_T_PRODUCT_INDEX']);","const adaptive=new Set<LayoutId>(['LAYOUT_B_HERO_PRODUCT','LAYOUT_C_PRODUCT_GRID','LAYOUT_D_ASYMMETRIC','LAYOUT_E_HERO_DETAILS','LAYOUT_J_PRODUCT_FEATURE','LAYOUT_L_COLLECTION_INDEX','LAYOUT_M_PRODUCT_GRID_12','LAYOUT_N_PRODUCT_GRID_16','LAYOUT_O_EDITORIAL_COLLAGE','LAYOUT_P_IMAGE_4_PRODUCTS','LAYOUT_R_PRODUCT_WALL','LAYOUT_T_PRODUCT_INDEX']);");
  s=s.replace("if(mode==='category'&&filter&&p.category!==filter&&p.categoryFullName!==filter)return false;","if(mode==='category'&&filter&&!`${p.category} ${p.categoryFullName||''} ${p.name} ${p.productType} ${(p.tags||[]).join(' ')}`.toLocaleLowerCase('tr-TR').includes(filter.toLocaleLowerCase('tr-TR')))return false;");
  write(f,s);
}
console.log('VENTA final catalog build patches applied');
