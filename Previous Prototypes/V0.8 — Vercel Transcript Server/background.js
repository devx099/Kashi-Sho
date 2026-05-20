chrome.runtime.onMessage.addListener(
  async (message, sender) => {

    if (message.type === "REQUEST_TRANSCRIPT") {

      try {

        const response = await fetch(
          `https://your-vercel-app.vercel.app/transcript/${message.videoId}`
        );

        const data = await response.json();

        chrome.tabs.sendMessage(
          sender.tab.id,
          {
            type: "TRANSCRIPT_RESPONSE",
            transcript: data.transcript
          }
        );

      } catch (err) {

        console.error(
          "MONKEY DEBUG: Hosted backend failed",
          err
        );

      }

    }

    if (message.type === "SYNC_UPDATE") {

      chrome.tabs.query({}, (tabs) => {

        tabs.forEach((tab) => {

          chrome.tabs.sendMessage(tab.id, {
            type: "HUD_UPDATE",
            text: message.text
          }).catch(() => {});

        });

      });

    }

});