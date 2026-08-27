import React from 'react';
import {PageRenderer3} from './PageRenderer3';
import {PageRendererEditor} from './PageRendererEditor';
import {Page,Product,PageBlock,CatalogSettings} from '../../types';
export function PageRenderer(props:{page:Page;products:Product[];thumbnail?:boolean;catalogSettings?:CatalogSettings;editor?:boolean;selectedBlockId?:string;onSelectBlock?:(id:string)=>void;onBlockPointerDown?:(id:string,e:React.PointerEvent)=>void;onBlockResizeStart?:(id:string,e:React.PointerEvent)=>void;onBlockPatch?:(id:string,p:Partial<PageBlock>)=>void}){if(props.editor)return <PageRendererEditor page={props.page} products={props.products} catalogSettings={props.catalogSettings} selectedBlockId={props.selectedBlockId} onSelectBlock={props.onSelectBlock||(()=>{})} onBlockPointerDown={props.onBlockPointerDown||(()=>{})} onBlockResizeStart={props.onBlockResizeStart||(()=>{})} onBlockPatch={props.onBlockPatch||(()=>{})}/>;return <PageRenderer3 {...props}/>;}
