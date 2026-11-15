import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { profileRepo } from '../repositories/storageRepository';

function getEnvVar(key: string): string | undefined {
  try {
    const val = (import.meta as unknown as { env?: Record<string, string> }).env?.[key];
    if (typeof val === 'string') return val.trim();
  } catch {}
  try {
    const pVal = typeof process !== 'undefined' ? process.env?.[key] : undefined;
    if (typeof pVal === 'string') return pVal.trim();
  } catch {}
  return undefined;
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const dispatchMode = getEnvVar('VITE_DISPATCH_MODE');

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null;

export const isLiveDispatchEnabled: boolean =
  supabase !== null && dispatchMode !== 'mock';

const CUSTOMER_ID_KEY = 'motosos_customer_id';

export async function getOrCreateCustomerId(): Promise<string> {
  if (typeof window !== 'undefined' && window.localStorage) {
    const cached = window.localStorage.getItem(CUSTOMER_ID_KEY);
    if (cached) return cached;
  }

  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        window.localStorage?.setItem(CUSTOMER_ID_KEY, session.user.id);
        return session.user.id;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data?.user?.id) {
        window.localStorage?.setItem(CUSTOMER_ID_KEY, data.user.id);
        return data.user.id;
      }
    } catch {}
  }

  const phoneDigits = profileRepo.getProfile()?.phone?.replace(/\D/g, '');
  const fallbackId = phoneDigits && phoneDigits.length >= 9
    ? `cust_${phoneDigits}`
    : (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `cust_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);

  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(CUSTOMER_ID_KEY, fallbackId);
  }
  return fallbackId;
}
