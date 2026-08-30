# 🎬 Digital Multiplex — 4DX Virtual Cinema & Private Watch Party Hub

[![Python](https://img.shields.io/badge/Python-3.11.9-blue.svg)](https://www.python.org/downloads/release/python-3119/)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-lightgrey.svg)](https://flask.palletsprojects.com/)
[![CrewAI](https://img.shields.io/badge/CrewAI-Multi--Agent-blueviolet.svg)](https://www.crewai.com/)
[![4DX Cinema](https://img.shields.io/badge/4DX-Multi--Sensory_Haptics-red.svg)](#-4dx-multi-sensory-cinema-experience)
[![Netlify Status](https://api.netlify.com/api/v1/badges/deploy-status)](https://app.netlify.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Digital Multiplex** is a decentralized, high-immersion **4DX Virtual Cinema Theater & Private Watch Party Platform**. It empowers users worldwide to experience movies with realistic **4DX tactile haptic seat rumbles, air blasts, lightning strobes, and fog**, take virtual seats in real-time IMAX auditoriums with active user avatars, or host private VIP screening lounges with friends and family in synchronized playback with live chat and floating emoji reactions across 14+ languages.

---

## 🌟 Key Innovations & Flagship Modules

### 🚀 1. 4DX Multi-Sensory Cinema Experience
* **💥 Physical Haptic Vibration & Sub-Bass Transducer Rumble:**
  - Integrates the **Web Vibration API** (`navigator.vibrate`) for physical tactile feedback on mobile devices and tablets.
  - Synthesizes authentic low-frequency sub-bass tactile pulses (`32Hz - 45Hz`) using the **Web Audio API**.
  - Triggers physical and visual cinema screen & auditorium seat shakes (`.cinema-4dx-shake`).
* **💨 Air Blast & Wind Gust Simulator:** Synthesizes filtered white-noise aerodynamic wind whooshes and projects air currents.
* **⚡ Lightning & Strobe FX:** High-voltage lightning double-strobe flashes over the auditorium hall during climactic action scenes.
* **🌫️ Mist, Fog & Rain Chamber:** Dynamic water vapor mist overlays and particle clouds.
* **🔄 Auto-4DX Sensory Movie Sync:** Automatically synchronizes seat motion, environmental wind, and lighting bursts with on-screen action sequences.
* **📊 4DX Environmental Telemetry HUD:** Real-time HUD showing wind speeds (km/h), haptic vibration levels, mist humidity, and chamber temperatures.

---

### 🏛️ 2. Real-Time Virtual Cinema Auditorium
* **Curved IMAX Laser Screen:** 60FPS high-definition canvas cinema screen playing animated starfields, laser perspective grids, holographic titles, and localized subtitle overlays.
* **🌈 Real-Time Ambilight Ambient Projection:** Dynamically reads on-screen color palettes and projects radiant ambient illumination onto the virtual cinema auditorium walls.
* **💡 "Dim Lights" Theater Mode:** Toggles dark cinema mode for authentic theatrical atmosphere.
* **🔊 Spatial Surround Sound & Dolby Atmos 3D:** Synthesized harmonic sub-bass sweeps and atmospheric acoustic acoustics.
* **Multi-Hall Switcher:** Switch between *Hall 1: 4DX IMAX Laser*, *Hall 2: Cyberpunk Extreme 4DX*, *Hall 3: Dolby Atmos Classic*, and *Private Family Suites*.

---

### 💺 3. Interactive Auditorium Seating with Live Avatars
* Screen-facing virtual audience seating perspective with interactive avatar presence:
  - `Alex 🍿 (You)` (Active User)
  - `Emma ❤️`
  - `David 👓`
  - `Sophia ✨`
  - `Dad 👨‍💼`
  - `Mom 👩‍🍳`
  - `Lucas 🚀`
  - `Mia 🎧`
* **Custom Seat Selection:** Click any seat in the auditorium to move your seat position or customize your personal Avatar Name.

---

### 👑 4. Private Family & Friends Watch Party Suite
* **Secure Private Screening Rooms:** Generate custom room codes (e.g. `#FAMILY-2026`, `#SUITE-778`) and **1-Click Shareable Invite Links**.
* **Exclusive Access:** Only friends and family with your private code/link can enter your VIP suite.
* **🔄 Synchronized Playback (Sync Stream):** Play, pause, seek, and feature film switches synchronize instantly across all connected family and friend devices.
* **💬 Real-Time Live Watch Party Chat:** Whisper chat in real-time with family without interrupting the movie audio.
* **🚀 Floating Emoji Reactions Deck:** Tap ❤️, 🍿, 😱, 👏, 😂, 🔥 to launch floating, glowing reaction emojis with physics over the movie screen.

---

### 🎥 5. Autonomous Multi-Agent Creative Production Hubs
1. **🎥 Cinema Screenplay Studio:** Hollywood-grade loglines, characters, scene scripts `[INT/EXT]`, and formatted dialogue with Web Speech API text-to-speech narration.
2. **🎵 Hit Music Producer & Audio Chime:** Full song lyrics (verses, chorus, bridge, tempo BPM, musical key) with real-time Web Audio API harmonic chord progression synthesis (`[Am] [F] [C] [G]`).
3. **📻 Live 24/7 Radio FM 104.5:** Late-night talk show scripts, RJ banter, live caller dialogues, and station jingles.
4. **📽️ IMAX Doc Vault:** 4K nature, cosmos, and AI docu-series narrator scripts.
5. **🎙️ Podcast Master Studio:** Co-host conversational breakdowns, episode outlines, and show notes markdown export.
6. **🎟️ VIP Seat Matrix & NFC Pass Simulator:** Interactive theater hall seat selector with NFC smart turnstile simulator and turnstile audio chime.
7. **🍿 Concessions & Promo Bar:** Gourmet caramel popcorn, nachos, slushies cart with real-time promo code engine (`MULTIPLEX20` / `POPCORN50` for 20% discount).
8. **🏆 Cinephile Trivia Arena:** 5-question pop-culture quiz with instant scoring and **Multiplex Stars** loyalty wallet.

---

### 🌐 6. Location-Based Auto-Detection & 14+ Languages
* **Auto-Discovery:** Automatically detects user timezone and browser locale to deliver content in native languages:
  - 🇮🇳 **Hindi (हिन्दी)**
  - 🌐 **English (Global)**
  - 🇪🇸 **Spanish (Español)**
  - 🇫🇷 **French (Français)**
  - 🇩🇪 **German (Deutsch)**
  - 🇧🇷 **Portuguese (Português)**
  - 🇸🇦 **Arabic (العربية)**
  - 🇨🇳 **Chinese (中文)**
  - 🇯🇵 **Japanese (日本語)**
  - 🇰🇷 **Korean (한국어)**
  - 🇮🇹 **Italian (Italiano)**
  - 🇷🇺 **Russian (Русский)**
  - 🇳🇱 **Dutch (Nederlands)**
  - 🇹🇷 **Turkish (Türkçe)**

---

### 🛡️ 7. Enterprise Security & Search Engine / AI Ranking (#1 Rank)
* **Strict Security Headers:** Comprehensive CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.
* **Top Search & LLM Discovery:**
  - `public/llms.txt` & `public/llms-full.txt` for ChatGPT Search, Perplexity AI, Claude, and Gemini.
  - `public/robots.txt` & `public/sitemap.xml` with explicit crawler directives.
  - Schema.org JSON-LD structured data (`SoftwareApplication`, `Movie`, `MusicRecording`, `FAQPage`, `BreadcrumbList`).

---

## 🛠️ Technology Stack
* **Frontend:** Vanilla JS (ES6+), HTML5 Canvas 60FPS Engine, Web Audio API Synthesizer, Web Speech API (TTS & STT), Web Vibration API (4DX Haptics), Modern Fluid CSS with Cyberpunk aesthetic.
* **Backend:** Python 3.11.9, Flask 3.0.3, CrewAI Multi-Agent Framework, OpenRouter API (GPT-4o, Mistral 8x22B, Llama 3.3, Claude 3.5), TMDB API, LibreTranslate.
* **Testing:** Standard Python `unittest` test suites covering route integrity, API fallbacks, security headers, and SEO metadata.

---

## 🚀 Quickstart & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/alokinfo30/Digital-Multiplex.git
cd Digital-Multiplex
```

### 2. Set Up Virtual Environment & Dependencies
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Run Automated Tests
```bash
python -m unittest discover tests
```

### 4. Start the Application
```bash
python run.py
```
Open **http://localhost:5000** in your browser to experience the 4DX Virtual Multiplex!

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).

---

© 2026 **Alok Srivastava** | *World-Class Digital Entertainment & 4DX Cinema Technology*
