async function runTests() {
  console.log('--- TESTING ENDPOINTS ---');

  const fetchEndpoint = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      const text = await response.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch (e) {
        body = text.substring(0, 50) + '... (not JSON)';
      }
      console.log(`URL: ${url}`);
      console.log(`Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Body:`, body);
      console.log('-----------------------------------');
    } catch (e) {
      console.error(`Error fetching ${url}:`, e);
    }
  };

  await fetchEndpoint('http://127.0.0.1:3000/api/health');
  await fetchEndpoint('http://127.0.0.1:3000/api/nexus/ai-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Test prompt' })
  });
}

runTests();
