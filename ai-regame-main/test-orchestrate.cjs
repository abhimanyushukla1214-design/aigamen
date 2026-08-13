async function run() {
  const t1 = await fetch('http://127.0.0.1:3000/api/nexus/orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPrompt: 'A mysterious exploration game on Europa where the player investigates an abandoned research station.' })
  });
  console.log('Status:', t1.status, t1.headers.get('content-type'));
  const res = await t1.json();
  console.log(JSON.stringify(res, null, 2).slice(0, 500) + '...');
}
run();
