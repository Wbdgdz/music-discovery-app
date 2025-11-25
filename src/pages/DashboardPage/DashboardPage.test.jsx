// src/pages/DashboardPage/DashboardPage.test.jsx
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './DashboardPage.jsx';
import * as spotifyMe from '../../api/spotify-me.js';
import { KEY_ACCESS_TOKEN } from '../../constants/storageKeys.js';

const topArtistsResponse = {
  items: [
    { id: 'artist1', name: 'Artist 1', images: [{}, { url: 'https://via.placeholder.com/160' }], genres: ['rock'], external_urls: { spotify: 'https://spotify.com/artist1' } }
  ]
};

const topTracksResponse = {
  items: [
    { id: 'track1', name: 'Track 1', artists: [{ name: 'Artist 1' }], album: { name: 'Album 1', images: [{}, { url: 'https://via.placeholder.com/160' }] }, external_urls: { spotify: 'https://spotify.com/track1' } }
  ]
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => key === KEY_ACCESS_TOKEN ? 'test-token' : null);
    jest.spyOn(spotifyMe, 'fetchUserTopArtists').mockResolvedValue({ data: topArtistsResponse, error: null });
    jest.spyOn(spotifyMe, 'fetchUserTopTracks').mockResolvedValue({ data: topTracksResponse, error: null });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // helper render
  function renderDashboard() {
    return render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  // helper wait for both fetches (no explicit loading UI yet so just wait on cards)
  async function waitForData() {
    await waitFor(() => {
      expect(spotifyMe.fetchUserTopArtists).toHaveBeenCalledTimes(1);
      expect(spotifyMe.fetchUserTopTracks).toHaveBeenCalledTimes(1);
    });
  }

  test('renders dashboard with top artist and track (structure + data)', async () => {
    renderDashboard();

    const heading = await screen.findByRole('heading', { level: 1, name: /dashboard/i });
    expect(heading).toBeInTheDocument();

    await waitForData();

    // artist card assertions
    const artistCardTitle = await screen.findByRole('heading', { level: 3, name: /artist 1/i });
    expect(artistCardTitle).toBeInTheDocument();
    expect(screen.getByAltText('Artist 1')).toHaveAttribute('src', topArtistsResponse.items[0].images[1].url);

    // track card assertions
    const trackCardTitle = await screen.findByRole('heading', { level: 3, name: /track 1/i });
    expect(trackCardTitle).toBeInTheDocument();
    expect(screen.getByAltText('Track 1')).toHaveAttribute('src', topTracksResponse.items[0].album.images[1].url);

    // subtitles (genre + artist names)
    const subtitles = screen.getAllByTestId('subtitle');
    expect(subtitles).toHaveLength(2);
    expect(subtitles[0]).toHaveTextContent(/^rock$/i);
    expect(subtitles[1]).toHaveTextContent(/^artist 1$/i);

    // verify external links present
    const links = screen.getAllByTestId('link');
    expect(links[0]).toHaveAttribute('href', topArtistsResponse.items[0].external_urls.spotify);
    expect(links[1]).toHaveAttribute('href', topTracksResponse.items[0].external_urls.spotify);
  });

  test('shows artist error and still attempts track fetch', async () => {
    jest.spyOn(spotifyMe, 'fetchUserTopArtists').mockResolvedValue({ data: null, error: 'Artist error' });
    renderDashboard();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Artist error');
    await waitFor(() => expect(spotifyMe.fetchUserTopTracks).toHaveBeenCalledTimes(1));
  });

  test('shows track error independently of artist', async () => {
    jest.spyOn(spotifyMe, 'fetchUserTopTracks').mockResolvedValue({ data: null, error: 'Track error' });
    renderDashboard();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Track error');
    await waitFor(() => expect(spotifyMe.fetchUserTopArtists).toHaveBeenCalledTimes(1));
  });

  test('does not fetch when checking is true (line 20 guard)', async () => {
    jest.spyOn(spotifyMe, 'fetchUserTopArtists').mockClear();
    jest.spyOn(spotifyMe, 'fetchUserTopTracks').mockClear();
    // Temporarily mock useRequireToken
    jest.mock('../../hooks/useRequireToken.js', () => ({ useRequireToken: () => ({ token: 'any', checking: true }) }));
    const { default: DashboardPageMock } = await import('./DashboardPage.jsx');
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPageMock />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(spotifyMe.fetchUserTopArtists).not.toHaveBeenCalled();
      expect(spotifyMe.fetchUserTopTracks).not.toHaveBeenCalled();
    });
  });

  test('shows genre fallback dash when no genres (covers line 47 subtitle build)', async () => {
    jest.spyOn(spotifyMe, 'fetchUserTopArtists').mockResolvedValue({ data: { items: [{ id: 'a2', name: 'No Genre Artist', images: [{}, { url: 'https://via.placeholder.com/160' }], genres: [], external_urls: { spotify: 'https://spotify.com/a2' } }] }, error: null });
    renderDashboard();
    await waitForData();
    const subtitles = screen.getAllByTestId('subtitle');
    expect(subtitles[0]).toHaveTextContent(/^—$/); // fallback dash
  });

  test('shows artist names fallback dash when no artists (covers line 48 track subtitle build)', async () => {
    jest.spyOn(spotifyMe, 'fetchUserTopTracks').mockResolvedValue({ data: { items: [{ id: 't2', name: 'No Artist Track', artists: [], album: { name: 'Alb', images: [{}, { url: 'https://via.placeholder.com/160' }] }, external_urls: { spotify: 'https://spotify.com/t2' } }] }, error: null });
    renderDashboard();
    await waitForData();
    const subtitles = screen.getAllByTestId('subtitle');
    expect(subtitles[1]).toHaveTextContent(/^—$/); // fallback dash
  });
});
