from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from youtube_transcript_api import (
    YouTubeTranscriptApi
)

app = FastAPI()

# Allow extension requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/transcript/{video_id}")
async def transcript(video_id: str):

    try:

        transcript =
            YouTubeTranscriptApi.get_transcript(
                video_id
            )

        return {
            "success": True,
            "transcript": transcript
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }s