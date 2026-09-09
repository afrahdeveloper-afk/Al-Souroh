import { supabase } from '../../lib/supabaseClient';
import { unwrap, unwrapMaybe } from './client';
import type { ContactUs, ContactUsInput } from '../types';

const TABLE = 'contact_us';
const ROW_ID = 1;

/** Singleton resource, always at row id 1. `null` means no record exists yet, so callers know to create instead of update on first save. */
export async function getContactUs(): Promise<ContactUs | null> {
  const result = await supabase.from(TABLE).select('*').eq('id', ROW_ID).maybeSingle();
  return unwrapMaybe<ContactUs>(result);
}

export async function createContactUs(input: ContactUsInput): Promise<ContactUs> {
  const result = await supabase.from(TABLE).insert({ id: ROW_ID, ...input }).select().single();
  return unwrap<ContactUs>(result);
}

export async function updateContactUs(input: Partial<ContactUsInput>): Promise<ContactUs> {
  const result = await supabase.from(TABLE).update(input).eq('id', ROW_ID).select().single();
  return unwrap<ContactUs>(result);
}
