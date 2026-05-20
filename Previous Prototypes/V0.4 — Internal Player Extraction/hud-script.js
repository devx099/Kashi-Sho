let hud = document.getElementById("yt-lyrics-hud");

if (!hud) {

  hud = document.createElement("div");
  hud.id = "yt-lyrics-hud";

  hud.innerText = "Waiting for captions...";

  document.body.appendChild(hud);
}

chrome.runtime.onMessage.addListener((message) => {

  if (message.type === "UPDATE_HUD") {
    hud.innerText = message.text;
  }

});