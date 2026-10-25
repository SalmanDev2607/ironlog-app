// IronLog Supabase Client & Authentication Service

const CONFIG_STORAGE_KEY = 'il_supabase_config';

// Default Supabase project configuration (can be updated via UI settings or here)
export const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://meioyarhiguhjlbjjlkx.supabase.co',
  anonKey: 'sb_publishable_au1YcfxlMUhs2Gc6fFm32Q_rE3eO2Rq'
};

let supabaseClient = null;

/**
 * Returns current Supabase project URL and anon public key
 */
export function getSupabaseConfig() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read Supabase config from storage:', err);
  }
  return { ...DEFAULT_SUPABASE_CONFIG };
}

/**
 * Updates Supabase credentials in local storage and re-initializes client
 */
export function setSupabaseConfig(url, anonKey) {
  const cleanUrl = (url || '').trim().replace(/\/+$/, '');
  const cleanKey = (anonKey || '').trim();
  
  if (typeof localStorage !== 'undefined') {
    if (!cleanUrl || !cleanKey) {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } else {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
    }
  }
  
  supabaseClient = null; // force re-init
  return getClient();
}

/**
 * Checks whether Supabase credentials have been configured
 */
export function isSupabaseConfigured() {
  const cfg = getSupabaseConfig();
  return Boolean(cfg.url && cfg.anonKey && cfg.url.startsWith('http'));
}

/**
 * Resolves createClient function from window.supabase or global supabase
 */
function resolveCreateClientFn() {
  if (typeof window !== 'undefined') {
    if (window.supabase?.createClient) return window.supabase.createClient;
    if (typeof supabase !== 'undefined' && supabase?.createClient) return supabase.createClient;
  }
  return null;
}

/**
 * Returns or initializes the Supabase client synchronously if library is ready
 */
export function getClient() {
  if (supabaseClient) return supabaseClient;
  if (!isSupabaseConfigured()) return null;

  const createClientFn = resolveCreateClientFn();
  if (!createClientFn) return null;

  const cfg = getSupabaseConfig();
  try {
    supabaseClient = createClientFn(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

/**
 * Ensures the Supabase client is initialized (with dynamic ESM fallback if script is delayed)
 */
export async function ensureClient() {
  if (supabaseClient) return supabaseClient;

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are missing. Set project URL & Key in Settings.');
  }

  let createClientFn = resolveCreateClientFn();

  // If classic script not loaded, try dynamic ESM import from CDN
  if (!createClientFn) {
    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      createClientFn = mod?.createClient || null;
      if (createClientFn && typeof window !== 'undefined') {
        window.supabase = mod;
      }
    } catch (err) {
      console.warn('Failed to load Supabase from ESM CDN:', err);
    }
  }

  if (!createClientFn) {
    throw new Error('Could not load Supabase SDK. Please check your internet connection.');
  }

  const cfg = getSupabaseConfig();
  try {
    supabaseClient = createClientFn(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    throw new Error('Failed to connect to Supabase: ' + err.message);
  }
}

/**
 * Signs up a user with email and password
 */
export async function signUpWithEmail(email, password) {
  const client = await ensureClient();
  const { data, error } = await client.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

/**
 * Signs in with email and password
 */
export async function signInWithEmail(email, password) {
  const client = await ensureClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

/**
 * Initiates Google OAuth Sign-in flow
 */
export async function signInWithGoogle() {
  const client = await ensureClient();
  const redirectUrl = window.location.origin + window.location.pathname;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });
  
  if (error) throw error;
  return data;
}

/**
 * Signs out the current authenticated user
 */
export async function signOutUser() {
  const client = await ensureClient().catch(() => null);
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

/**
 * Retrieves the currently logged-in user
 */
export async function getCurrentUser() {
  const client = await ensureClient().catch(() => null);
  if (!client) return null;
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Retrieves the current session
 */
export async function getCurrentSession() {
  const client = await ensureClient().catch(() => null);
  if (!client) return null;
  const { data: { session }, error } = await client.auth.getSession();
  if (error || !session) return null;
  return session;
}

/**
 * Listens to authentication state changes (SIGNED_IN, SIGNED_OUT, etc.)
 */
export function onAuthChange(callback) {
  const client = getClient();
  if (!client) {
    // If not ready yet, retry when client is ensured
    ensureClient().then(c => {
      if (c) {
        c.auth.onAuthStateChange((event, session) => {
          callback(event, session);
        });
      }
    }).catch(() => {});
    return { unsubscribe: () => {} };
  }
  
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  return subscription;
}
