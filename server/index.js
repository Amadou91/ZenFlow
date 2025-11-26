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

const app = express();
const PORT = process.env.PORT || 5174;

// Configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const SPOTIFY_SCOPES = process.env.SPOTIFY_SCOPES || 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

// Middleware
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true // Allow cookies to be sent/received
}));
app.use(cookieParser());

// --- Helper Functions ---

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// --- Routes ---

// 1. Login Route: Redirects user to Spotify
app.get('/api/spotify/login', (req, res) => {
  const state = generateRandomString(16);
  const scope = SPOTIFY_SCOPES;

  res.cookie('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300000 // 5 minutes
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: state,
    show_dialog: true
  });

  res.redirect('https://accounts.spotify.com/authorize?' + params.toString());
});

// 2. Callback Route: Exchanges code for tokens
app.get('/api/spotify/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

  if (state === null || state !== storedState) {
    return res.redirect(FRONTEND_URI + '?error=state_mismatch');
  }

  res.clearCookie('spotify_auth_state');

  try {
    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: new URLSearchParams({
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Spotify Token Error:', data);
      return res.redirect(FRONTEND_URI + '?error=invalid_token');
    }

    const { access_token, refresh_token, expires_in } = data;

    // Store Refresh Token in HttpOnly Cookie (Safe from JS)
    if (refresh_token) {
      res.cookie('spotify_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/spotify', // Limit cookie scope to API paths
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }

    // Redirect to Frontend with Access Token (Short-lived, accessible to JS)
    const redirectUrl = new URL(FRONTEND_URI);
    redirectUrl.searchParams.set('access_token', access_token);
    redirectUrl.searchParams.set('expires_in', expires_in);
    
    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Callback Server Error:', error);
    res.redirect(FRONTEND_URI + '?error=server_error');
  }
});

// 3. Refresh Route: Uses HttpOnly cookie to get new Access Token
app.get('/api/spotify/refresh', async (req, res) => {
  const refresh_token = req.cookies ? req.cookies['spotify_refresh_token'] : null;

  if (!refresh_token) {
    return res.status(401).json({ error: 'No refresh token found' });
  }

  try {
    const authHeader = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // If Spotify rotates the refresh token, update the cookie
    if (data.refresh_token) {
      res.cookie('spotify_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/spotify',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    res.json({
      access_token: data.access_token,
      expires_in: data.expires_in
    });

  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Logout Route: Clears cookies
app.post('/api/spotify/logout', (req, res) => {
  res.clearCookie('spotify_refresh_token', { path: '/api/spotify' });
  res.clearCookie('spotify_auth_state');
  res.json({ success: true });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Spotify Auth Server running at http://127.0.0.1:${PORT}`);
});