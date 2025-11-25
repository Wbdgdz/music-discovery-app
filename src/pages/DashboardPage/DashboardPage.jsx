import { useEffect } from 'react';
import { fetchUserTopArtists } from '../../api/spotify-me.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';

function DashboardPage() {
  const { token, checking } = useRequireToken();

  useEffect(() => {
    if (checking || !token) return;
    let active = true;
    (async () => {
      const { data, error } = await fetchUserTopArtists(token, 5, 'short_term');
      if (!active) return;
      if (error) {
        console.error('Top artists error:', error);
        return;
      }
      console.log('Top artists raw data:', data);
      if (data?.items?.length) {
        console.log('First top artist:', data.items[0]);
      }
    })();
    return () => { active = false; };
  }, [token, checking]);

  return (
    <section>
      <h1>Dashboard</h1>
      {/* Data logging in console for verification */}
    </section>
  );
}

export default DashboardPage;
