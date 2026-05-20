console.log("MONKEY DEBUG: Child HUD Ready");

let hud = document.getElementById("global-lyrics-hud");

if (!hud) {

  hud = document.createElement("div");
  hud.id = "global-lyrics-hud";

  hud.innerText = "Awaiting synchronization...";

  document.body.appendChild(hud);

}

chrome.runtime.onMessage.addListener((message) => {

  if (message.type === "HUD_UPDATE") {

    hud.innerText = message.text;

    hud.style.opacity = "1";

  }

});