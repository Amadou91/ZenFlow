# ZenFlow

A Vite + React yoga sequence builder with integrated Spotify Web Playback SDK support for full-track streaming (Premium accounts only).

## Prerequisites
- Node.js 18+ (for native `fetch` in the backend server)
- A Spotify Developer application with a Premium account for playback

## Environment
Copy `.env.example` to `.env` and set the values from your Spotify app (the `.env` file lives next to the `package.json` and is loaded by the backend server). If you are not running the backend auth server, you can instead expose the client-side vars shown in the **Frontend-only auth** section below.

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://yoga.johnnyautomates.com/api/spotify/callback
FRONTEND_URI=https://yoga.johnnyautomates.com/
SPOTIFY_SCOPES=streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state
ALLOWED_ORIGIN=https://yoga.johnnyautomates.com
PORT=5174
```

### Frontend-only auth (no backend)
If you prefer to skip the Node auth server and use Spotify's implicit grant flow directly from the browser, build the client with these Vite environment variables instead:

```
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=https://yoga.johnnyautomates.com
```

Notes:
- Set `VITE_SPOTIFY_REDIRECT_URI` to the exact origin/path that should receive the redirect. For local dev you can use `http://localhost:5173` (Vite dev server default). For your production site use `https://yoga.johnnyautomates.com`.
- Register the same redirect URIs in the Spotify app dashboard under **Redirect URIs**. Spotify allows multiple entries, so add both your localhost and production URLs.
- Tokens from the implicit flow expire (typically in 1 hour) and cannot be refreshed without a backend, so reconnect when prompted.

If your frontend is deployed separately from the Node auth server (for example, the API is served on a different port such as `https://yoga.johnnyautomates.com:8080`), set `VITE_API_BASE_URL` when building the client so it points to the public API origin:

```
VITE_API_BASE_URL=https://yoga.johnnyautomates.com:8080
```
Otherwise the client will default to using the same origin as the page, which works when nginx proxies `/api/spotify/*` to the server on its internal port.

Why both the client ID **and** client secret? The backend exchanges the Spotify authorization code for access/refresh tokens, and that exchange requires the secret. Keep the secret in the server-only `.env` file shown above; it is never sent to the browser.

Key Spotify dashboard settings:
- **Redirect URI** must exactly match `SPOTIFY_REDIRECT_URI` (including trailing slash rules). Add `https://yoga.johnnyautomates.com/api/spotify/callback` when registering the app.
- **Allowed front-end origin** should include `https://yoga.johnnyautomates.com/` (ensure the trailing slash if you use one when registering URIs).
- Scopes required: `streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state`.

## Running locally
1. Install dependencies with `npm install` (already vendored in this environment).
2. Start the Spotify auth server:
   ```bash
   npm run server
   ```
3. In a separate terminal, start the Vite dev server pointing to the backend:
   ```bash
   VITE_API_BASE_URL=http://localhost:5174 npm run dev
   ```
4. Open `http://localhost:5173/` in the browser. Use the **Connect Spotify** button to go through the OAuth flow. The backend stores the refresh token in an HttpOnly cookie and refreshes access tokens automatically.

## Playback flow
- After connecting, the Web Playback SDK spins up a device named **ZenFlow Web Player** and the app automatically transfers playback to it.
- Use the **Start Playlist** action in practice mode to trigger full-track playback of the configured playlist/album/track URI.
- Premium users will hear full tracks; non-Premium accounts receive a clear warning and cannot start playback.
