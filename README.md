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




Project Structure

```
DigitalMultiplex/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── model_manager.py
│   ├── agents.py
│   ├── tasks.py
│   ├── crew.py
│   └── utils.py
├── templates/
│   └── index.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── data/
│   └── .gitkeep
├── .env
├── .gitignore
├── requirements.txt
├── run.py
└── README.md

Model Manager

module centralizes OpenRouter client setup, model fallback, and agent‑specific model selection.
,

We create four agents, each with a specific role and backstory, and assign them different models.


Each task describes what the agent should produce.


We create a MultiplexCrew class that orchestrates the entire content generation pipeline, including asynchronous handling (using threading to run multiple crews in parallel if needed).

Build the Flask Application (main.py)
This handles web routes, serves the frontend, and manages asynchronous generation requests.



Frontend – JavaScript (static/js/script.js)

Handles tab switching, age/language selection, AJAX requests, and polling for async results.




How It Works

1. The user selects an age group, language, and a content type (movie, song, radio).
2. The frontend sends a request to /api/generate, which launches a background thread using CrewAI.
3. The crew orchestrates agents: first a curator may suggest a theme, then the appropriate generator creates the content, and finally a translator converts it if needed.
4. The client polls /api/result/<job_id> until the content is ready, then displays it.
5. The user can switch tabs or change preferences at any time, and new content will be generated asynchronously.

---

Multi‑Model Fallback

The ModelManager automatically tests available models and falls back in case of failures. Each agent uses a dedicated model, but if that model is unavailable, the fallback chain is used (primary → fallbacks).








