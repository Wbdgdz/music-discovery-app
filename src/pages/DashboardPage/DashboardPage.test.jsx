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

  test('renders top artist and top track', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    // title
    expect(await screen.findByRole('heading', { level: 1, name: /dashboard/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(spotifyMe.fetchUserTopArtists).toHaveBeenCalledTimes(1);
      expect(spotifyMe.fetchUserTopTracks).toHaveBeenCalledTimes(1);
    });

    // artist card
    const artistTitle = await screen.findByRole('heading', { level: 3, name: /artist 1/i });
    expect(artistTitle).toBeInTheDocument();
    expect(screen.getByAltText('Artist 1')).toHaveAttribute('src', topArtistsResponse.items[0].images[1].url);
    const subtitles = await screen.findAllByTestId('subtitle');
    expect(subtitles[0]).toHaveTextContent(/genres: rock/i);

    // track card
    const trackTitle = await screen.findByRole('heading', { level: 3, name: /track 1/i });
    expect(trackTitle).toBeInTheDocument();
    expect(screen.getByAltText('Track 1')).toHaveAttribute('src', topTracksResponse.items[0].album.images[1].url);
    expect(subtitles[1]).toHaveTextContent(/artistes: artist 1/i);
  });

  test('displays artist fetch error', async () => {
    jest.spyOn(spotifyMe, 'fetchUserTopArtists').mockResolvedValue({ data: null, error: 'Artist error' });
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    );
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Artist error');
  });

  test('displays track fetch error', async () => {
    jest.spyOn(spotifyMe, 'fetchUserTopTracks').mockResolvedValue({ data: null, error: 'Track error' });
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    );
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Track error');
  });
});
