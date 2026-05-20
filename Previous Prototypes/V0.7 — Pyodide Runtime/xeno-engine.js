console.log("HUD ISOLATED: Initializing native offline tracking matrix...");

let activeVideoId = null;
let titleObserver = null;
let pyodideInstance = null;

// 1. Boot Python (Pyodide is now natively available in our environment!)
const bootOfflinePythonCell = async () => {
  try {
    console.log("HUD ISOLATED: pyodide.js is natively injected. Booting WebAssembly core...");
    pyodideInstance = await loadPyodide({
      // We still tell it where to find the heavy binary .wasm file
      indexURL: chrome.runtime.getURL("pyodide/")
    });
    console.log("HUD ISOLATED: 🐍 Local WebAssembly Python cell loaded seamlessly from disk!");
    
    // Catch up if a video was already playing
    if (activeVideoId) {
      executePythonExtraction(activeVideoId);
    }
  } catch (error) {
    console.error("HUD ISOLATED: ❌ FATAL ERROR - Python core failed to boot natively:", error);
  }
};

// 2. The core data extraction pipeline
const executePythonExtraction = async (videoId) => {
  if (!pyodideInstance) {
    console.log("HUD ISOLATED: ⏳ Python runtime cell warming up...");
    return;
  }

  console.log(`HUD ISOLATED: Handing ID [${videoId}] directly to Python...`);

  try {
    pyodideInstance.globals.set("target_video_id", videoId);
    const processedJsonData = await pyodideInstance.runPythonAsync(`
import json
from pyodide.http import pyfetch

async def compute_xeno_transcript(video_id):
    try:
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        response = await pyfetch(video_url)
        html_content = await response.string()
        
        lookup_marker = '"captionTracks":'
        if lookup_marker not in html_content:
            return json.dumps({"error": "No tracks discovered."})
            
        start_idx = html_content.find(lookup_marker) + len(lookup_marker)
        end_idx = html_content.find(']', start_idx) + 1
        tracks_metadata = json.loads(html_content[start_idx:end_idx])
        
        if not tracks_metadata:
            return json.dumps({"error": "Empty tracking payload."})
            
        base_endpoint_url = tracks_metadata[0]['baseUrl'] + "&fmt=json3"
        
        data_response = await pyfetch(base_endpoint_url)
        raw_json_payload = await data_response.json()
        
        timeline_matrix = []
        if "events" in raw_json_payload:
            for event in raw_json_payload["events"]:
                if "segs" in event:
                    clean_text = "".join([seg["utf8"] for seg in event["segs"]]).replace("\\n", " ").strip()
                    if clean_text:
                        timeline_matrix.append({
                            "time": float(event["tStartMs"]) / 1000.0,
                            "text": clean_text
                        })
                        
        return json.dumps({"success": True, "video_id": video_id, "data": timeline_matrix})
    except Exception as err:
        return json.dumps({"error": str(err)})

import asyncio
asyncio.ensure_future(compute_xeno_transcript(target_video_id))
    `);

    const cleanOutputResult = JSON.parse(processedJsonData);
    console.log("================= PYTHON MATRIX RECONSTRUCTION =================");
    console.dir(cleanOutputResult);
    console.log("================================================================");

  } catch (err) {
    console.error("HUD ISOLATED: Python process execution crash ->", err);
  }
};

// 3. The SPA Mutation Tracker
const checkVideoTransition = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentVideoId = urlParams.get('v');

  if (!currentVideoId || currentVideoId === activeVideoId) return;
  activeVideoId = currentVideoId;

  console.log(`HUD ISOLATED: 🚨 Transition mapping triggered [New ID: ${currentVideoId}]`);
  executePythonExtraction(currentVideoId);
};

// 4. Initialization
bootOfflinePythonCell();

const setupMutationObserver = () => {
  checkVideoTransition();
  const targetTitleNode = document.querySelector('title');
  if (targetTitleNode) {
    titleObserver = new MutationObserver(() => {
      checkVideoTransition();
    });
    titleObserver.observe(targetTitleNode, { childList: true });
    console.log("HUD ISOLATED: ✅ Mutation tripwire bound to page tracking headers.");
  } else {
    setTimeout(setupMutationObserver, 200);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupMutationObserver);
} else {
  setupMutationObserver();
}