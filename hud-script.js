chrome.runtime.onMessage.addListener((message) => {

  if (message.type === "HUD_UPDATE") {

    const hud =
      document.getElementById("global-lyrics-hud");

    if (hud) {
      hud.innerText = message.text;
    }

  }

});