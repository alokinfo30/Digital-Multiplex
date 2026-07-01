@echo off
echo ========================================
echo 🧹 Clean Installation of Digital Multiplex
echo ========================================

echo.
echo Installing compatible versions...

REM Core Flask and Web
pip install Flask==2.3.3
pip install Flask-SQLAlchemy==3.0.5
pip install Flask-Login==0.6.2
pip install Flask-Migrate==4.0.5
pip install flask-cors==4.0.0

REM Environment
pip install python-dotenv==1.0.0

REM Data Processing (Pre-built wheels)
pip install numpy==1.24.3 --only-binary :all:
pip install pandas==2.0.3

REM Database
pip install SQLAlchemy==2.0.19

REM Requests
pip install requests==2.32.3

REM LangChain - Compatible versions
pip install langchain==0.1.20
pip install langchain-core==0.1.53
pip install langchain-community==0.0.29
pip install langchain-openai==0.1.0

REM CrewAI
pip install crewai==0.28.8
pip install crewai_tools==0.1.6

REM OpenAI
pip install openai==1.3.0

REM Pydantic
pip install pydantic==2.5.0

REM Instructor
pip install instructor==0.5.2

REM Additional
pip install markdown==3.5.1
pip install bleach==6.1.0
pip install email-validator==2.1.0
pip install beautifulsoup4==4.12.2
pip install apscheduler==3.10.4
pip install typing-extensions==4.8.0

REM Translation (Simplified)
pip install argostranslate==1.6.0

echo.
echo ========================================
echo ✅ Installation complete!
echo ========================================
pause