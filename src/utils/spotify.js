const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const getLoginUrl = () => `${API_BASE}/api/spotify/login`;

const transferPlaybackToDevice = async (token, deviceId, play = false) => {
  if (!token || !deviceId) return;
  try {
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ device_ids: [deviceId], play }),
    });
  } catch (err) {
    console.error('Failed to transfer playback', err);
  }
};

const parseSpotifyUri = (link) => {
  if (!link) return null;
  const match = link.match(/(playlist|album|track)[/:]([a-zA-Z0-9]+)/);
  if (match) {
    const [, type, id] = match;
    return `spotify:${type}:${id}`;
  }
  return null;
};

const playSpotifyTrack = async (token, deviceId, contextUri) => {
  if (!token || !deviceId || !contextUri) return;

  try {
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ context_uri: contextUri }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error('Spotify Play Error:', err);
  }
};

const fetchSpotifyProfile = async (token) => {
  if (!token) return null;
  try {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Failed to load Spotify profile', e);
    return null;
  }
};

export {
  API_BASE,
  getLoginUrl,
  transferPlaybackToDevice,
  parseSpotifyUri,
  playSpotifyTrack,
  fetchSpotifyProfile,
};
