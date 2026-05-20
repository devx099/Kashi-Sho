console.log("MONKEY DEBUG: YouTube Script Active");

let captions = [];
let lastSentText = "INITIAL_FLAG";

// Listen for intercepted caption URLs
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "FOUND_CAPTION_URL") {

    console.log(
      "MONKEY DEBUG: YouTube script received URL. Fetching timeline map..."
    );

    fetchAndParseCaptions(message.url);
  }
});

async function fetchAndParseCaptions(url) {
  try {

    const response = await fetch(url);
    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const textElements = xmlDoc.getElementsByTagName("text");

    captions = Array.from(textElements).map((el) => ({
      start: parseFloat(el.getAttribute("start")),
      dur: parseFloat(el.getAttribute("dur") || "0"),
      text: el.textContent
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .trim()
    }));

    console.log(
      `MONKEY DEBUG: Successfully loaded ${captions.length} lines.`
    );

    setupHardwareClock();

  } catch (err) {
    console.error("MONKEY DEBUG: Parsing error:", err);
  }
}

function setupHardwareClock() {

  const video = document.querySelector("video");
  if (!video) return;

  // Native hardware-backed timing loop
  video.addEventListener("timeupdate", () => {

    if (captions.length === 0) return;

    const currentTime = video.currentTime;

    const currentLine = captions.find(
      (line) =>
        currentTime >= line.start &&
        currentTime <= (line.start + line.dur + 0.3)
    );

    const currentText = currentLine
      ? currentLine.text
      : "";

    if (currentText !== lastSentText) {

      lastSentText = currentText;

      console.log(
        "MONKEY DEBUG: Broadcasting sync line ->",
        currentText
      );

      chrome.runtime.sendMessage({
        type: "SYNC_LINE",
        text: currentText
      });
    }
  });
}