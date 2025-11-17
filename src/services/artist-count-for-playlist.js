import { fetchPlaylistById } from "../api/spotify-playlists.js";

/**
 * Count how many times each artist appears in a playlist.
 * @param {string} token - Spotify access token
 * @param {string} playlistId - Spotify playlist ID
 * @returns {Promise<Record<string, number>|undefined>} Map of artist name -> count, or undefined on failure
 */
export async function artistCountForPlaylist(token, playlistId) {
  try {
    const { data } = await fetchPlaylistById(token, playlistId);

    // If no data returned, simply return an empty object
    if (!data || !data.tracks || !Array.isArray(data.tracks.items)) {
      return {};
    }

    const counts = {};

    for (const item of data.tracks.items) {
      const artists = item?.track?.artists || [];
      for (const a of artists) {
        const name = a?.name;
        if (!name) continue;
        counts[name] = (counts[name] || 0) + 1;
      }
    }

    return counts;
  } catch (err) {
    console.error("Error fetching playlist for artist count:", err);
    return undefined;
  }
}
