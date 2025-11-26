# ZenFlow

A Vite + React yoga sequence builder with integrated Spotify Web Playback SDK support for full-track streaming (Spotify Premium accounts only).

## Prerequisites
- Node.js 18+ (native `fetch` is used by the backend auth server)
- A Spotify Developer application with a Premium account for playback

## Environment
Copy `.env.example` to `.env` and fill in the Spotify app credentials. Two target setups are supported:

### Local development
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5174/api/spotify/callback
FRONTEND_URI=http://127.0.0.1:5173/
SPOTIFY_SCOPES=streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state
ALLOWED_ORIGIN=http://127.0.0.1:5173
PORT=5174
```

### Production
```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://yoga.johnnyautomates.com/api/spotify/callback
FRONTEND_URI=https://yoga.johnnyautomates.com/
SPOTIFY_SCOPES=streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state
ALLOWED_ORIGIN=https://yoga.johnnyautomates.com
PORT=5174
```

Optional frontend override when the API lives on a different origin:
```
VITE_API_BASE_URL=http://127.0.0.1:5174
```
By default the client talks to the same origin (`/api/spotify/*`) and the Vite dev server proxies that path to the backend during local development.

## Running locally
1. Install dependencies with `npm install` (once your environment can reach the npm registry).
2. Start the Spotify auth server:
   ```bash
   npm run server
   ```
3. In a separate terminal, start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open `http://127.0.0.1:5173/`. Use **Connect Spotify** to run the authorization code flow. The backend sets an HttpOnly `spotify_refresh_token` cookie and the frontend refreshes access tokens via `/api/spotify/refresh`.

## Playback flow
- After connecting, the Web Playback SDK spins up a device named **ZenFlow Web Player**. The app automatically transfers playback to it.
- The app refreshes access tokens through the backend so playback stays alive without re-authenticating.
- Premium users hear full tracks; non-Premium accounts see a clear message when playback is unavailable.

## Production routing (Cloudflare Tunnel / Nginx Proxy Manager)
- TLS terminates at `https://yoga.johnnyautomates.com`.
- The root path `/` proxies to the built frontend.
- `/api/spotify/*` proxies to the Node auth server listening on internal port `5174`.
- Ensure the Spotify Dashboard registers `https://yoga.johnnyautomates.com/api/spotify/callback` as a redirect URI and the frontend origin `https://yoga.johnnyautomates.com` is allowed.
