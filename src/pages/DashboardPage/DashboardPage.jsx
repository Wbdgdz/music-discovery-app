import { useEffect, useState } from 'react';
import { fetchUserTopArtists, fetchUserTopTracks } from '../../api/spotify-me.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import SimpleCard from '../../components/SimpleCard/SimpleCard.jsx';
import '../../styles/DashboardPage.css';

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
        <SimpleCard
          imageUrl={topArtist.images?.[1]?.url}
          title={topArtist.name}
          subtitle={topArtist.genres?.length ? `Genres: ${topArtist.genres.join(', ')}` : undefined}
          link={topArtist.external_urls?.spotify}
        />
      )}

      {trackError && <p role="alert">Erreur pistes: {trackError}</p>}
      {!trackError && !topTrack && <p>Chargement de la piste la plus écoutée...</p>}
      {topTrack && (
        <SimpleCard
          imageUrl={topTrack.album?.images?.[1]?.url}
          title={topTrack.name}
          subtitle={topTrack.artists?.length ? `Artistes: ${topTrack.artists.map(a => a.name).join(', ')}` : undefined}
          link={topTrack.external_urls?.spotify}
        />
      )}
    </section>
  );
}

export default DashboardPage;
