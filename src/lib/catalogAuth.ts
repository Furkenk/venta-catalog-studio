import type { User } from '@supabase/supabase-js';
import type { CatalogRole } from './database.types';
import { requireSupabase } from './supabase';

export type CatalogSession = { user: User; role: CatalogRole; fullName: string | null };

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function getCatalogSession(): Promise<CatalogSession | null> {
  const client = requireSupabase();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;

  const { data: member, error: memberError } = await client
    .from('catalog_members')
    .select('role, full_name')
    .eq('user_id', user.id)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!member) return null;

  return { user, role: member.role, fullName: member.full_name };
}

export function canPublish(role: CatalogRole | null | undefined) {
  return role === 'manager';
}
