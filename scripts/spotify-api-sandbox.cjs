const { generateAccessToken } = require("./utils.cjs");
// Ensure correct extension for ESM file when required from CJS
const { fetchPlaylistById } = require("../src/api/spotify-playlists.js");

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
};

main();
