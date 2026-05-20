// Create HUD
let hud = document.getElementById("yt-lyrics-hud");

if (!hud) {
  hud = document.createElement("div");
  hud.id = "yt-lyrics-hud";
  hud.innerText = "Waiting for music...";
  document.body.appendChild(hud);
}

// Listen for lyric broadcasts
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "DISPLAY_LYRICS") {
    hud.style.display = "block";

    // Format lyrics
    hud.innerHTML = message.lyrics.replace(/\n/g, "<br>");
  }
});