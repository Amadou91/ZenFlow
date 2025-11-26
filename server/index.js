import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { randomUUID } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const envPath = resolve(process.cwd(), '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split(/\r?\n/).forEach(line => {
    if (!line || line.startsWith('#')) return
    const idx = line.indexOf('=')
    if (idx > -1) {
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (key && !(key in process.env)) process.env[key] = value
    }
  })
}

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5174/api/spotify/callback',
  FRONTEND_URI = 'http://127.0.0.1:5173/',
  SPOTIFY_SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state',
  ALLOWED_ORIGIN = 'http://127.0.0.1:5173',
} = process.env

const HOST = '127.0.0.1'
const PORT = process.env.PORT || 5174
const secureCookies = process.env.NODE_ENV === 'production'

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }))

const buildAuthorizeUrl = (state) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID || '',
    scope: SPOTIFY_SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state,
    show_dialog: 'true',
  })
  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

const exchangeToken = async ({ code, refreshToken }) => {
  const body = new URLSearchParams({
    grant_type: refreshToken ? 'refresh_token' : 'authorization_code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
  })

  if (refreshToken) {
    body.set('refresh_token', refreshToken)
  } else {
    body.set('code', code)
  }

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token exchange failed: ${response.status} ${text}`)
  }

  return response.json()
}

app.get('/api/spotify/login', (req, res) => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Missing Spotify client credentials on server.' })
  }

  const state = randomUUID()
  res.cookie('spotify_auth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookies,
    path: '/',
    maxAge: 600_000,
  })

  const loginUrl = buildAuthorizeUrl(state)
  return res.redirect(loginUrl)
})

app.get('/api/spotify/callback', async (req, res) => {
  const { code, state } = req.query
  const storedState = req.cookies.spotify_auth_state

  if (!code || !state || state !== storedState) {
    return res.status(400).json({ error: 'Invalid OAuth state or missing code.' })
  }

  try {
    const tokenData = await exchangeToken({ code })

    if (tokenData.refresh_token) {
      res.cookie('spotify_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: secureCookies,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    res.clearCookie('spotify_auth_state', { path: '/' })

    const redirectUrl = FRONTEND_URI || '/'
    return res.redirect(redirectUrl)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to complete Spotify authorization.' })
  }
})

app.get('/api/spotify/refresh', async (req, res) => {
  const refreshToken = req.cookies.spotify_refresh_token
  if (!refreshToken) {
    return res.status(401).json({ error: 'Missing refresh token. Please connect Spotify again.' })
  }

  try {
    const tokenData = await exchangeToken({ refreshToken })

    if (tokenData.refresh_token) {
      res.cookie('spotify_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: secureCookies,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return res.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Unable to refresh Spotify token.' })
  }
})

app.post('/api/spotify/logout', (req, res) => {
  res.clearCookie('spotify_refresh_token', { path: '/' })
  res.clearCookie('spotify_auth_state', { path: '/' })
  return res.json({ success: true })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(PORT, HOST, () => {
  console.log(`Spotify auth server listening on http://${HOST}:${PORT}`)
})
