import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// import { Resend } from 'resend'; // Uncomment for production

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

const defaultDevOrigin = 'http://127.0.0.1:5173';
const devAllowedOrigins = (process.env.DEV_ALLOWED_ORIGINS
  ? process.env.DEV_ALLOWED_ORIGINS.split(',')
  : [process.env.DEV_ALLOWED_ORIGIN || defaultDevOrigin])
  .map((origin) => origin.trim())
  .filter(Boolean);

// Always allow both localhost and 127.0.0.1 for local dev unless explicitly overridden
['http://localhost:5173', defaultDevOrigin].forEach((origin) => {
  if (!devAllowedOrigins.includes(origin)) devAllowedOrigins.push(origin);
});

const prodAllowedOrigins = (process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [process.env.ALLOWED_ORIGIN])
  .map((origin) => origin?.trim())
  .filter(Boolean);

const allowedOrigins = isProd ? prodAllowedOrigins : devAllowedOrigins;

const SPOTIFY_SCOPES =
  process.env.SPOTIFY_SCOPES ||
  'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

const PORT = process.env.PORT || 5174;
const HOST = process.env.HOST || '127.0.0.1';

// Debug print
console.log('=== AUTH SERVER CONFIG ===');
console.log('Environment:', isProd ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('Frontend URI:', FRONTEND_URI);
console.log('==========================');

const app = express();

// Allow JSON bodies for email endpoint
app.use(express.json());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(cookieParser());

const genState = (len) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return [...Array(len)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// --- SPOTIFY ROUTES ---

app.get('/api/spotify/login', (req, res) => {
  const state = genState(16);
  res.cookie('spotify_auth_state', state, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 300000 });
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
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ code, redirect_uri: SPOTIFY_REDIRECT_URI, grant_type: 'authorization_code' })
    });

    const data = await tokenResp.json();
    if (!tokenResp.ok) return res.redirect(`${FRONTEND_URI}?error=invalid_token`);

    if (data.refresh_token) {
      res.cookie('spotify_refresh_token', data.refresh_token, {
        httpOnly: true, secure: isProd, sameSite: 'lax', path: '/api/spotify', maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }

    const url = new URL(FRONTEND_URI);
    url.searchParams.set('access_token', data.access_token);
    url.searchParams.set('expires_in', data.expires_in);
    res.redirect(url.toString());
  } catch (err) {
    console.error('CALLBACK ERROR:', err);
    res.redirect(`${FRONTEND_URI}?error=server_error`);
  }
});

app.get('/api/spotify/refresh', async (req, res) => {
  const refresh = req.cookies.spotify_refresh_token;
  if (!refresh) return res.status(401).json({ error: 'No refresh token' });

  try {
    const resp = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh })
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);

    if (data.refresh_token) {
      res.cookie('spotify_refresh_token', data.refresh_token, {
        httpOnly: true, secure: isProd, sameSite: 'lax', path: '/api/spotify', maxAge: 30 * 24 * 60 * 60 * 1000
      });
    }
    res.json({ access_token: data.access_token, expires_in: data.expires_in });
  } catch (err) {
    console.error('REFRESH ERROR:', err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/spotify/health', (req, res) => {
  res.json({ ok: true, env: isProd ? 'production' : 'development' });
});

// --- EMAIL ENDPOINT (MOCKED FOR DEVELOPMENT) ---
// const resend = new Resend(process.env.RESEND_API_KEY); // Uncomment for prod

app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  console.log(`[Mock Email Service] Sending to: ${to}`);
  console.log(`[Mock Email Service] Subject: ${subject}`);
  // Using html variable to satisfy linter and for debug clarity
  console.log(`[Mock Email Service] HTML Preview: ${html ? html.substring(0, 50) + '...' : 'None'}`);
  
  // PRODUCTION CODE (Uncomment when you have a Resend/SendGrid key):
  /*
  try {
    const data = await resend.emails.send({
      from: 'Jocelyn Yoga <bookings@yourdomain.com>',
      to: [to],
      subject: subject,
      html: html,
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error });
  }
  */

  return res.status(200).json({ message: 'Email logged to console', success: true });
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});