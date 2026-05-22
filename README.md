# Kashi-Sho

Kashi-Sho is a browser extension to display synchronized YouTube lyrics globally across browser tabs in realtime.

> This project accidentally became an exploration of browser behavior, synchronization systems and runtime environments.

It all began with a simple idea for convenience:

```text
"Wouldn't it be nice if we could listen to music on YouTube,
work on other tabs, and still be able to sing along?"
```

Eventually, it evolved into a hybrid browser/backend synchronization architecture...
and an unexpected fight with YouTube and Chrome themselves 😭

And damn, do I say the journey was... something.

Going (or at least trying to go) toe-to-toe with big sophisticated systems like YouTube and Chrome taught me a lot about how browsers actually work...
and how frustrating they can be for developers 😭

Head to the Journey section of this README to find out more.

---

# Features

- Realtime synchronization of lyrics
- A subtle holographic HUD across all your tabs
- Cross-tab realtime lyric propagation
- Localhost-powered transcript retrieval  
  *(Planning to move entirely cloud-based soon 🤞🏻)*

---

# Architecture

The current stable version works using what I would call a:

```text
Parent → Middleman → Children
```

relationship.

```text
YouTube Tab (Parent)
        ↓
Local FastAPI Backend
(youtube-transcript-api)
        ↓
Background Relay Service Worker
        ↓
All Browser Tabs (HUD Children)
```

---

# Installation

## For V0.9 (Latest Stable Version)

### 1. Clone the Repository

```bash
git clone https://github.com/devx099/Kashi-Sho.git
cd Kashi-Sho
```

---

### 2. Install Python Requirements

Make sure Python is installed on your system first.

Then run:

```bash
pip install -r requirements.txt
```

---

### 3. Start the Local FastAPI Server

```bash
uvicorn server:app --reload
```

The local transcript server should now run on:

```text
http://127.0.0.1:8000
```

---

### 4. Load the Extension into Your Browser

Works on Chromium-based browsers like:
- Chrome
- Brave
- Edge
- Opera
- Arc

Steps:

- Open:

```text
chrome://extensions
```

- Enable **Developer Mode**
- Click **Load unpacked**
- Select the extension folder

Done 😭

---

# Journey

This project did NOT progress linearly at all 😭

Every new version came because the last one failed miserably...
and kinda fabulously.

> Note: All previous "failed" versions can be viewed inside the `Previous Prototypes` folder.

What started as:

```text
"We'll just grab the captions from YouTube as they come."
```

slowly evolved into:
- reverse engineering YouTube 😭
- thinking in systems
- Python runtime experiments
- WebAssembly experiments
- distributed synchronization architectures
- little attempts to intercept fetches 👀

---

## V0.1 : DOM Caption HUD

Initial idea:

Let's just select the captions from YouTube as they get displayed.

Easy right?

*sigh*

Yeah... that's what we thought too 😭

### Problem:

Chrome throttles background tabs.

Meaning the moment you switched to another tab, Chrome basically "killed" caption updates because the rendering pipeline stopped updating.

So nothing was getting grabbed anymore.

*(PS: don't blame Chrome too much... it's doing this for your battery optimization 😔)*

---

## V0.2 : LRCLIB Global HUD

So then we thought:

```text
"Well we can just use an API to fetch lyrics for a song right?"
```

Well...
we can.

But synchronization immediately became cursed.

Different YouTube uploads of the same song:
- have different intros
- different outros
- different lengths
- different timestamps
- sometimes entirely different versions

So now the problem became:

```text
"How do you synchronize lyrics properly?"
```

---

## V0.3 : TimedText Interception

Another idea 💡

```text
"YouTube itself has to fetch captions somehow right?"
```

So we thought:
if we use the same path YouTube uses internally...

we win 😎

We would have:
- timestamps
- durations
- proper synchronization
- native timing data

I thought I was a genius.

Neh 😭

Apparently we hit a VERY well-made wall.

Actually...
multiple walls.

### Problems:

- CORS restrictions
- Phantom responses
- Empty successful requests

Sometimes requests looked completely successful...
but returned absolutely nothing useful.

So yeah...
YouTube doesn't just hand over captions to anyone 😅

God I tried so much...

At one point I was literally pretending to be a playback device while sending requests XD

---

## V0.4 : Internal Player Extraction

At this point I thought:

```text
"If I can't make requests...
I'll make YouTube make them for me 😏"
```

The idea was:
YouTube itself already loads captions internally.

So surely they must exist somewhere:
- memory
- runtime state
- internal player objects
- somewhere 😭

Yeah...

I cannot properly convey in words how gullible I was for thinking I could outsmart YouTube that easily.

---

## V0.5 : Parent-Child Relay

This is one version I don't really call "failed."

Because this version introduced the architecture that survives even today.

This became the foundation of everything after it.

The whole:

```text
Parent → Middleman → Children
```

system was born here 😭

So not really a failure.

More like:
a very painful learning experience 😁

---

## V0.6 : Python Transcript Backend

Separately from this project, I had discovered a community-made Python API:

```text
youtube-transcript-api
```

And honestly?

Beautiful ✨

It could fetch:
- captions
- timestamps
- durations

all at once.

### Problem:

Extensions themselves couldn't reliably make those requests.

And then came the question:

```text
"How are we even going to use Python inside a browser extension?"
```

During this phase I also experimented with different JS APIs...

and learned the hard way how unreliable public APIs can be 😭

---

## V0.7 : Pyodide Runtime

One of the wildest phases of the project 😭

Remember when I said:

```text
"How are we going to use Python inside the extension?"
```

Well...

BY RUNNING PYTHON INSIDE THE EXTENSION 😭

Using:
- Pyodide
- WebAssembly
- embedded Python runtimes

we somehow got Python code running INSIDE Chrome itself.

And honestly...
that was insane.

### Problem:

The runtime worked.

The networking absolutely did not 😭

Browser networking restrictions, sockets, extension isolation and runtime limitations immediately jumped us.

Hard.

---

## V0.8 : Vercel Transcript Server

This version got much closer to the current stable architecture.

### Idea:

Host the Python backend on Vercel and let it fetch captions remotely.

### Learning:

```text
YouTube hates cloud servers 😭
```

If you're a local device:
you're mostly fine.

If you're a cloud server:
suddenly YouTube becomes suspicious.

---

## V0.9 : Localhost FastAPI System (Latest)

Current stable architecture.

Runs transcript extraction locally using:
- FastAPI
- youtube-transcript-api
- uvicorn

This finally combined:
- stable transcript retrieval
- synchronization
- distributed messaging
- HUD rendering

into one working system 😭

---

# Future

The biggest next goal is:

```text
move from localhost dependency
→ to something portable and reliable
```

without losing functionality.

Other future goals:
- Publishable Chrome extension
- HUD customizations/themes
- Proper settings panel
- More control over UI and behavior
- Better onboarding
- More bug fixes 😭
