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