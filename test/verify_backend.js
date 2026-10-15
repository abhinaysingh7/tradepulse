// TradePulse — Backend API Verification Test
process.env.AUTO_START = 'false';
process.env.PORT = '5055';
import assert from 'node:assert';
import app from '../server/index.js';

console.log('--- RUNNING TRADEPULSE BACKEND API TESTS ---');

const server = app.listen(5055);
const BASE_URL = 'http://127.0.0.1:5055';

async function runTests() {
  try {
    // Test 1: Health check endpoint
    console.log('Testing GET /api/health...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200 OK');
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok', 'Status should be ok');
    assert.strictEqual(healthData.service, 'TradePulse API');
    assert.strictEqual(typeof healthData.uptime, 'number');
    assert.strictEqual(typeof healthData.hasFinnhubKey, 'boolean');
    assert.strictEqual(healthData.FINNHUB_API_KEY, undefined, 'API key must NEVER be exposed in health response');
    console.log('✓ Test 1: /api/health verified successfully (no secrets exposed).');

    // Test 2: Validation on /api/stocks/quote with missing symbol
    console.log('Testing GET /api/stocks/quote validation...');
    const noSymRes = await fetch(`${BASE_URL}/api/stocks/quote`);
    assert.strictEqual(noSymRes.status, 400, 'Missing symbol should return 400 Bad Request');
    const noSymData = await noSymRes.json();
    assert(noSymData.error.includes('Missing required query parameter'), 'Error should describe missing symbol');
    console.log('✓ Test 2: Quote parameter validation verified.');

    // Test 3: Validation on /api/stocks/quote with invalid symbol format
    const badSymRes = await fetch(`${BASE_URL}/api/stocks/quote?symbol=INVALID_TOO_LONG_12345`);
    assert.strictEqual(badSymRes.status, 400, 'Malformed symbol should return 400');
    console.log('✓ Test 3: Malformed symbol validation verified.');

    // Test 4: Validation on /api/stocks/candles with missing parameters
    console.log('Testing GET /api/stocks/candles validation...');
    const noCandleRes = await fetch(`${BASE_URL}/api/stocks/candles?symbol=AAPL`);
    assert.strictEqual(noCandleRes.status, 400, 'Missing candle params should return 400');
    console.log('✓ Test 4: Candle parameter validation verified.');

    // Test 5: Validation on /api/stocks/search with missing query
    console.log('Testing GET /api/stocks/search validation...');
    const noSearchRes = await fetch(`${BASE_URL}/api/stocks/search`);
    assert.strictEqual(noSearchRes.status, 400, 'Missing search query should return 400');
    console.log('✓ Test 5: Search parameter validation verified.');

    // Test 6: Verify 404 handler for unknown API routes
    console.log('Testing 404 for unknown route...');
    const unknownRes = await fetch(`${BASE_URL}/api/unknown-endpoint`);
    assert.strictEqual(unknownRes.status, 404, 'Unknown API route should return 404');
    console.log('✓ Test 6: 404 handler verified.');

    // Test 7: Behavior when FINNHUB_API_KEY is unset
    if (!process.env.FINNHUB_API_KEY) {
      console.log('Testing unconfigured API key handling...');
      const unconfRes = await fetch(`${BASE_URL}/api/stocks/quote?symbol=AAPL`);
      assert.strictEqual(unconfRes.status, 503, 'Unconfigured API key should return 503 Service Unavailable');
      const unconfData = await unconfRes.json();
      assert(unconfData.error.includes('FINNHUB_API_KEY is not configured'), 'Error should specify missing key');
      console.log('✓ Test 7: Graceful 503 response on missing server key verified.');
    }

    console.log('--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test failure:', err);
  server.close();
  process.exit(1);
});
