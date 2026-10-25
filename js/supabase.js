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
        detectSessionInUrl: true,
        flowType: 'implicit'
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
        detectSessionInUrl: true,
        flowType: 'implicit'
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
 * Checks URL for recovery tokens / parameters, sets session explicitly,
 * and returns { isRecovery: boolean, error: string | null }.
 */
export async function handleRecoveryRedirect(customLocation) {
  if (typeof window === 'undefined' && !customLocation) return { isRecovery: false, error: null };

  const loc = customLocation || window.location;
  const rawHash = loc.hash || '';
  const hash = rawHash.startsWith('#') ? rawHash.substring(1) : rawHash;
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(loc.search || '');

  const type = hashParams.get('type') || searchParams.get('type');
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const code = searchParams.get('code');
  const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

  if (errorDescription) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('il_awaiting_password_reset');
    }
    return { isRecovery: false, error: decodeURIComponent(errorDescription.replace(/\+/g, ' ')) };
  }

  // Recovery is detected if:
  // 1. type === 'recovery' in hash or query
  // 2. OR user had requested a password reset in this browser and arrives with access_token or code
  const awaitingReset = typeof localStorage !== 'undefined' && localStorage.getItem('il_awaiting_password_reset') === 'true';
  const isRecovery = type === 'recovery' || (awaitingReset && (Boolean(accessToken) || Boolean(code)));

  if (!isRecovery) return { isRecovery: false, error: null };

  // Clear awaiting flag now that we caught the recovery
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('il_awaiting_password_reset');
  }

  try {
    const client = await ensureClient();
    if (client) {
      if (accessToken) {
        await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
      } else if (code && typeof client.auth.exchangeCodeForSession === 'function') {
        await client.auth.exchangeCodeForSession(code);
      } else {
        await client.auth.getSession();
      }
    }
  } catch (err) {
    console.warn('Error establishing recovery session:', err);
  }

  // Clean URL tokens without page reload
  if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }

  return { isRecovery: true, error: null };
}

/**
 * Sends a password reset email with a link back to the app
 */
export async function resetPasswordForEmail(email) {
  const client = await ensureClient();
  // Always redirect to the canonical app URL so the token domain matches
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

/**
 * Updates the authenticated user's password (called after clicking reset link)
 */
export async function updatePassword(newPassword) {
  const client = await ensureClient();
  // Verify session exists before attempting update
  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    throw new Error('Auth session missing! Please click the reset link from your email again.');
  }
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw error;
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
