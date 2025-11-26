import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Resolve project root and load .env there
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const app = express();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5174;

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
  FRONTEND_URI,
  ALLOWED_ORIGIN,
  SPOTIFY_SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state',
} = process.env;

// CORS + cookies
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    clientIdSet: !!SPOTIFY_CLIENT_ID,
    redirectUri: SPOTIFY_REDIRECT_URI,
    frontendUri: FRONTEND_URI,
    allowedOrigin: ALLOWED_ORIGIN,
  });
});

// Helper: random state
const generateRandomString = (length) => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// --- Routes ---

// 1) Login -> Spotify authorize
app.get('/api/spotify/login', (req, res) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    return res.status(500).json({ error: 'Server not configured correctly' });
  }

  const state = generateRandomString(16);

  // Store state in HttpOnly cookie
  res.cookie('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000, // 5 minutes
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state,
    show_dialog: 'true',
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// 2) Callback -> exchange code for tokens
app.get('/api/spotify/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

  if (!code || !state || state !== storedState) {
    return res.redirect(`${FRONTEND_URI}?error=state_mismatch`);
  }

  res.clearCookie('spotify_auth_state');

  try {
    const authHeader = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: new URLSearchParams({
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Spotify Token Error:', data);
      return res.redirect(`${FRONTEND_URI}?error=invalid_token`);
    }

    const { access_token, refresh_token, expires_in } = data;

    if (refresh_token) {
      res.cookie('spotify_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/spotify',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    const redirectUrl = new URL(FRONTEND_URI);
    redirectUrl.searchParams.set('access_token', access_token);
    redirectUrl.searchParams.set('expires_in', String(expires_in));

    res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Callback Server Error:', err);
    res.redirect(`${FRONTEND_URI}?error=server_error`);
  }
});

// 3) Refresh access token using HttpOnly refresh cookie
app.get('/api/spotify/refresh', async (req, res) => {
  const refresh_token = req.cookies ? req.cookies['spotify_refresh_token'] : null;

  if (!refresh_token) {
    return res.status(401).json({ error: 'No refresh token found' });
  }

  try {
    const authHeader = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Refresh Token Error:', data);
      return res.status(response.status).json(data);
    }

    if (data.refresh_token) {
      res.cookie('spotify_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/spotify',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    res.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (err) {
    console.error('Refresh Token Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4) Logout -> clear cookies
app.post('/api/spotify/logout', (req, res) => {
  res.clearCookie('spotify_refresh_token', { path: '/api/spotify' });
  res.clearCookie('spotify_auth_state');
  res.json({ success: true });
});

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, HOST, () => {
  console.log(`Spotify Auth Server running at http://${HOST}:${PORT}`);
});
