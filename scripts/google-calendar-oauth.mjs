import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';

const configPath = process.argv[2] || '/private/tmp/google-calendar-oauth.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const credentials = config.web || config.installed;
const redirectUri = 'http://127.0.0.1:8787/oauth2callback';
const scope = 'https://www.googleapis.com/auth/calendar.events';

if (!credentials?.client_id || !credentials?.client_secret) {
  throw new Error('OAuth JSON must contain client_id and client_secret.');
}

const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authorizationUrl.search = new URLSearchParams({
  client_id: credentials.client_id,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope,
  access_type: 'offline',
  prompt: 'consent',
  include_granted_scopes: 'true',
  login_hint: 'antaran.health@gmail.com',
}).toString();

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url, redirectUri);
  if (requestUrl.pathname !== '/oauth2callback') {
    response.writeHead(404).end('Not found');
    return;
  }

  const error = requestUrl.searchParams.get('error');
  const code = requestUrl.searchParams.get('code');
  if (error || !code) {
    response.writeHead(400).end(`Google authorization failed: ${error || 'missing code'}`);
    server.close();
    process.exitCode = 1;
    return;
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const payload = await tokenResponse.json();
  if (!tokenResponse.ok || !payload.refresh_token) {
    console.error(`Google token response status: ${tokenResponse.status}`);
    console.error(`Google token response fields: ${Object.keys(payload).join(', ') || 'none'}`);
    if (payload.error) console.error(`Google OAuth error: ${payload.error}`);
    if (payload.error_description) console.error(`Google OAuth detail: ${payload.error_description}`);
    response.writeHead(502).end('Google did not return a refresh token. Check the OAuth consent and try again.');
    server.close();
    process.exitCode = 1;
    return;
  }

  writeFileSync('/private/tmp/google-calendar-refresh-token.txt', payload.refresh_token, { mode: 0o600 });
  response.writeHead(200).end('Authorization complete. You can close this tab.');
  server.close(() => process.exit(0));
});

server.listen(8787, '127.0.0.1', () => {
  console.log('Open this URL in your browser:\n');
  console.log(authorizationUrl.toString());
  console.log('\nWaiting for Google authorization...');
});
