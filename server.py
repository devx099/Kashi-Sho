from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi

app = FastAPI()

# The VIP Pass: Allows your Chrome Extension to talk to this local server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/captions")
def get_captions(videoID: str):
    try:
        # 1. Initialize the API object
        ytt_api = YouTubeTranscriptApi()

        # 2. Fetch the master list of all available transcripts
        transcript_list = ytt_api.list(videoID)

        try:
            # 3. Try to find English first
            transcript = transcript_list.find_transcript(['en'])
        except:
            # 4. If no English, just grab the first available native language!
            transcript = list(transcript_list)[0]

        # 5. Fetch the transcript and convert it to the JSON dictionary array
        fetched_transcript = transcript.fetch()
        raw_json_data = fetched_transcript.to_raw_data()

        return {"success": True, "data": raw_json_data}

    except Exception as e:
        # Graceful failure if the video truly has zero subtitles
        return {"success": False, "error": str(e)}