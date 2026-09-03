import type { CatalogStatus, CatalogVisibility, Database, Json } from './database.types';
import { requireSupabase } from './supabase';

export type CatalogDraftInput = {
  title: string;
  slug?: string;
  visibility?: CatalogVisibility;
  coverImageUrl?: string | null;
  settings?: Json;
};

export type CatalogPageInput = {
  pageNumber: number;
  isLocked?: boolean;
  layoutKey?: string;
  layoutConfig?: Json;
  settingsOverride?: Json;
};

type CatalogRow = Database['public']['Tables']['catalogs']['Row'];
type CatalogPageRow = Database['public']['Tables']['catalog_pages']['Row'];
type CatalogSlotRow = Database['public']['Tables']['catalog_slots']['Row'];

export function slugifyCatalogTitle(title: string) {
  return title
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export async function listMyCatalogs() {
  const { data, error } = await requireSupabase().from('catalogs').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data as CatalogRow[];
}

export async function getCatalog(catalogId: string) {
  const client = requireSupabase();
  const { data: catalog, error: catalogError } = await client.from('catalogs').select('*').eq('id', catalogId).single();
  if (catalogError) throw catalogError;

  const { data: pages, error: pagesError } = await client.from('catalog_pages').select('*').eq('catalog_id', catalogId).order('page_number');
  if (pagesError) throw pagesError;

  const pageIds = (pages as CatalogPageRow[]).map((page) => page.id);
  const { data: slots, error: slotsError } = pageIds.length
    ? await client.from('catalog_slots').select('*').in('page_id', pageIds).order('slot_index')
    : { data: [], error: null };
  if (slotsError) throw slotsError;

  return { catalog: catalog as CatalogRow, pages: pages as CatalogPageRow[], slots: slots as CatalogSlotRow[] };
}

export async function createCatalogDraft(input: CatalogDraftInput, ownerId: string) {
  const slug = input.slug || slugifyCatalogTitle(input.title);
  const { data, error } = await requireSupabase().from('catalogs').insert({
    title: input.title.trim(),
    slug,
    owner_id: ownerId,
    status: 'draft',
    visibility: input.visibility ?? 'public',
    cover_image_url: input.coverImageUrl ?? null,
    settings: input.settings ?? {},
  }).select('*').single();
  if (error) throw error;

  const { error: pageError } = await requireSupabase().from('catalog_pages').insert({
    catalog_id: data.id,
    page_number: 1,
    layout_key: 'grid_9',
  });
  if (pageError) throw pageError;

  return data as CatalogRow;
}

export async function saveCatalogDraft(catalogId: string, input: CatalogDraftInput) {
  const { data, error } = await requireSupabase().from('catalogs').update({
    title: input.title.trim(),
    slug: input.slug || slugifyCatalogTitle(input.title),
    visibility: input.visibility ?? 'public',
    cover_image_url: input.coverImageUrl ?? null,
    settings: input.settings ?? {},
  }).eq('id', catalogId).eq('status', 'draft').select('*').single();
  if (error) throw error;
  return data as CatalogRow;
}

export async function publishCatalog(catalogId: string) {
  const { data, error } = await requireSupabase().from('catalogs').update({
    status: 'published',
    published_at: new Date().toISOString(),
    archived_at: null,
  }).eq('id', catalogId).select('*').single();
  if (error) throw error;
  return data as CatalogRow;
}

export async function archiveCatalog(catalogId: string) {
  const { data, error } = await requireSupabase().from('catalogs').update({
    status: 'archived',
    archived_at: new Date().toISOString(),
  }).eq('id', catalogId).select('*').single();
  if (error) throw error;
  return data as CatalogRow;
}

export async function listPublicCatalogs() {
  const { data, error } = await requireSupabase().from('catalogs')
    .select('id, code, title, slug, cover_image_url, published_at, settings')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function catalogPublicPath(slug: string) {
  return `/c/${slug}`;
}

export function isPublished(status: CatalogStatus) {
  return status === 'published';
}
