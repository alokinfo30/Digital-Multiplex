# Digital-Multiplex
Digital Multiplex Movie Theatre Multi Agent System 


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
Translation API (LibreTranslate)
New Content Types: Documentaries & Podcasts
Full Responsive UI (mobile‑first)
Add authentication checks for certain routes (e.g., saving history).
Integrate TMDB for movies: when user selects 'movie', we can either generate a CrewAI movie or fetch a real movie from TMDB. We'll make a hybrid: if TMDB API key is present, we return real movie details; else fallback to generation.
Use translation API for any content.
User authentication with session management
Persistent storage of user history and preferences
Real movie data from TMDB (with fallback to AI generation)
High‑quality translation via LibreTranslate
Two new content types: Documentaries and Podcasts
Fully responsive UI for both mobile and laptop
LibreTranslate is a free and open-source machine translation API that you can run on your own server. This gives you complete control, privacy, and no usage limits.

Completely Free & Unlimited: Self-hosted, so there are no API quotas or costs.

Accuracy: Translations are powered by the open-source Argos Translate library. Independent testing shows it performs very closely to Google Translate in many scenarios.

Privacy: Your text is translated on your own server, not sent to third-party services like Google or Microsoft.

Control: No rate limits, no surprise costs, and you control which languages are supported

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
Local Development Setup
Follow these steps to run the project on your local machine.

1. Prerequisites:

Python 3.11: Ensure you have Python 3.11 installed and added to your PATH.
Git: For cloning the project.
Docker Desktop: The recommended way to run the LibreTranslate server.
2. Clone the Repository:

bash
git clone <your-repository-url>
cd Digital-Multiplex
3. Create a .env File for Local Development: Create a file named .env in the project's root directory and add the following content. Remember to get your own API keys.

4. Set Up Python Environment and Install Dependencies:

bash
# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
5. Set Up and Migrate the Database:

bash
# Initialize the database and run migrations
flask db init
flask db migrate -m "Initial migration."
flask db upgrade
Note: You only need to run flask db init once for the entire project.

6. Run the LibreTranslate Server: Open a new, separate terminal and run the following Docker command. This will download the LibreTranslate image and run it on port 5001.

bash
docker run --rm -ti -p 5001:5000 -v "%cd%\lt_models":/home/libretranslate/.local libretranslate/libretranslate --load-only en,hi,es,fr,de,zh,ja,ko,pt,ru,it
Leave this terminal running. It may take a few minutes to download language models on the first run.

7. Run the Flask Application: In your original terminal (where the virtual environment is active), run the app:

bash
python run.py
Your application should now be running at http://localhost:5000.








Run Migrations
Initialize database:

bash
flask db init
flask db migrate -m "initial"
flask db upgrade
Or simply run the app once – db.create_all() will create tables.



Install via pip

# Activate your virtual environment
venv\Scripts\activate

# Install LibreTranslate
pip install libretranslate

# Install additional language models (optional)
pip install argostranslate



powershell
# Start with specific languages only (faster startup)
libretranslate --host 0.0.0.0 --port 5001 --load-only en,hi,es,fr,de,zh

# Start with all languages (slower but more options)
libretranslate --host 0.0.0.0 --port 5001

docker run -ti -p 5001:5000 -v D:\project\lt_models:/home/libretranslate/.local libretranslate/libretranslate



Final Step: Run the Application

cd DigitalMultiplex
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate
pip install -r requirements.txt
python run.py
Then open http://localhost:5000 in your browser.



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
