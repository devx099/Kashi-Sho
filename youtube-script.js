console.log("MONKEY DEBUG: Python Transcript Mode");

const urlParams =
  new URLSearchParams(window.location.search);

const videoId = urlParams.get("v");

chrome.runtime.sendMessage({
  type: "REQUEST_TRANSCRIPT",
  senderTab: 0,
  endpoint:
    `https://example-api/transcript/${videoId}`
});

let transcript = [];
let lastLine = "";

chrome.runtime.onMessage.addListener((message) => {

  if (message.type === "TRANSCRIPT_DATA") {

    transcript = message.transcript;

    startSynchronization();

  }

});

function startSynchronization() {

  const video = document.querySelector("video");

  if (!video) return;

  video.addEventListener("timeupdate", () => {

    const currentTime = video.currentTime;

    const line = transcript.find(t =>
      currentTime >= t.start &&
      currentTime <= t.start + t.duration
    );

    const text = line ? line.text : "";

    if (text !== lastLine) {

      lastLine = text;

      chrome.runtime.sendMessage({
        type: "SYNC_UPDATE",
        text
      });

    }

  });

}