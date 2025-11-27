import { useEffect, useState } from 'react';

const useSpotifyPlayer = (token) => {
  const [player, setPlayer] = useState(undefined);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setPaused] = useState(true);
  const [isActive, setActive] = useState(false);
  const [currentTrack, setTrack] = useState(null);
  const [playerError, setPlayerError] = useState(null);

  useEffect(() => {
    if (!token) return;

    let localPlayer;

    const initializePlayer = () => {
      localPlayer = new window.Spotify.Player({
        name: 'ZenFlow Web Player',
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      setPlayer(localPlayer);

      localPlayer.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
      });

      localPlayer.addListener('not_ready', () => {});

      localPlayer.addListener('player_state_changed', (state) => {
        if (!state) return;
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
        setActive(true);
      });

      localPlayer.addListener('initialization_error', ({ message }) => setPlayerError(message));
      localPlayer.addListener('authentication_error', ({ message }) => setPlayerError(message));
      localPlayer.addListener('account_error', () => setPlayerError('Premium account required for playback.'));

      localPlayer.connect();
    };

    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
      if (!document.getElementById('spotify-player-script')) {
        const script = document.createElement('script');
        script.id = 'spotify-player-script';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (localPlayer) {
        localPlayer.disconnect();
      }
    };
  }, [token]);

  return { player, deviceId, isPaused, isActive, currentTrack, playerError };
};

export default useSpotifyPlayer;
