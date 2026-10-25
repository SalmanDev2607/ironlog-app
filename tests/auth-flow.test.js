// Unit & Integration Tests for Auth & Password Recovery Flow

const assert = require('assert');

// Mock localStorage
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// Test Suite
async function runTests() {
  console.log('🧪 Starting Auth Flow & Password Recovery Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // Pure logic parser for recovery redirect
  function parseRecoveryRedirect(loc, storage, client) {
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
      if (storage) storage.removeItem('il_awaiting_password_reset');
      return { isRecovery: false, error: decodeURIComponent(errorDescription.replace(/\+/g, ' ')) };
    }

    const awaitingReset = storage && storage.getItem('il_awaiting_password_reset') === 'true';
    const isRecovery = type === 'recovery' || (awaitingReset && (Boolean(accessToken) || Boolean(code)));

    if (!isRecovery) return { isRecovery: false, error: null };

    if (storage) storage.removeItem('il_awaiting_password_reset');

    if (client) {
      if (accessToken) {
        client.setSession({ access_token: accessToken, refresh_token: refreshToken || '' });
      } else if (code) {
        client.exchangeCodeForSession(code);
      }
    }

    return { isRecovery: true, error: null };
  }

  // Password validation logic
  function validateNewPassword(password, confirm) {
    if (!password || password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters.' };
    }
    if (password !== confirm) {
      return { valid: false, error: 'Passwords do not match.' };
    }
    return { valid: true, error: null };
  }

  // 1. Implicit Flow URL with #type=recovery
  test('Detects password recovery via implicit flow URL hash (#type=recovery)', () => {
    const storage = new MockStorage();
    let sessionSet = null;
    const client = {
      setSession: (s) => { sessionSet = s; }
    };
    const loc = new URL('https://salmandev2607.github.io/ironlog-app/#access_token=tok123&refresh_token=ref456&type=recovery');
    
    const result = parseRecoveryRedirect(loc, storage, client);
    assert.strictEqual(result.isRecovery, true);
    assert.strictEqual(result.error, null);
    assert.deepStrictEqual(sessionSet, { access_token: 'tok123', refresh_token: 'ref456' });
  });

  // 2. PKCE Flow URL with ?code=... when awaiting reset flag is present
  test('Detects recovery via PKCE flow (?code=...) when awaiting reset flag is in storage', () => {
    const storage = new MockStorage();
    storage.setItem('il_awaiting_password_reset', 'true');
    let exchangedCode = null;
    const client = {
      exchangeCodeForSession: (c) => { exchangedCode = c; }
    };
    const loc = new URL('https://salmandev2607.github.io/ironlog-app/?code=pkce_secret_code');

    const result = parseRecoveryRedirect(loc, storage, client);
    assert.strictEqual(result.isRecovery, true);
    assert.strictEqual(result.error, null);
    assert.strictEqual(exchangedCode, 'pkce_secret_code');
    // Flag should be cleaned up
    assert.strictEqual(storage.getItem('il_awaiting_password_reset'), null);
  });

  // 3. Normal signup link does NOT trigger recovery
  test('Signup URL with #type=signup is NOT treated as password recovery', () => {
    const storage = new MockStorage();
    const loc = new URL('https://salmandev2607.github.io/ironlog-app/#access_token=tok123&type=signup');

    const result = parseRecoveryRedirect(loc, storage, null);
    assert.strictEqual(result.isRecovery, false);
    assert.strictEqual(result.error, null);
  });

  // 4. Normal visit without hash or code does NOT trigger recovery
  test('Standard visit with clean URL does NOT trigger password recovery', () => {
    const storage = new MockStorage();
    const loc = new URL('https://salmandev2607.github.io/ironlog-app/');

    const result = parseRecoveryRedirect(loc, storage, null);
    assert.strictEqual(result.isRecovery, false);
    assert.strictEqual(result.error, null);
  });

  // 5. Expired or invalid link error in hash is properly extracted
  test('Expired or invalid reset link with error_description is caught with friendly message', () => {
    const storage = new MockStorage();
    storage.setItem('il_awaiting_password_reset', 'true');
    const loc = new URL('https://salmandev2607.github.io/ironlog-app/#error=access_denied&error_code=403&error_description=Email+link+is+invalid+or+has+expired');

    const result = parseRecoveryRedirect(loc, storage, null);
    assert.strictEqual(result.isRecovery, false);
    assert.strictEqual(result.error, 'Email link is invalid or has expired');
    // Stale awaiting flag is cleared
    assert.strictEqual(storage.getItem('il_awaiting_password_reset'), null);
  });

  // 6. Password validation: too short
  test('Password validation rejects password with less than 6 characters', () => {
    const res = validateNewPassword('12345', '12345');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Password must be at least 6 characters.');
  });

  // 7. Password validation: mismatch
  test('Password validation rejects mismatched passwords', () => {
    const res = validateNewPassword('Secret123', 'Secret456');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Passwords do not match.');
  });

  // 8. Password validation: valid password
  test('Password validation accepts valid matching password of length >= 6', () => {
    const res = validateNewPassword('StrongP@ss2026', 'StrongP@ss2026');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.error, null);
  });

  // 9. Verify Service Worker cache version and strategy
  test('Service worker contains upgraded cache version ironlog-v2.3.0', () => {
    const fs = require('fs');
    const swContent = fs.readFileSync('sw.js', 'utf8');
    assert.match(swContent, /ironlog-v2\.3\.0/, 'sw.js must define cache version ironlog-v2.3.0');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
