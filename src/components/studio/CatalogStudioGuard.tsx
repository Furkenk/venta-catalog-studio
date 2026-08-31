import React from 'react';
import { Page } from '../../types';
import { CatalogStudioFinal } from './CatalogStudioFinal';
import { ProductSelectionPanelV2 } from './ProductSelectionPanelV2';

type Props = React.ComponentProps<typeof CatalogStudioFinal> & { collections?: { id: string; name: string }[]; categories?: { id: string; name: string }[] };

const clonePages = (pages: Page[]) => pages.map(p => ({ ...p, content: { ...p.content, blocks: [...(p.content.blocks || [])] } }));

export function CatalogStudioGuard(props: Props) {
  const [pages, setPages] = React.useState<Page[]>(props.pages);
  const [lastPages, setLastPages] = React.useState<Page[] | null>(null);

  React.useEffect(() => setPages(props.pages), [props.pages]);

  const commit = React.useCallback((incoming: Page[]) => {
    const old = pages;
    const incomingIds = new Set(incoming.map(p => p.id));
    const missingOldPages = old.filter(p => !incomingIds.has(p.id));
    const next = missingOldPages.length
      ? [...incoming, ...missingOldPages].map((p, i) => ({ ...p, order: i }))
      : incoming.map((p, i) => ({ ...p, order: i }));
    setLastPages(clonePages(old));
    setPages(next);
    props.onReplacePages?.(next);
  }, [pages, props.onReplacePages]);

  React.useEffect(() => {
    const onProductClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-block-id]')) return;
      requestAnimationFrame(() => {
        const elementsButton = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Eleman');
        if (elementsButton) elementsButton.click();
      });
    };
    document.addEventListener('click', onProductClick);
    return () => document.removeEventListener('click', onProductClick);
  }, []);

  const undo = () => {
    if (!lastPages) return;
    const previous = lastPages;
    setLastPages(null);
    setPages(previous);
    props.onReplacePages?.(previous);
  };

  return <div className="relative w-full h-full">
    <CatalogStudioFinal {...props} pages={pages} onReplacePages={commit} />
    <button onClick={undo} disabled={!lastPages} className="fixed left-[190px] bottom-5 z-[85] h-10 px-4 bg-white border border-[#0f203a]/15 shadow-lg text-[9px] uppercase tracking-[.12em] disabled:opacity-30">Geri Al</button>
    <ProductSelectionPanelV2 catalog={props.catalog} pages={pages} products={props.products} collections={props.collections} categories={props.categories} onReplacePages={commit} />
  </div>;
}
