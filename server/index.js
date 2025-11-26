import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
  FRONTEND_URI,
  SPOTIFY_SCOPES,
  ALLOWED_ORIGIN
} = process.env;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true
  })
);

// -----------------------------------------
// LOGIN ROUTE
// -----------------------------------------
app.get("/api/spotify/login", (req, res) => {
  const redirect = encodeURIComponent(SPOTIFY_REDIRECT_URI);
  const scopes = encodeURIComponent(SPOTIFY_SCOPES);

  const url =
    `https://accounts.spotify.com/authorize?` +
    `client_id=${SPOTIFY_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${redirect}` +
    `&scope=${scopes}`;

  res.redirect(url);
});

// -----------------------------------------
// CALLBACK ROUTE
// -----------------------------------------
app.get("/api/spotify/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET
  });

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    body
  });

  const data = await tokenRes.json();

  if (data.error) {
    return res.status(500).json(data);
  }

  res.cookie("spotify_refresh_token", data.refresh_token, {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "lax"
  });

  return res.redirect(FRONTEND_URI);
});

// -----------------------------------------
// REFRESH ROUTE
// -----------------------------------------
app.get("/api/spotify/refresh", async (req, res) => {
  const refresh = req.cookies.spotify_refresh_token;

  if (!refresh) {
    return res.status(401).json({ error: "No refresh token" });
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh,
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET
  });

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    body
  });

  const data = await tokenRes.json();

  return res.json(data);
});

// -----------------------------------------
// 404 handler AFTER routes
// -----------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// -----------------------------------------
const SERVER_PORT = process.env.PORT || 5174;
const HOST = "127.0.0.1";

app.listen(SERVER_PORT, HOST, () => {
  console.log(`Spotify auth server listening on ${HOST}:${SERVER_PORT}`);
});
