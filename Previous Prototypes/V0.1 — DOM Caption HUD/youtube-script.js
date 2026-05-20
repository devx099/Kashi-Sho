console.log("V0.1 Caption Extractor Active");

function extractCaptions() {
  const captionWindow =
    document.querySelector(".ytp-caption-window-container");

  if (!captionWindow) return;

  const captionText = captionWindow.innerText.trim();

  if (captionText) {
    chrome.runtime.sendMessage({
      type: "LIVE_CAPTION",
      text: captionText
    });
  }
}

// Poll repeatedly for caption changes
setInterval(extractCaptions, 200);