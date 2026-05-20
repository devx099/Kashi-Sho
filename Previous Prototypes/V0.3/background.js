console.log("MONKEY DEBUG: Background Worker Active");

let youtubeTabId = null;

// Catch YouTube caption network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.includes("youtube.com/api/timedtext")) {
      console.log("MONKEY DEBUG: Background caught caption URL!");

      if (details.tabId) {
        youtubeTabId = details.tabId;

        chrome.tabs.sendMessage(details.tabId, {
          type: "FOUND_CAPTION_URL",
          url: details.url
        }).catch(() => {});
      }
    }
  },
  { urls: ["https://*.youtube.com/api/timedtext*"] }
);

// Relay synchronized lines globally
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SYNC_LINE") {

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {

        chrome.tabs.sendMessage(tab.id, {
          type: "UPDATE_HUD",
          text: message.text
        }).catch(() => {});

      });
    });

  }
});