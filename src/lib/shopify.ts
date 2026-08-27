import { Catalog, Page, Product } from '../types';

export async function getShopifyStatus(){
  const r=await fetch('/api/status',{credentials:'include'});
  return r.json() as Promise<{connected:boolean;shop?:string}>;
}

export function connectShopify(shop:string){
  const s=shop.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/$/,'');
  const authUrl=`/api/auth?shop=${encodeURIComponent(s)}`;
  if(window.top && window.top !== window.self){window.top.location.href=authUrl;}else{window.location.href=authUrl;}
}

export async function fetchShopifyProducts():Promise<{products:Product[];shop:string;shopName?:string}>{
  const r=await fetch('/api/products',{credentials:'include'});const d=await r.json();
  if(!r.ok)throw new Error(d.error||'Shopify ürünleri alınamadı.');return d;
}

export async function loadCatalogState():Promise<{catalog:Catalog;pages:Page[]}|null>{
  const r=await fetch('/api/catalog',{credentials:'include'});if(!r.ok)return null;const d=await r.json();
  if(!d.catalog)return null;return d.catalog.catalog&&d.catalog.pages?d.catalog:null;
}

export async function loadPublicCatalog():Promise<{catalog:Catalog;pages:Page[]}|null>{
  const r=await fetch('/api/public-catalog',{credentials:'omit',cache:'no-store'});if(!r.ok)return null;const d=await r.json();
  if(!d.published||!d.catalog?.catalog||!d.catalog?.pages)return null;return d.catalog;
}

export async function saveCatalogState(catalog:Catalog,pages:Page[],publish=false){
  const r=await fetch('/api/catalog',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({catalog:{catalog,pages},publish})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||'Katalog kaydedilemedi.');
  if(publish&&!d.published)throw new Error(d.publicPublishError||'Katalog Shopify içine kaydedildi fakat public yayın depolaması hazır değil.');
  return d;
}
