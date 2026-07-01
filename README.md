# Digital Multiplex

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/downloads/release/python-311/)
[![Flask](https://img.shields.io/badge/Flask-2.3-lightgrey.svg)](https://flask.palletsprojects.com/)
[![CrewAI](https://img.shields.io/badge/CrewAI-0.35-blueviolet.svg)](https://www.crewai.com/)
[![Render](https://img.shields.io/badge/Deploy_to-Render-46E3B7.svg)](https://render.com)

## Overview

This project is a **Digital Multiplex**, a dynamic web application where users can get personalized movie recommendations, song lyrics, radio show scripts, documentaries, and podcasts. Content is generated on-the-fly using a sophisticated multi-agent system powered by **CrewAI** and **OpenRouter**.

The system uses a crew of specialized AI agents to curate age-appropriate content, generate creative scripts, and translate text into multiple languages, offering a personalized entertainment experience.

## Features

*   **AI-Powered Content Generation**: Dynamically creates movie synopses, song lyrics, radio shows, documentaries, and podcasts.
*   **User Personalization**: Tailors content based on user's age group (Baby, Young Adult, Senior) and preferred language.
*   **Hybrid Content Model**: Integrates with the **TMDB API** to fetch real movie data, with a fallback to AI generation if TMDB is unavailable or disabled.
*   **Multi-Language Support**: Uses a self-hosted **LibreTranslate** instance for real-time content translation, ensuring privacy and control.
*   **User Authentication**: Secure user registration and login system with persistent sessions (Flask-Login).
*   **Content History**: Logged-in users can view and manage their previously generated content in their profile.
*   **Asynchronous Processing**: Handles long-running AI tasks in the background using Python's `threading` module, preventing UI freezes.
*   **Rate Limiting**: Protects authentication endpoints against brute-force attacks (Flask-Limiter).
*   **Responsive UI**: A clean, mobile-first interface for a seamless experience on any device.

## Architecture

### How It Works

1.  **User Interaction**: The user selects a content type, age group, and language from the frontend.
2.  **API Request**: The frontend sends an asynchronous request to the Flask backend (`/api/generate`).
3.  **Job Creation**: The backend creates a unique job ID and starts a background thread to handle the AI generation task.
4.  **CrewAI Orchestration**: A `MultiplexCrew` is assembled with specialized agents (e.g., `Content Curator`, `Movie Generator`).
5.  **Content Generation**: The crew collaborates to generate the content. This may involve a curator agent first selecting a theme, followed by a generator agent creating the script.
6.  **Polling for Results**: The frontend periodically polls the `/api/result/<job_id>` endpoint until the content is ready.
7.  **Display**: Once completed, the generated content is displayed to the user.

### Multi-Model Fallback

The `ModelManager` provides resilience by automatically testing a list of primary and fallback models from OpenRouter. If a preferred model for an agent is unavailable, the system gracefully falls back to the next available one, ensuring service continuity.

## Getting Started (Local Development)

Follow these steps to run the project on your local machine.

### 1. Prerequisites

*   **Python 3.11**: Ensure you have Python 3.11 installed and added to your system's PATH.
*   **Git**: For cloning the project repository.
*   **Docker Desktop**: Required to run the LibreTranslate server in a container.

### 2. Installation

1.  **Clone the Repository**:
    ```bash
    git clone <your-repository-url>
    cd Digital-Multiplex
    ```
2.  **Set Up Environment**:
    *   Create a `.env` file in the root directory by copying `.env.example`.
    *   Fill in your secret keys for `OPENROUTER_API_KEY` and `TMDB_API_KEY`.
3.  **Create Virtual Environment and Install Dependencies**:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # On Windows
    # source venv/bin/activate  # On macOS/Linux
    
    pip install -r requirements.txt
    ```
4.  **Initialize the Database**:
    ```bash
    flask db init
    flask db migrate -m "Initial migration."
    flask db upgrade
    ```
    *(Note: `flask db init` only needs to be run once for the project. Subsequent deployments or local setups will only need `flask db upgrade`.)*

### 3. Running the Application

1.  **Start the LibreTranslate Server**:
    Open a **new, separate terminal** and run the following Docker command. This will download the required language models and expose the translation server on port 5001.
    ```bash
    docker run --rm -ti -p 5001:5000 -v "%cd%\lt_models":/home/libretranslate/.local libretranslate/libretranslate --load-only en,hi,es,fr,de,zh,ja,ko,pt,ru,it
    ```
    *Leave this terminal running. It may take a few minutes to download language models on the first run.*

2.  **Start the Flask Application**:
    In your original terminal (where the virtual environment is active), run the app:
    ```bash
    python run.py
    ```
    Your application will be available at **http://localhost:5000**.

## Production Deployment on Render

This project is configured for seamless deployment on Render.com using Infrastructure-as-Code via the `render.yaml` file.

### Deployment Steps

1.  **Push to Git**: Ensure all your code, including `render.yaml` and `build.sh`, is pushed to a GitHub or GitLab repository.
2.  **Create Render Blueprint**:
    *   Log in to your Render Dashboard.
    *   Click **New +** > **Blueprint**.
    *   Connect your repository. Render will automatically detect and parse your `render.yaml` file.
3.  **Configure Environment Group**:
    *   Before deploying, create an **Environment Group** named `digital-multiplex-secrets` in your Render dashboard.
    *   Add the following environment variables to this group, using secure values:
        *   `SECRET_KEY` (Generate a strong, random key)
        *   `OPENROUTER_API_KEY`
        *   `TMDB_API_KEY` (If `USE_TMDB` is `True`)
        *   `FLASK_ENV` (Set to `production`)
        *   `DEBUG` (Set to `False`)
        *   `SESSION_COOKIE_SECURE` (Set to `True`)
        *   `SESSION_COOKIE_HTTPONLY` (Set to `True`)
        *   `SESSION_COOKIE_SAMESITE` (Set to `Lax` or `Strict`)
    *   The `render.yaml` will automatically link this group to your web service.
4.  **Deploy**: Click "Apply" or "Create New Blueprint Service". Render will provision a PostgreSQL database, deploy the LibreTranslate server (which will download language models to a persistent disk), and then deploy your Flask web application.

### Render Services Overview

The `render.yaml` file defines three interconnected services:

1.  **PostgreSQL Database (`multiplex-db`)**: A managed PostgreSQL instance for storing user accounts, content history, and preferences.
2.  **LibreTranslate Server (`libretranslate-server`)**: A private Docker service running LibreTranslate. It uses a persistent disk (`lt-models`) to store downloaded language models, ensuring they are not re-downloaded on every deploy.
3.  **Flask Web Application (`digital-multiplex`)**: A Python web service running your Flask application with Gunicorn. It's configured for:
    *   **Automatic Deployments**: `autoDeploy: true` triggers a new deploy on every Git push.
    *   **Health Checks**: A secure `/health` endpoint ensures the application is running correctly.
    *   **Scalability**: Gunicorn workers (`--workers 3`) handle concurrent requests.
    *   **Robustness**: Increased Gunicorn timeout (`--timeout 120`) for long-running AI tasks.
    *   **Logging**: Access and error logs are streamed to Render's dashboard.
    *   **Environment Variables**: Critical configurations are managed via environment variables, including linking to the `digital-multiplex-secrets` Environment Group.

## Project Structure

```
DigitalMultiplex/
├── app/                  # Core application logic
│   ├── __init__.py       # Application factory and extension initialization
│   ├── main.py           # Main routes, API endpoints, and job management
│   ├── auth.py           # User authentication routes and logic
│   ├── models.py         # SQLAlchemy database models (User, History, Preference)
│   ├── crew.py           # CrewAI orchestration, agent/task setup, and fallback generation
│   ├── agents.py         # Definitions for all AI agents
│   ├── tasks.py          # Definitions for all CrewAI tasks
│   ├── model_manager.py  # Manages OpenRouter AI models, fallback, and LLM instantiation
│   ├── tmdb.py           # TMDB API integration for real movie data
│   └── translate.py      # LibreTranslate client for translation services
├── templates/            # Jinja2 HTML templates for the frontend
├── static/               # Static assets: CSS, JavaScript, images
├── data/                 # Local SQLite database file (ignored by Git)
├── .env                  # Local environment variables (ignored by Git)
├── .env.example          # Template for local environment variables
├── .gitignore            # Specifies files/directories to ignore in Git
├── requirements.txt      # Python package dependencies (pinned versions for stability)
├── run.py                # Application entry point
├── build.sh              # Shell script for Render's build process (installs deps, runs migrations)
├── render.yaml           # Infrastructure-as-Code for Render deployment
├── Dockerfile.libretranslate # Dockerfile for the LibreTranslate service
├── start_libretranslate.py # Python script to run LibreTranslate locally (alternative to Docker)
├── start_libretranslate.bat # Windows batch script to run LibreTranslate locally
└── README.md             # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to open issues, submit pull requests, or suggest improvements.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

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
│   ├── base.html          # NEW - Base template
│   ├── components/        # NEW - Reusable components
│   │   ├── header.html
│   │   └── footer.html
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
├── .gitignore             (updated)
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
```
5. Set Up and Migrate the Database:

```bash
# Initialize the database and run migrations
flask db init
flask db migrate -m "Initial migration."
flask db upgrade
```
Note: You only need to run flask db init once for the entire project.

6. Run the LibreTranslate Server: Open a new, separate terminal and run the following Docker command. This will download the LibreTranslate image and run it on port 5001.

```bash
docker run --rm -ti -p 5001:5000 -v "%cd%\lt_models":/home/libretranslate/.local libretranslate/libretranslate --load-only en,hi,es,fr,de,zh,ja,ko,pt,ru,it
```
Leave this terminal running. It may take a few minutes to download language models on the first run.

7. Run the Flask Application: In your original terminal (where the virtual environment is active), run the app:

```bash
python run.py
```
Your application should now be running at http://localhost:5000.

### Production Deployment
This project is configured for deployment on Render via the `render.yaml` file. Simply connect your Git repository to a new Blueprint instance on Render, and it will handle the build and deployment process automatically.

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
