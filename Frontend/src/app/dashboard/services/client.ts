import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import { ApiError, type ApiErrorBody } from "../types";

/**
 * Shared plumbing every table-backed service module needs, now that reads
 * and writes both go straight to Supabase (see `lib/supabaseClient.ts`).
 * Row Level Security — not this file — is what actually enforces "anyone
 * can read, only a signed-in admin can write" (see `supabase/schema.sql`).
 */

type SupabaseResult<T> = {
  data: T | null;
  error: PostgrestError | null;
  status: number;
};

function errorBody(error: PostgrestError): ApiErrorBody {
  return { detail: error.message, code: error.code };
}

/** Throws `ApiError` on a Postgrest error, otherwise returns the data (never null — use `unwrapMaybe` if the row can legitimately be absent). */
export function unwrap<T>(result: SupabaseResult<T>): T {
  if (result.error) throw new ApiError(result.status || 400, errorBody(result.error));
  return result.data as T;
}

/** Same as `unwrap`, but a missing row (e.g. `.maybeSingle()` finding nothing) resolves to `null` instead of throwing — mirrors the old singleton endpoints' "404 means no record yet" convention. */
export function unwrapMaybe<T>(result: SupabaseResult<T>): T | null {
  if (result.error) throw new ApiError(result.status || 400, errorBody(result.error));
  return result.data;
}

const BUCKET = "media";

/** Uploads a File to the `media` bucket under `folder/`, returning its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new ApiError(400, { detail: error.message });
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Deletes a previously-uploaded image given its public URL. Best-effort and
 * silent on failure — mirrors the old Django models' on-replace/on-delete
 * file cleanup, but an orphaned file left in storage is a non-issue,
 * nothing worth blocking the row write that triggered this on.
 */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = url.slice(index + marker.length);
  await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
}
