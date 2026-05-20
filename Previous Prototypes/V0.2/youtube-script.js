// Function to grab the video title
function checkSong() {
  const videoTitleElement =
    document.querySelector("#above-the-fold #title h1 yt-formatted-string");

  if (videoTitleElement && videoTitleElement.innerText) {
    const songTitle = videoTitleElement.innerText;

    // Clean up the title
    const cleanTitle = songTitle
      .replace(/\[.*?\]|\(.*?\)/g, "")
      .trim();

    // Send title to background
    chrome.runtime.sendMessage({
      type: "NEW_SONG",
      title: cleanTitle
    });
  }
}

// YouTube uses SPA navigation
setInterval(checkSong, 5000);