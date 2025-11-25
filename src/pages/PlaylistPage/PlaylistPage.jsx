import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildTitle } from '../../constants/appMeta.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { handleTokenError } from '../../utils/handleTokenError.js';
import TrackItem from '../../components/TrackItem/TrackItem.jsx';
import '../PageLayout.css';

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useRequireToken();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Title
  useEffect(() => {
    document.title = buildTitle('Playlist');
  }, []);

  // Fetch playlist by id
  useEffect(() => {
    if (!token) return; // wait for token
    fetchPlaylistById(token, id)
      .then(res => {
        if (res.error) {
          // Redirect if token expired, otherwise set local error
          if (!handleTokenError(res.error, navigate)) {
            setError(res.error);
          }
        } else {
          setPlaylist(res.data);
          // Debug logs
          console.log('Fetched playlist', res.data);
          if (res.data?.tracks?.items?.length) {
            console.log('First track object', res.data.tracks.items[0].track);
          }
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, id, navigate]);

  // Update title when playlist is loaded
  useEffect(() => {
    if (playlist?.name) {
      document.title = buildTitle(playlist.name);
    }
  }, [playlist]);

  if (loading) {
    return (
      <output data-testid="loading-indicator" className="playlist-loading">{`Loading playlist ${id}…`}</output>
    );
  }

  if (error) return <div className="page-container" role="alert">Error: {error}</div>;
  if (!playlist) return <div className="page-container">No playlist found for id {id}</div>;

  const cover = playlist.images?.[0]?.url;
  const tracks = playlist.tracks?.items || [];

  return (
    <section className="playlist-container page-container" aria-labelledby="playlist-title">
      <header className="playlist-header">
        {cover && <img src={cover} alt={`Cover of ${playlist.name}`} className="playlist-cover" />}
        <div className="playlist-meta">
          <h1 id="playlist-title" className="playlist-title page-title">{playlist.name}</h1>
          {playlist.description && (
            <h2 className="playlist-subtitle page-subtitle">{playlist.description}</h2>
          )}
          <p className="playlist-track-count">Tracks: {tracks.length}</p>
          {playlist.external_urls?.spotify && (
            <a
              href={playlist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="playlist-open-link"
            >Open in Spotify</a>
          )}
        </div>
      </header>

      {tracks.length === 0 && <div className="playlist-empty">This playlist has no tracks.</div>}
      {tracks.length > 0 && (
        <ol className="playlist-list">
          {tracks.map(item => item.track && (
            <TrackItem key={item.track.id} track={item.track} />
          ))}
        </ol>
      )}
    </section>
  );
}
