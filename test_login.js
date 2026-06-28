async function testLogin() {
  const baseUrl = 'https://fee-collection-app.vercel.app';
  
  // 1. Get CSRF token
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  
  const setCookieHeader = csrfRes.headers.get('set-cookie');
  let cookieHeader = '';
  if (setCookieHeader) {
    cookieHeader = setCookieHeader; // in Node 18+ fetch, it returns a comma-separated string of cookies
  }

  // 2. Perform login
  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieHeader,
      'User-Agent': 'node-fetch'
    },
    body: new URLSearchParams({
      email: 'test1@gmail.com',
      password: 'password123',
      csrfToken: csrfToken,
      json: 'true'
    }).toString()
  });

  const text = await loginRes.text();
  console.log("Status:", loginRes.status);
  console.log("Response:", text);
}

testLogin().catch(console.error);
