import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Minimal .env loader to avoid external dependencies
const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key && !(key in process.env)) process.env[key] = value;
    }
  });
}

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI = 'http://localhost:5174/api/spotify/callback',
  FRONTEND_URI = 'http://localhost:5173/',
  SPOTIFY_SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state',
  ALLOWED_ORIGIN = 'http://localhost:5173',
  PORT = 5174,
} = process.env;

const secureCookies = process.env.NODE_ENV === 'production';

const sendJson = (res, status, data, headers = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...headers,
  });
  res.end(JSON.stringify(data));
};

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, item) => {
    const [key, ...val] = item.trim().split('=');
    if (key) acc[key] = decodeURIComponent(val.join('='));
    return acc;
  }, {});
};

const setCookie = (res, name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push('Secure');
  if (options.path) parts.push(`Path=${options.path}`);
  res.setHeader('Set-Cookie', [...(res.getHeader('Set-Cookie') || []), parts.join('; ')]);
};

const clearCookie = (res, name) => {
  setCookie(res, name, '', { maxAge: 0, path: '/', sameSite: 'Lax', secure: secureCookies, httpOnly: true });
};

const buildCorsHeaders = (req) => {
  const requestOrigin = req.headers.origin;
  const headers = {};
  if (!requestOrigin) return headers;
  if (ALLOWED_ORIGIN === '*' || requestOrigin === ALLOWED_ORIGIN) {
    headers['Access-Control-Allow-Origin'] = requestOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
};

const authorizeUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID || '',
    scope: SPOTIFY_SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    show_dialog: 'true',
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

const handleLogin = (req, res, corsHeaders) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return sendJson(res, 500, { error: 'Missing Spotify client credentials on server.' }, corsHeaders);
  }
  const state = randomUUID();
  setCookie(res, 'spotify_auth_state', state, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: secureCookies,
    path: '/',
    maxAge: 600,
  });
  const loginUrl = `${authorizeUrl()}&state=${state}`;
  res.writeHead(302, { Location: loginUrl, ...corsHeaders });
  res.end();
};

const exchangeToken = async ({ code, refreshToken }) => {
  const body = new URLSearchParams({
    grant_type: refreshToken ? 'refresh_token' : 'authorization_code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });
  if (refreshToken) {
    body.set('refresh_token', refreshToken);
  } else {
    body.set('code', code);
  }

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${text}`);
  }
  return response.json();
};

const handleCallback = async (req, res, corsHeaders) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = parseCookies(req.headers.cookie).spotify_auth_state;

  if (!code || !state || state !== storedState) {
    return sendJson(res, 400, { error: 'Invalid OAuth state or missing code.' }, corsHeaders);
  }

  try {
    const tokenData = await exchangeToken({ code });

    if (tokenData.refresh_token) {
      setCookie(res, 'spotify_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: secureCookies,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    const accessMaxAge = tokenData.expires_in ? Math.max(0, tokenData.expires_in - 60) : 3000;
    setCookie(res, 'spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: secureCookies,
      path: '/',
      maxAge: accessMaxAge,
    });

    const redirectUrl = new URL(FRONTEND_URI);
    redirectUrl.searchParams.set('access_token', tokenData.access_token);
    redirectUrl.searchParams.set('expires_in', String(tokenData.expires_in || 3600));
    res.writeHead(302, { Location: redirectUrl.toString(), ...corsHeaders });
    res.end();
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Failed to complete Spotify authorization.' }, corsHeaders);
  }
};

const handleRefresh = async (req, res, corsHeaders) => {
  const cookies = parseCookies(req.headers.cookie);
  const refreshToken = cookies.spotify_refresh_token;
  if (!refreshToken) {
    return sendJson(res, 401, { error: 'Missing refresh token. Please connect Spotify again.' }, corsHeaders);
  }
  try {
    const tokenData = await exchangeToken({ refreshToken });
    const accessMaxAge = tokenData.expires_in ? Math.max(0, tokenData.expires_in - 60) : 3000;
    setCookie(res, 'spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: secureCookies,
      path: '/',
      maxAge: accessMaxAge,
    });
    sendJson(res, 200, {
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    }, corsHeaders);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Unable to refresh Spotify token.' }, corsHeaders);
  }
};

const handleLogout = (req, res, corsHeaders) => {
  clearCookie(res, 'spotify_refresh_token');
  clearCookie(res, 'spotify_access_token');
  clearCookie(res, 'spotify_auth_state');
  sendJson(res, 200, { success: true }, corsHeaders);
};

const server = createServer(async (req, res) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': corsHeaders['Access-Control-Allow-Origin'] || '*',
      'Access-Control-Allow-Credentials': corsHeaders['Access-Control-Allow-Credentials'] || 'false',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.url.startsWith('/api/spotify/login') && req.method === 'GET') {
    return handleLogin(req, res, corsHeaders);
  }
  if (req.url.startsWith('/api/spotify/callback') && req.method === 'GET') {
    return handleCallback(req, res, corsHeaders);
  }
  if (req.url.startsWith('/api/spotify/refresh') && req.method === 'GET') {
    return handleRefresh(req, res, corsHeaders);
  }
  if (req.url.startsWith('/api/spotify/logout') && req.method === 'POST') {
    return handleLogout(req, res, corsHeaders);
  }

  sendJson(res, 404, { error: 'Not found' }, corsHeaders);
});

server.listen(PORT, () => {
  console.log(`Spotify auth server listening on ${PORT}`);
});
