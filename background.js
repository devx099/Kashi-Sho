console.log("MONKEY DEBUG: Background relay active.");

let latestLine = "";
let latestTimestamp = 0;

// Parent tab pushes synchronized updates
chrome.runtime.onMessage.addListener((message, sender) => {

  if (message.type === "SYNC_UPDATE") {

    latestLine = message.text;
    latestTimestamp = message.timestamp;

    console.log(
      "MONKEY DEBUG: Parent pushed sync ->",
      latestLine
    );

    broadcastToChildren({
      type: "HUD_UPDATE",
      text: latestLine,
      timestamp: latestTimestamp
    });
  }

});

// Broadcast to all synchronized children
function broadcastToChildren(payload) {

  chrome.tabs.query({}, (tabs) => {

    tabs.forEach((tab) => {

      chrome.tabs.sendMessage(tab.id, payload)
        .catch(() => {});

    });

  });

}