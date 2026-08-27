import React from 'react';
import { Catalog, Page, Product } from './types';
import { mockCatalog, mockPages, mockProducts } from './mockData';
import { CatalogReader } from './components/reader/CatalogReader';
import { CatalogStudio } from './components/studio/CatalogStudio';
import { motion, AnimatePresence } from 'motion/react';
import { Label, Sans } from './components/shared/Typography';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [view, setView] = React.useState<'home' | 'reader' | 'studio'>('home');
  const [catalog] = React.useState<Catalog>(mockCatalog);
  const [pages, setPages] = React.useState<Page[]>(mockPages);
  const [products] = React.useState<Product[]>(mockProducts);

  const handleUpdatePage = (updatedPage: Page) => setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
  const handleAddPage = () => {
    const newPage: Page = { id: Math.random().toString(36).substr(2, 9), catalogId: catalog.id, order: pages.length, layoutId: 'LAYOUT_A_FULL_BLEED', title: 'New Page', content: {} };
    setPages(prev => [...prev, newPage]);
  };
  const handleDeletePage = (id: string) => setPages(prev => prev.filter(p => p.id !== id));

  return <div className="min-h-screen bg-white">
    <AnimatePresence mode="wait">
      {view === 'home' && <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-screen flex items-center justify-center p-8 bg-[#050505] text-white">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4"><div className="w-12 h-px bg-white/30"/><Label className="mb-0 text-white/70">Spring / Summer 2027</Label></div>
              <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter leading-[0.8]">Aura</h1>
              <Sans className="text-base md:text-xl font-light text-white/50 leading-relaxed max-w-md">A professional studio for digital luxury editorial and interactive publication design.</Sans>
            </div>
            <div className="flex gap-8 items-center"><button onClick={()=>setView('reader')} className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-bold"><span className="border-b border-white pb-1">Open Publication</span></button><button onClick={()=>setView('studio')} className="px-10 py-5 bg-white text-black text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-neutral-200">Studio Access</button></div>
          </div>
          <div className="aspect-[4/5] bg-neutral-900 relative overflow-hidden shadow-2xl"><img src={catalog.coverImage} className="w-full h-full object-cover grayscale brightness-75" alt="Catalog Cover"/><div className="absolute inset-0 bg-black/20"/></div>
        </div>
      </motion.div>}
      {view === 'reader' && <motion.div key="reader" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="fixed top-8 left-8 z-[110]"><button onClick={()=>setView('home')} className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm"><ArrowLeft size={16}/></button></div><CatalogReader catalog={catalog} pages={[...pages].sort((a,b)=>a.order-b.order)} products={products}/></motion.div>}
      {view === 'studio' && <motion.div key="studio" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><CatalogStudio catalog={catalog} pages={[...pages].sort((a,b)=>a.order-b.order)} products={products} onUpdatePage={handleUpdatePage} onAddPage={handleAddPage} onDeletePage={handleDeletePage} onExit={()=>setView('home')}/></motion.div>}
    </AnimatePresence>
  </div>;
}
