import { useEffect, useState } from 'react';
import { fetchUserTopArtists, fetchUserTopTracks } from '../../api/spotify-me.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import './DashboardPage.css';

function DashboardPage() {
  const { token, checking } = useRequireToken();
  const [topArtist, setTopArtist] = useState(null);
  const [artistError, setArtistError] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [trackError, setTrackError] = useState(null);

  useEffect(() => {
    if (checking || !token) return;
    let active = true;
    (async () => {
      const { data, error } = await fetchUserTopArtists(token, 1, 'short_term');
      if (!active) return;
      if (error) {
        setArtistError(error);
        return;
      }
      const artist = data?.items?.[0];
      setTopArtist(artist || null);
    })();
    return () => { active = false; };
  }, [token, checking]);

  useEffect(() => {
    if (checking || !token) return;
    let active = true;
    (async () => {
      const { data, error } = await fetchUserTopTracks(token, 1, 'short_term');
      if (!active) return;
      if (error) {
        setTrackError(error);
        return;
      }
      const track = data?.items?.[0];
      setTopTrack(track || null);
    })();
    return () => { active = false; };
  }, [token, checking]);

  return (
    <section>
      <h1>Dashboard</h1>
      {artistError && <p role="alert">Erreur artistes: {artistError}</p>}
      {!artistError && !topArtist && <p>Chargement de l'artiste le plus écouté...</p>}
      {topArtist && (
        <div className="top-artist">
          {topArtist.images?.[1] && (
            <img src={topArtist.images[1].url} alt={topArtist.name} className="top-artist-image" />
          )}
          <h2 className="top-artist-name">{topArtist.name}</h2>
          {topArtist.genres?.length > 0 && (
            <p className="top-artist-genres">Genres: {topArtist.genres.join(', ')}</p>
          )}
        </div>
      )}

      {trackError && <p role="alert">Erreur pistes: {trackError}</p>}
      {!trackError && !topTrack && <p>Chargement de la piste la plus écoutée...</p>}
      {topTrack && (
        <div className="top-track">
          {topTrack.album?.images?.[1] && (
            <img src={topTrack.album.images[1].url} alt={topTrack.name} className="top-track-image" />
          )}
          <h2 className="top-track-name">{topTrack.name}</h2>
          {topTrack.artists?.length > 0 && (
            <p className="top-track-artists">Artistes: {topTrack.artists.map(a => a.name).join(', ')}</p>
          )}
          {topTrack.album && <p className="top-track-album">Album: {topTrack.album.name}</p>}
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
