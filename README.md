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
The easiest way to start the application is to use the provided batch script. It will handle starting both the LibreTranslate server (via Docker) and the Flask web application.

**Before you start:** Make sure **Docker Desktop is running**.

1.  **Run the Start Script**:
    In your terminal (where the virtual environment is active), simply run:
    ```bash
    .\start_all.bat
    ```
    This will open two new terminal windows: one for the LibreTranslate Docker container and one for the Flask application.

2.  **Access the Application**:
    Your application will be available at **http://localhost:5000**. The translation server will be at `http://localhost:5001`.

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
├── start_all.bat         # Windows batch script to start all local services
└── README.md             # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to open issues, submit pull requests, or suggest improvements.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
