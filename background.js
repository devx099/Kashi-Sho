// ==========================================================================
// KASHI-SHO ROUTER (background.js)
// ==========================================================================

// 1. THE MEMORY BANK
// This variable holds the current lyric so we never lose it when switching tabs.
let currentLyricsState = ""; 

// 2. THE LIVE LISTENER
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "UPDATE_LYRICS") {
    
    // Save the exact text to our memory bank the second YouTube sends it
    currentLyricsState = message.text; 

    // Find the exact tab you are currently looking at
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        // Forward the skinny payload!
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "RENDER_HUD", 
          text: currentLyricsState 
        }).catch(() => {
          // Silently fail if looking at a restricted tab (like chrome:// settings)
        });
      }
    });
  }
});

// ==========================================================================
// 3. THE STALE TAB FIX (Fires every time you click a different tab)
// ==========================================================================
chrome.tabs.onActivated.addListener((activeInfo) => {
  // activeInfo.tabId is the exact ID of the tab you just clicked on
  
  // Push whatever is currently stored in our memory bank to the new tab!
  chrome.tabs.sendMessage(activeInfo.tabId, { 
    action: "RENDER_HUD", 
    text: currentLyricsState 
  }).catch(() => {
    // Silently fail if you switch to a restricted page like chrome://settings
  });
});