console.log("V0.1 HUD Injected");

let hud = document.getElementById("yt-caption-hud");

if (!hud) {
  hud = document.createElement("div");
  hud.id = "yt-caption-hud";
  hud.innerText = "Waiting for captions...";
  document.body.appendChild(hud);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "LIVE_CAPTION") {
    hud.innerText = message.text;
  }
});