// Unit Tests for IronLog Chatbot & Smart Similarity Cache

const assert = require('assert');

// Mock localStorage for Node.js test environment
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

global.localStorage = new MockStorage();
global.sessionStorage = new MockStorage();

async function runTests() {
  console.log('🤖 Starting IronLog Chatbot & Similarity Cache Test Suite...\n');
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

  // Dynamic import of chatbot module
  const chatbot = await import('../js/chatbot.js');

  // 1. Text Normalization
  test('normalizeQuery cleans punctuation, case, and extra whitespace', () => {
    const raw = '  How DOES... Progressive-Overload, WORK??  ';
    const norm = chatbot.normalizeQuery(raw);
    assert.strictEqual(norm, 'how does progressive overload work');
  });

  // 2. Keyword Extraction
  test('extractKeywords filters stopwords and stems common suffixes', () => {
    const tokens = chatbot.extractKeywords('What are the best chest exercises for building pecs?');
    assert.ok(tokens.includes('chest'));
    assert.ok(tokens.includes('exercis'));
    assert.ok(tokens.includes('pec'));
    assert.ok(!tokens.includes('what'));
    assert.ok(!tokens.includes('are'));
    assert.ok(!tokens.includes('the'));
  });

  // 3. Similarity Calculation
  test('calculateSimilarity returns 1.0 for exact matches', () => {
    const score = chatbot.calculateSimilarity('What is today workout?', 'What is today workout?');
    assert.strictEqual(score, 1.0);
  });

  test('calculateSimilarity returns high similarity (>= 0.70) for similar questions', () => {
    const q1 = 'How does progressive overload work in this app?';
    const q2 = 'Explain progressive overload';
    const score = chatbot.calculateSimilarity(q1, q2);
    assert.ok(score >= 0.70, `Expected score >= 0.70, got ${score}`);
  });

  test('calculateSimilarity returns low similarity for different topics', () => {
    const q1 = 'How does progressive overload work?';
    const q2 = 'What are Golden Era aesthetic proportions?';
    const score = chatbot.calculateSimilarity(q1, q2);
    assert.ok(score < 0.50, `Expected score < 0.50, got ${score}`);
  });

  // 4. Strict Scope Enforcement
  test('isQueryInScope allows app and gym related questions', () => {
    const validQuestions = [
      'What workout is scheduled today?',
      'How does progressive overload work?',
      'Tell me about chest exercises',
      'What are the Golden Era aesthetic ratios?',
      'How does muscle recovery tracking work?',
      'How does the rest timer chime work?',
      'How do I sync with Supabase cloud?',
      'Can I log weight in lbs?',
      'How to add custom exercises?',
      'Hi',
      'Who are you?'
    ];

    for (const q of validQuestions) {
      assert.strictEqual(chatbot.isQueryInScope(q), true, `Failed for query: "${q}"`);
    }
  });

  test('isQueryInScope rejects queries unrelated to IronLog / gym training', () => {
    const offTopicQuestions = [
      'What is the capital of France?',
      'Who is the president of the United States?',
      'How do I bake a chocolate cake recipe?',
      'Write a python script to sort an array',
      'What will the weather be like tomorrow in Paris?',
      'What is the current stock price of Apple?',
      'Can you write a poem about flowers?'
    ];

    for (const q of offTopicQuestions) {
      assert.strictEqual(chatbot.isQueryInScope(q), false, `Failed: "${q}" should be out of scope`);
    }
  });

  // 5. Out-of-Scope Refusal Response
  await testAsync('askChatbot returns polite refusal for off-topic query', async () => {
    global.localStorage.clear();
    const res = await chatbot.askChatbot('What is the capital of France?');
    assert.strictEqual(res.inScope, false);
    assert.match(res.response, /strictly/i);
    assert.match(res.response, /IronLog/);
  });

  // 6. Caching: Exact Question Cache Hit
  await testAsync('askChatbot caches initial answer and hits cache on identical question', async () => {
    global.localStorage.clear();
    const q = 'How does progressive overload work in this app?';
    
    // First query: cache miss
    const res1 = await chatbot.askChatbot(q);
    assert.strictEqual(res1.cached, false);
    assert.strictEqual(res1.hits, 1);
    assert.strictEqual(res1.inScope, true);

    // Second query: exact cache hit
    const res2 = await chatbot.askChatbot(q);
    assert.strictEqual(res2.cached, true);
    assert.strictEqual(res2.hits, 2);
    assert.strictEqual(res2.response, res1.response);
  });

  // 7. Caching: Similar Question Cache Hit
  await testAsync('askChatbot hits cache when similar question is asked with different phrasing', async () => {
    global.localStorage.clear();
    // Prime cache with first question
    await chatbot.askChatbot('How does progressive overload work in this app?');

    // Ask similar question
    const res = await chatbot.askChatbot('Explain progressive overload');
    assert.strictEqual(res.cached, true, 'Expected similar question to hit cache');
    assert.ok(res.similarity >= 70, `Expected similarity >= 70, got ${res.similarity}`);
    assert.ok(res.hits >= 2);
  });

  // 8. Cache Statistics & Reset
  test('getChatCacheStats and clearChatCache function properly', () => {
    const statsBefore = chatbot.getChatCacheStats();
    assert.ok(statsBefore.totalEntries > 0);
    assert.ok(statsBefore.totalHits > 0);

    chatbot.clearChatCache();
    const statsAfter = chatbot.getChatCacheStats();
    assert.strictEqual(statsAfter.totalEntries, 0);
    assert.strictEqual(statsAfter.totalHits, 0);
  });

  // 9. RAG Knowledge Base Retrieval
  test('retrieveRagChunks returns top relevant chunks for query', () => {
    const overloadChunks = chatbot.retrieveRagChunks('How does progressive overload work?');
    assert.ok(overloadChunks.length > 0);
    assert.strictEqual(overloadChunks[0].id, 'progressive_overload');

    const aestheticChunks = chatbot.retrieveRagChunks('Explain Steve Reeves golden ratio');
    assert.ok(aestheticChunks.length > 0);
    assert.strictEqual(aestheticChunks[0].id, 'golden_era_ratios');
  });

  // 10. RAG Live User Context & Prompt Building
  test('buildRagPrompt builds comprehensive augmented prompt with retrieved chunks', () => {
    const chunks = chatbot.retrieveRagChunks('progressive overload');
    const userContext = chatbot.buildLiveUserContext();
    const ragPrompt = chatbot.buildRagPrompt('How does progressive overload work?', chunks, userContext);

    assert.ok(ragPrompt.systemPrompt.includes('IronLog AI Coach'));
    assert.ok(ragPrompt.userPrompt.includes('RETRIEVED IRONLOG KNOWLEDGE BASE CONTEXT'));
    assert.ok(ragPrompt.userPrompt.includes('LIVE USER APPLICATION STATE'));
    assert.ok(ragPrompt.userPrompt.includes('Double Progression'));
  });

  // 11. AI Provider Configuration
  test('getAiConfig and setAiConfig persist AI model settings', () => {
    global.localStorage.clear();
    const def = chatbot.getAiConfig();
    assert.strictEqual(def.provider, 'gemini');

    chatbot.setAiConfig({ provider: 'gemini', apiKey: 'test_key_123', model: 'gemini-1.5-flash' });
    const updated = chatbot.getAiConfig();
    assert.strictEqual(updated.apiKey, 'test_key_123');
    assert.strictEqual(updated.model, 'gemini-1.5-flash');
  });

  // 12. Hybrid RAG Retrieval (Fallback & Chunk retrieval)
  await testAsync('retrieveHybridChunks returns local chunks when vector DB is offline', async () => {
    const res = await chatbot.retrieveHybridChunks('chest exercises');
    assert.ok(res.chunks.length > 0);
    assert.strictEqual(res.source, 'local-bm25');
  });

  // 13. Identity and Greeting Response
  test('generateLocalRagResponse properly introduces bot for "Who are you?"', () => {
    const chunks = chatbot.retrieveRagChunks('who are you');
    const res = chatbot.generateLocalRagResponse('Who are you?', chunks);
    assert.match(res, /IronLog AI Coach/);
    assert.match(res, /hypertrophy/);
  });

  // 14. Timeframe and Target Distinction (Prevent false cache hits)
  test('calculateSimilarity rejects cache matches between conflicting timeframes or muscle targets', () => {
    const simTime = chatbot.calculateSimilarity('What is my workout today?', 'wht is my tommrows workout');
    assert.ok(simTime < 0.50, `Expected low similarity between today and tomorrow, got ${simTime}`);

    const simMuscle = chatbot.calculateSimilarity('chest exercises', 'leg exercises');
    assert.ok(simMuscle < 0.50, `Expected low similarity between chest and leg exercises, got ${simMuscle}`);
  });

  // 15. Tomorrow Workout Resolution
  test('generateLocalRagResponse handles tomorrow workout inquiry accurately', () => {
    const chunks = chatbot.retrieveRagChunks('tomorrow workout');
    const res = chatbot.generateLocalRagResponse('wht is my tommrows workout', chunks);
    assert.match(res, /Tomorrow/);
    assert.match(res, /Scheduled Routine/);
  });

  // 16. Day After Tomorrow Workout Resolution & Timeframe Isolation
  test('generateLocalRagResponse and calculateSimilarity accurately handle day after tomorrow', () => {
    const sim = chatbot.calculateSimilarity('What is my tomorrow\'s workout', 'What is my day after tomorrow\'s workout');
    assert.ok(sim < 0.50, `Expected low similarity between tomorrow and day after tomorrow, got ${sim}`);

    const res = chatbot.resolveWorkoutScheduleQuery('What is my day after tomorrow\'s workout');
    assert.ok(res !== null);
    assert.match(res, /The Day After Tomorrow/);
    assert.match(res, /Pull A/);
  });

  // 17. Admin Authentication & Session Management
  test('verifyAdminPasscode and isAdminSession enforce admin restrictions', () => {
    global.sessionStorage.clear();
    assert.strictEqual(chatbot.isAdminSession(), false);

    // Wrong passcode fails
    const wrong = chatbot.verifyAdminPasscode('wrong-pass');
    assert.strictEqual(wrong, false);
    assert.strictEqual(chatbot.isAdminSession(), false);

    // Correct default passcode succeeds
    const ok = chatbot.verifyAdminPasscode('ironlog-admin-2026');
    assert.strictEqual(ok, true);
    assert.strictEqual(chatbot.isAdminSession(), true);

    // Locking ends admin session
    chatbot.lockAdminSession();
    assert.strictEqual(chatbot.isAdminSession(), false);
  });

  // 18. Admin Passcode Customization
  test('setAdminPasscode updates master passcode and enforces minimum length', () => {
    assert.throws(() => chatbot.setAdminPasscode('123'), /at least 6 characters/);

    chatbot.setAdminPasscode('my-new-secret-2026');
    assert.strictEqual(chatbot.verifyAdminPasscode('ironlog-admin-2026'), false);
    assert.strictEqual(chatbot.verifyAdminPasscode('my-new-secret-2026'), true);

    // Reset back to default for subsequent tests
    chatbot.setAdminPasscode('ironlog-admin-2026');
    chatbot.lockAdminSession();
  });

  // 19. Write-Only API Key Behavior (Preserved on empty input)
  test('setAiConfig preserves existing apiKey when updated with non-empty configuration', () => {
    chatbot.setAiConfig({ apiKey: 'secret_gemini_key_xyz', provider: 'gemini' });
    const saved = chatbot.getAiConfig();
    assert.strictEqual(saved.apiKey, 'secret_gemini_key_xyz');

    // Updating provider/model without touching apiKey retains the saved secret
    chatbot.setAiConfig({ provider: 'openai', model: 'gpt-4o-mini' });
    const updated = chatbot.getAiConfig();
    assert.strictEqual(updated.apiKey, 'secret_gemini_key_xyz');
    assert.strictEqual(updated.provider, 'openai');
    assert.strictEqual(updated.model, 'gpt-4o-mini');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();

