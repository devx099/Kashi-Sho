from fastapi import FastAPI
from youtube_transcript_api import YouTubeTranscriptApi

app = FastAPI()

@app.get("/transcript/{video_id}")
def get_transcript(video_id: str):

    try:

        transcript = YouTubeTranscriptApi.get_transcript(
            video_id
        )

        formatted = []

        for line in transcript:

            formatted.append({
                "start": line["start"],
                "duration": line["duration"],
                "text": line["text"]
            })

        return {
            "success": True,
            "transcript": formatted
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }