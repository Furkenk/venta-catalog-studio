import { Product, Page, Catalog } from './types';
const now=new Date().toISOString();
export const mockProducts:Product[]=[{id:'demo-1',name:'Shopify product preview',description:'Shopify bağlantısı yapıldığında gerçek ürünler burada görünür.',price:0,sku:'SHOPIFY-SYNC',material:'',images:['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000'],category:'Preview',collectionId:''}];
export const mockPages:Page[]=[
{id:'page-cover',catalogId:'catalog-1',order:0,layoutId:'COVER',title:'Cover',content:{images:['https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=2000'],subheadline:'DIGITAL COLLECTION',body:'A premium interactive catalog.'}},
{id:'page-opening',catalogId:'catalog-1',order:1,layoutId:'LAYOUT_A_FULL_BLEED',title:'Opening Spread',content:{images:['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000'],headline:'The Architecture of Adornment',body:'Build an editorial story around the collection.'}},
{id:'page-intro',catalogId:'catalog-1',order:2,layoutId:'LAYOUT_H_TYPOGRAPHIC',title:'Collection Introduction',content:{headline:'Collection Notes',body:'Introduce the collection with a strong editorial statement.'}},
{id:'page-feature',catalogId:'catalog-1',order:3,layoutId:'LAYOUT_B_HERO_PRODUCT',title:'Featured Product',content:{images:['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=2000'],headline:'Featured Piece'}},
{id:'page-grid',catalogId:'catalog-1',order:4,layoutId:'LAYOUT_C_PRODUCT_GRID',title:'Product Selection',content:{headline:'Selected Pieces'}},
{id:'page-editorial',catalogId:'catalog-1',order:5,layoutId:'LAYOUT_D_ASYMMETRIC',title:'Editorial Spread',content:{images:['https://images.unsplash.com/photo-1611085583191-a3b13b843181?auto=format&fit=crop&q=80&w=2000'],headline:'Material & Form',body:'Pair editorial imagery with selected Shopify products.'}},
{id:'page-look',catalogId:'catalog-1',order:6,layoutId:'LAYOUT_K_LOOK_PAGE',title:'Lookbook',content:{images:['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=2000'],headline:'The Look',body:'Create an immersive campaign page.'}},
{id:'page-index',catalogId:'catalog-1',order:7,layoutId:'LAYOUT_L_COLLECTION_INDEX',title:'Index',content:{}}
];
export const mockCatalog:Catalog={id:'catalog-1',name:'New Collection',description:'Luxury digital catalog.',coverImage:'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=2000',logoUrl:'',createdAt:now,updatedAt:now,status:'draft',theme:{primaryColor:'#111111',secondaryColor:'#f6f4ef',serifFont:'Playfair Display',sansFont:'Inter'}};
