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

  // Fetch top artist
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
      setTopArtist(data?.items?.[0]);
    })();
    return () => { active = false; };
  }, [token, checking]);

  // Fetch top track (removed setTimeout for deterministic timing)
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
      setTopTrack(data?.items?.[0]);
    })();
    return () => { active = false; };
  }, [token, checking]);

  // Build stable subtitles (always return a string so subtitle element always exists once card loads)
  const artistSubtitle = topArtist ? (topArtist.genres?.length ? topArtist.genres.join(', ') : '—') : null;
  const trackSubtitle = topTrack ? (topTrack.artists?.length ? topTrack.artists.map(a => a.name).join(', ') : '—') : null;

  return (
    <section className="dashboard-page" aria-label="Dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">Your top artist and track</p>
      {artistError && <p role="alert">{artistError}</p>}
      {trackError && <p role="alert">{trackError}</p>}
      <div className="dashboard-cards">
        {!artistError && !topArtist && <p role="status">Chargement de l'artiste le plus écouté...</p>}
        {topArtist && (
          <SimpleCard
            imageUrl={topArtist.images?.[1]?.url}
            title={topArtist.name}
            subtitle={artistSubtitle}
            link={topArtist.external_urls?.spotify}
          />
        )}
        {!trackError && !topTrack && <p role="status">Chargement de la piste la plus écoutée...</p>}
        {topTrack && (
          <SimpleCard
            imageUrl={topTrack.album?.images?.[1]?.url}
            title={topTrack.name}
            subtitle={trackSubtitle}
            link={topTrack.external_urls?.spotify}
          />
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
