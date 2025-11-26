import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

// Detect environment
const isProd = process.env.NODE_ENV === 'production';

// Required env vars
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Redirect URIs
const SPOTIFY_REDIRECT_URI = isProd
  ? process.env.SPOTIFY_REDIRECT_URI
  : process.env.DEV_SPOTIFY_REDIRECT_URI || `http://127.0.0.1:5174/api/spotify/callback`;

const FRONTEND_URI = isProd
  ? process.env.FRONTEND_URI
  : process.env.DEV_FRONTEND_URI || `http://127.0.0.1:5173`;

const ALLOWED_ORIGIN = isProd
  ? process.env.ALLOWED_ORIGIN
  : process.env.DEV_ALLOWED_ORIGIN || `http://127.0.0.1:5173`;

const SPOTIFY_SCOPES =
  process.env.SPOTIFY_SCOPES ||
  'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

const PORT = process.env.PORT || 5174;
const HOST = process.env.HOST || '127.0.0.1';

// Debug print
console.log('=== SPOTIFY AUTH SERVER CONFIG ===');
console.log('Environment:', isProd ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('Client ID set:', !!SPOTIFY_CLIENT_ID);
console.log('Redirect URI:', SPOTIFY_REDIRECT_URI);
console.log('Frontend URI:', FRONTEND_URI);
console.log('Allowed Origin:', ALLOWED_ORIGIN);
console.log('=================================');

// Validations
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('ERROR: Missing CLIENT_ID or CLIENT_SECRET');
}

const app = express();

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true
  })
);

app.use(cookieParser());

const genState = (len) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return [...Array(len)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// LOGIN
app.get('/api/spotify/login', (req, res) => {
  const state = genState(16);

  res.cookie('spotify_auth_state', state, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 300000
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state,
    show_dialog: 'true'
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// CALLBACK
app.get('/api/spotify/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = req.cookies.spotify_auth_state;

  if (!state || state !== storedState) {
    return res.redirect(`${FRONTEND_URI}?error=state_mismatch`);
  }

  res.clearCookie('spotify_auth_state');

  try {
    const tokenResp = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const data = await tokenResp.json();

    if (!tokenResp.ok) {
      console.error('TOKEN ERROR:', data);
      return res.redirect(`${FRONTEND_URI}?error=invalid_token`);
    }

    const { access_token, refresh_token, expires_in } = data;

    if (refresh_token) {
      res.cookie('spotify_refresh_token', refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/api/spotify',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    const url = new URL(FRONTEND_URI);
    url.searchParams.set('access_token', access_token);
    url.searchParams.set('expires_in', expires_in);

    res.redirect(url.toString());
  } catch (err) {
    console.error('CALLBACK ERROR:', err);
    res.redirect(`${FRONTEND_URI}?error=server_error`);
  }
});

// REFRESH
app.get('/api/spotify/refresh', async (req, res) => {
  const refresh = req.cookies.spotify_refresh_token;
  if (!refresh) return res.status(401).json({ error: 'No refresh token' });

  try {
    const resp = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh
      })
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);

    if (data.refresh_token) {
      res.cookie('spotify_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/api/spotify',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.json({
      access_token: data.access_token,
      expires_in: data.expires_in
    });
  } catch (err) {
    console.error('REFRESH ERROR:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// HEALTH
app.get('/api/spotify/health', (req, res) => {
  res.json({
    ok: true,
    env: isProd ? 'production' : 'development',
    clientIdSet: !!SPOTIFY_CLIENT_ID,
    redirectUri: SPOTIFY_REDIRECT_URI,
    frontendUri: FRONTEND_URI,
    allowedOrigin: ALLOWED_ORIGIN
  });
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, HOST, () => {
  console.log(`Spotify Auth Server running at http://${HOST}:${PORT}`);
});
