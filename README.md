# Digital-Multiplex
Digital Multiplex Movie Theatre Multi Agent System 


Digital Multiplex Movie Theatre - Multi-Agent System

Overview

This project creates a Digital Multiplex where users can watch movies, listen to songs, and tune into radio shows – all generated on‑the‑fly using CrewAI and OpenRouter. The system uses multiple AI agents to:

· Curate age‑appropriate content (Baby, Young Adult, Senior)
· Generate movie synopses, song lyrics, and radio scripts
· Translate content into the user’s preferred language
· Remember user preferences and recommend similar content
· Handle multiple concurrent requests asynchronously

The entire platform is built as a Flask web application with a modern, responsive UI.


User Accounts & Session Management (Flask‑Login)
Database (SQLite/PostgreSQL) for users, history, preferences
Real Movie Data from TMDB API
Translation API (Google Cloud Translation or LibreTranslate)
New Content Types: Documentaries & Podcasts
Full Responsive UI (mobile‑first)
Add authentication checks for certain routes (e.g., saving history).
Integrate TMDB for movies: when user selects 'movie', we can either generate a CrewAI movie or fetch a real movie from TMDB. We'll make a hybrid: if TMDB API key is present, we return real movie details; else fallback to generation.
Use translation API for any content.
User authentication with session management
Persistent storage of user history and preferences
Real movie data from TMDB (with fallback to AI generation)
High‑quality translation via Google Translate
Two new content types: Documentaries and Podcasts
Fully responsive UI for both mobile and laptop


Project Structure

DigitalMultiplex/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── model_manager.py
│   ├── agents.py
│   ├── tasks.py
│   ├── crew.py
│   ├── models.py          # NEW – database models
│   ├── auth.py            # NEW – user authentication
│   ├── tmdb.py            # NEW – TMDB integration
│   ├── translate.py       # NEW – translation API
│   └── utils.py
├── templates/
│   ├── index.html         (modified)
│   ├── login.html         # NEW
│   ├── register.html      # NEW
│   └── profile.html       # NEW
├── static/
│   ├── css/
│   │   └── style.css      (modified)
│   └── js/
│       └── script.js      (modified)
├── data/                  (database file will go here)
├── .env                   (updated)
├── .gitignore
├── requirements.txt       (updated)
├── run.py
└── README.md


Model Manager, module centralizes OpenRouter client setup, model fallback, and agent‑specific model selection.
We create four agents, each with a specific role and backstory, and assign them different models.
Each task describes what the agent should produce.
We create a MultiplexCrew class that orchestrates the entire content generation pipeline, including asynchronous handling (using threading to run multiple crews in parallel if needed).
Build the Flask Application (main.py), This handles web routes, serves the frontend, and manages asynchronous generation requests.
Frontend – JavaScript (static/js/script.js), Handles tab switching, age/language selection, AJAX requests, and polling for async results.


How It Works

1. The user selects an age group, language, and a content type (movie, song, radio).
2. The frontend sends a request to /api/generate, which launches a background thread using CrewAI.
3. The crew orchestrates agents: first a curator may suggest a theme, then the appropriate generator creates the content, and finally a translator converts it if needed.
4. The client polls /api/result/<job_id> until the content is ready, then displays it.
5. The user can switch tabs or change preferences at any time, and new content will be generated asynchronously.



Multi‑Model Fallback

The ModelManager automatically tests available models and falls back in case of failures. Each agent uses a dedicated model, but if that model is unavailable, the fallback chain is used (primary → fallbacks).








