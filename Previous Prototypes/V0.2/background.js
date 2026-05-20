chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "NEW_SONG") {
    fetchLyrics(message.title);
  }
});

async function fetchLyrics(title) {
  try {
    // Free lyrics API
    const response = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(title)}`
    );

    const data = await response.json();

    if (data && data.length > 0) {
      const lyrics =
        data[0].syncedLyrics ||
        data[0].plainLyrics ||
        "No lyrics found.";

      // Broadcast to ALL tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            type: "DISPLAY_LYRICS",
            lyrics: lyrics
          }).catch(() => {
            // Ignore unsupported pages
          });
        });
      });
    }
  } catch (error) {
    console.error("Error fetching lyrics:", error);
  }
}