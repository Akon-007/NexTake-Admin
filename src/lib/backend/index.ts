import { isSupabaseConfigured } from "../config";
import { demoBackend } from "./demoBackend";
import { supabaseBackend } from "./supabaseBackend";
import type { Backend } from "./types";

/**
 * Single data-access entry point.
 *
 * Swaps between the hosted Supabase backend and the local demo backend so the
 * UI, validation and data model are identical in both cases.
 */
export const backend: Backend = isSupabaseConfigured
  ? supabaseBackend
  : demoBackend;

export { isSupabaseConfigured };
export * from "./types";
export type { NewsletterFrequency } from "./types";
export { relativeTime } from "./utils";
export { DEFAULT_SETTINGS } from "./mappers";
