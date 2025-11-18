const { generateAccessToken } = require("./utils.cjs");
// Ensure correct extension for ESM file when required from CJS
const { fetchPlaylistById } = require("../src/api/spotify-playlists.js");
const { artistCountForPlaylist } = require("../src/services/artist-count-for-playlist.js");

// Optionally increase connect timeout for slow networks when no proxy is set
try {
  const undici = require("undici");
  const hasProxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  if (!hasProxy) {
    const agent = new undici.Agent({ connect: { timeout: 30000 } });
    undici.setGlobalDispatcher(agent);
  }
} catch {}

/**
 * Main function to demonstrate fetching a Spotify playlist.
 */
const main = async () => {
  var playlistId = "2IgPkhcHbgQ4s4PdCxljAx";

  const token = await generateAccessToken();

  // fetch playlist by ID
  fetchPlaylistById(token, playlistId)
    .then(({ data }) => {
      // extract track names and artist names
      const tracks = data.tracks.items.map((item) => ({
        trackName: item.track.name,
        artistNames: item.track.artists.map((artist) => artist.name).join(", "),
      }));

      console.log(`Playlist: ${data.name} by ${data.owner.display_name}`);
      console.table(tracks);
    })
    .catch((error) => {
      console.error("Error fetching playlist:", error);
    });

  // compute artist counts and display Top 5
  try {
    const counts = await artistCountForPlaylist(token, playlistId);
    if (counts && Object.keys(counts).length) {
      const top5 = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([artist, count]) => ({ artist, count }));
      console.log("Top 5 artists by occurrences in playlist:");
      console.table(top5);
    } else {
      console.log("No artist counts available (empty playlist or fetch issue).");
    }
  } catch (e) {
    console.error("Error computing artist counts:", e);
  }
};

main();
