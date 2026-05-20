console.log("MONKEY DEBUG: Pure DOM Extractor Booted!");

async function grabCaptions() {

  console.log(
    "MONKEY DEBUG: Scanning DOM for hidden player data..."
  );

  // Search page scripts
  const scripts = Array.from(
    document.getElementsByTagName('script')
  );

  const targetScript = scripts.find(
    s => s.textContent.includes(
      'var ytInitialPlayerResponse = '
    )
  );

  if (!targetScript) {
    console.log(
      "MONKEY DEBUG: Could not find ytInitialPlayerResponse."
    );
    return;
  }

  try {

    // Extract player JSON
    const rawString =
      targetScript.textContent
        .split('var ytInitialPlayerResponse = ')[1]
        .split('};')[0] + '}';

    const playerResponse = JSON.parse(rawString);

    // Navigate internal caption structures
    const captionTracks =
      playerResponse?.captions
        ?.playerCaptionsTracklistRenderer
        ?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) {

      console.log(
        "MONKEY DEBUG: No captions found."
      );

      return;
    }

    // Build JSON3 endpoint
    const rawUrl = captionTracks[0].baseUrl;

    const json3Url =
      rawUrl +
      (rawUrl.includes('?') ? '&' : '?') +
      'fmt=json3';

    console.log(
      "MONKEY DEBUG: Target acquired. Fetching JSON3..."
    );

    // Fetch caption payload
    const res = await fetch(json3Url);
    const data = await res.json();

    console.log("================ RAW JSON3 ================");
    console.dir(data);

    console.log("================ PARSED LYRICS ================");

    let count = 0;

    if (data.events) {

      data.events.forEach(e => {

        if (e.segs) {

          const text =
            e.segs
              .map(s => s.utf8)
              .join('')
              .replace(/\n/g, ' ')
              .trim();

          if (text) {

            console.log(
              `[Time: ${(e.tStartMs / 1000).toFixed(1)}s] ${text}`
            );

            count++;
          }
        }
      });
    }

    console.log(
      `================ DUMP END: ${count} LINES ================`
    );

    clearInterval(grabInterval);

  } catch (err) {

    console.error(
      "MONKEY DEBUG: Extraction error:",
      err
    );

  }
}

// Initial attempt
grabCaptions();

// Retry loop
let grabInterval = setInterval(grabCaptions, 2000);