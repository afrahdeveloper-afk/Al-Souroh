import { supabase } from '../../lib/supabaseClient';
import { unwrap, unwrapMaybe, uploadImage } from './client';
import type { GeneralInformation, GeneralInformationInput } from '../types';

const TABLE = 'general_information';
const ROW_ID = 1;
const FOLDER = 'general-information';

/** Singleton resource (powers the public Hero), always at row id 1. `null` means no record exists yet, so the Homepage editor knows to create instead of update on first save. */
export async function getGeneralInformation(): Promise<GeneralInformation | null> {
  const result = await supabase.from(TABLE).select('*').eq('id', ROW_ID).maybeSingle();
  return unwrapMaybe<GeneralInformation>(result);
}

export async function createGeneralInformation(
  input: Required<GeneralInformationInput>,
): Promise<GeneralInformation> {
  const { hero_img: file, ...rest } = input;
  const hero_img = await uploadImage(file, FOLDER);
  const result = await supabase
    .from(TABLE)
    .insert({ id: ROW_ID, ...rest, hero_img })
    .select()
    .single();
  return unwrap<GeneralInformation>(result);
}

export async function updateGeneralInformation(input: GeneralInformationInput): Promise<GeneralInformation> {
  const { hero_img: file, ...rest } = input;
  const patch: Record<string, unknown> = { ...rest };
  if (file) patch.hero_img = await uploadImage(file, FOLDER);

  const result = await supabase.from(TABLE).update(patch).eq('id', ROW_ID).select().single();
  return unwrap<GeneralInformation>(result);
}
