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





