// ==========================================================================
// KASHI-SHO BRAIN (Runs ONLY on youtube.com/watch pages)
// ==========================================================================

let currentVideoId = "";
let syncInterval = null;
let timelineMatrix = [];
let lastBroadcastedText = ""; // Tracks the current UI text to prevent spamming Chrome's message bus

// --------------------------------------------------------------------------
// 1. DATA EXTRACTION & FORMATTING ENGINE
// --------------------------------------------------------------------------
const executeExtraction = async (videoId) => {
  console.log(`[Kashi-Sho] Fetching lyrics for ${videoId}...`);
  
  // Clear old states and kill running intervals to prevent memory leaks/ghosts
  if (syncInterval) clearInterval(syncInterval);
  timelineMatrix = []; 
  lastBroadcastedText = ""; // <--- THIS IS THE CULPRIT

  // UX Feedback: Show loading state instantly on all tabs
  chrome.runtime.sendMessage({ action: "UPDATE_LYRICS", text: "🔍 Searching for lyrics..." });
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/captions?videoID=${videoId}`);
    const result = await response.json();
    
    // UX Feedback: Handle videos with no captions gracefully
    if (!result.success) {
        console.log("[Kashi-Sho] No captions exist for this video.");
        chrome.runtime.sendMessage({ action: "UPDATE_LYRICS", text: "🚫 This music has no subtitles..." });
        return; 
    }

    // Map the JSON array into timeline windows and format newline characters for cascading indents
    timelineMatrix = result.data.map(item => {
      const lines = item.text.trim().split('\n');
      const formattedHTML = lines.map((line, index) => {
        if (index === 0) return line;
        return `<span style="display: inline-block; margin-left: 30px; opacity: 0.85;">${line}</span>`;
      }).join('<br>');

      return {
        text: formattedHTML,
        start: parseFloat(item.start),
        end: parseFloat(item.start) + parseFloat(item.duration)
      };
    });

    // Boot up the synchronization loop for the loaded data
    startSyncEngine();
    
  } catch (err) {
    console.error("[Kashi-Sho] Engine Failure. Is Python running?", err);
    chrome.runtime.sendMessage({ action: "UPDATE_LYRICS", text: "⚠️ Cannot connect to Python Server" });
  }
};

// --------------------------------------------------------------------------
// 2. REAL-TIME MEDIA SYNCHRONIZATION LOOP
// --------------------------------------------------------------------------
const startSyncEngine = () => {
  if (syncInterval) clearInterval(syncInterval);

  syncInterval = setInterval(() => {
    // DEFENSE 1: The Ad Shield
    if (document.querySelector('.ad-showing')) {
      const adText = "🎵 Ad playing... waiting for the music 🎵";
      if (lastBroadcastedText !== adText) {
        chrome.runtime.sendMessage({ action: "UPDATE_LYRICS", text: adText });
        lastBroadcastedText = adText; 
      }
      return; 
    }

    // DEFENSE 2: The Ghost Video Fix
    const video = document.querySelector('video');
    if (!video) return;

    const currentTime = video.currentTime;
    let activeText = "";

    // The Window Intersection Logic
    for (let i = 0; i < timelineMatrix.length; i++) {
      const lyric = timelineMatrix[i];
      if (currentTime >= lyric.start && currentTime <= lyric.end) {
        activeText = lyric.text;
        break; 
      }
      if (currentTime < lyric.start) break; 
    }

    // =======================================================
    // THE NEW FEATURE: THE INTRO DETECTOR
    // =======================================================
    if (activeText === "" && timelineMatrix.length > 0) {
      // If we are before the very first lyric of the song...
      if (currentTime < timelineMatrix[0].start) {
        activeText = "✨ Kashi-Sho is waiting for the drop... ✨"; 
      }
    }
    // =======================================================

    // BROADCAST BRIDGE
    if (activeText !== lastBroadcastedText) {
      chrome.runtime.sendMessage({ action: "UPDATE_LYRICS", text: activeText });
      lastBroadcastedText = activeText;
    }
  }, 250); 
};

// --------------------------------------------------------------------------
// 3. SINGLE PAGE APPLICATION (SPA) WATCHER
// --------------------------------------------------------------------------
const startObserver = () => {
  const observer = new MutationObserver(() => {
    const params = new URLSearchParams(window.location.search);
    const newVideoId = params.get('v');
    
    // Reboot the matrix entirely if a new video slug is detected in the URL
    if (newVideoId && newVideoId !== currentVideoId) {
      currentVideoId = newVideoId;
      executeExtraction(currentVideoId);
    }
  });
  
  // Track YouTube's hidden title node to notice background transitions
  const titleNode = document.querySelector('title');
  if (titleNode) observer.observe(titleNode, { childList: true });
};

// --------------------------------------------------------------------------
// INITIAL COLD START
// --------------------------------------------------------------------------
const initialParams = new URLSearchParams(window.location.search);
if (initialParams.has('v')) {
  currentVideoId = initialParams.get('v');
  executeExtraction(currentVideoId);
}
startObserver();
