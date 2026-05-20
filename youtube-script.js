console.log("MONKEY DEBUG: Hosted backend mode");

const params =
  new URLSearchParams(window.location.search);

const videoId = params.get("v");

chrome.runtime.sendMessage({
  type: "REQUEST_TRANSCRIPT",
  videoId
});

let transcript = [];
let currentLine = "";

chrome.runtime.onMessage.addListener((message) => {

  if (message.type === "TRANSCRIPT_RESPONSE") {

    transcript = message.transcript;

    beginRealtimeSync();

  }

});

function beginRealtimeSync() {

  const video = document.querySelector("video");

  if (!video) return;

  video.addEventListener("timeupdate", () => {

    const now = video.currentTime;

    const line = transcript.find(t =>
      now >= t.start &&
      now <= t.start + t.duration
    );

    const text = line
      ? line.text
      : "";

    if (text !== currentLine) {

      currentLine = text;

      chrome.runtime.sendMessage({
        type: "SYNC_UPDATE",
        text
      });

    }

  });

}