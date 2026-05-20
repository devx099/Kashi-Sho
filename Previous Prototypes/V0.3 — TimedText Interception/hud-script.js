console.log("MONKEY DEBUG: HUD Script Injected");

let hud = document.getElementById("yt-lyrics-hud");

if (!hud) {

  hud = document.createElement("div");
  hud.id = "yt-lyrics-hud";

  hud.style.position = "fixed";
  hud.style.bottom = "50px";
  hud.style.left = "50px";
  hud.style.background = "purple";
  hud.style.color = "white";
  hud.style.padding = "20px";
  hud.style.zIndex = "2147483647";

  hud.innerText = "HUD WAITING FOR DATA...";

  document.body.appendChild(hud);
}

chrome.runtime.onMessage.addListener((message) => {

  if (message.type === "UPDATE_HUD") {

    console.log(
      "MONKEY DEBUG: HUD received text:",
      message.text
    );

    hud.innerText = message.text;
  }
});