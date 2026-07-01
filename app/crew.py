# app/crew.py
import sys
import os
import logging
import json
import threading
from queue import Queue

# Add the current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try to import crewai with error handling
try:
    from crewai import Agent, Task, Crew
    CREWAI_AVAILABLE = True
    print("✅ CrewAI imported successfully")
except ImportError as e:
    print(f"⚠️ CrewAI not available: {e}")
    CREWAI_AVAILABLE = False
    
    # Create dummy classes for fallback
    class Agent:
        def __init__(self, **kwargs):
            self.kwargs = kwargs
    class Task:
        def __init__(self, **kwargs):
            self.kwargs = kwargs
    class Crew:
        def __init__(self, agents=None, tasks=None, verbose=False):
            self.agents = agents or []
            self.tasks = tasks or []
            self.verbose = verbose
        def kickoff(self, inputs=None):
            return "CrewAI not available. Please install: pip install crewai==0.28.8"

# Try to import langchain with error handling
try:
    from langchain_openai import ChatOpenAI
    LANGCHAIN_AVAILABLE = True
except ImportError:
    print("⚠️ LangChain not available")
    LANGCHAIN_AVAILABLE = False

# Import model manager
try:
    from app.model_manager import model_manager
except ImportError:
    print("⚠️ Model manager not available")
    model_manager = None

logger = logging.getLogger(__name__)

class MultiplexCrew:
    def __init__(self):
        self.crewai_available = CREWAI_AVAILABLE
        self.langchain_available = LANGCHAIN_AVAILABLE
        
        if self.crewai_available and self.langchain_available:
            try:
                # Import agents and tasks
                from app.agents import (
                    create_curator_agent,
                    create_movie_generator_agent,
                    create_song_generator_agent,
                    create_radio_generator_agent,
                    create_translator_agent,
                    create_documentary_generator_agent,
                    create_podcast_generator_agent
                )
                from app.tasks import (
                    create_curation_task,
                    create_movie_task,
                    create_song_task,
                    create_radio_task,
                    create_translation_task,
                    create_documentary_task,
                    create_podcast_task
                )
                
                self.curator = create_curator_agent()
                self.movie_gen = create_movie_generator_agent()
                self.song_gen = create_song_generator_agent()
                self.radio_gen = create_radio_generator_agent()
                self.translator = create_translator_agent()
                self.doc_gen = create_documentary_generator_agent()
                self.podcast_gen = create_podcast_generator_agent()
                
                logger.info("✅ MultiplexCrew initialized with all agents")
            except Exception as e:
                logger.error(f"Error initializing agents: {str(e)}")
                self.crewai_available = False
        else:
            logger.warning("⚠️ CrewAI or LangChain not available. Using fallback mode.")

    def _run_crew(self, agents, tasks, inputs):
        if not self.crewai_available or not self.langchain_available:
            return self._fallback_generate(inputs)
        try:
            crew = Crew(agents=agents, tasks=tasks, verbose=0) # Changed to integer
            return crew.kickoff(inputs=inputs)
        except Exception as e:
            logger.error(f"Crew execution error: {str(e)}")
            return self._fallback_generate(inputs)

    def _fallback_generate(self, inputs):
        """Fallback content generation when CrewAI is not available"""
        topic = inputs.get('theme', 'interesting topic')
        age_group = inputs.get('age_group', 'young_adult')
        
        templates = {
            'movie': f"""
🎬 Movie: The Amazing {topic}

🌟 Genre: Adventure/Educational

📖 Synopsis:
A captivating story about {topic} that will inspire and entertain {age_group}s. 
This heartwarming tale follows the journey of discovery and learning.

👥 Main Characters:
- The Protagonist: A curious individual
- The Mentor: A wise guide
- The Friend: A loyal companion

🎯 Moral: 
Every journey teaches us something valuable about ourselves and the world.

⏱️ Runtime: 90 minutes
""",
            'song': f"""
🎵 Song: The {topic} Song

🎶 Genre: Melodic/Pop

🎤 Lyrics:

(Verse 1)
In a world of wonder, we explore,
{topic} is something to adore.
Learning new things every day,
In our own special way.

(Chorus)
Oh, {topic}, oh so bright,
Filling our world with light.
With every step we take,
A new discovery we make.

(Verse 2)
From morning until night,
We learn what's wrong and right.
{topic} shows us the way,
To a brighter, better day.

🎵 Style: Upbeat, melodic, with a catchy chorus
""",
            'radio': f"""
📻 Radio Show: The {topic} Hour

🎙️ Host: DJ Alex

📝 Script:

[OPENING]
Host: "Welcome to The {topic} Hour! I'm your host DJ Alex, and today we're diving into the fascinating world of {topic}."

[SEGMENT 1 - INTERVIEW]
Host: "Today we have a special guest, Dr. Knowledge, who's here to share insights about {topic}."
Guest: "Thank you for having me! {topic} is such an important topic for {age_group}s..."

[SEGMENT 2 - MUSIC BREAK]
Host: "Now let's take a musical break with a song about {topic}."

[SEGMENT 3 - FUN FACTS]
Host: "Did you know? Here are some amazing facts about {topic}..."

[CLOSING]
Host: "That's all for today's show. Join us next time for more exploration of {topic}!"
""",
            'documentary': f"""
📽️ Documentary: The Truth About {topic}

🎯 Topic: {topic}

🎬 Format: Documentary

📋 Outline:

1. Introduction
   - Why {topic} matters today
   - Setting the context

2. Historical Background
   - How {topic} evolved over time
   - Key milestones and discoveries

3. Impact on Society
   - How {topic} affects our daily lives
   - Real-world applications

4. Expert Insights
   - Interviews with specialists
   - Scientific perspectives

5. The Future of {topic}
   - Emerging trends and innovations
   - What to expect in the coming years

6. Conclusion
   - Summary of key takeaways
   - Call to action

🎥 Format: HD Documentary
⏱️ Runtime: 45 minutes
""",
            'podcast': f"""
🎙️ Podcast: Exploring {topic}

🎧 Episode: #1 - The {topic} Journey

📝 Episode Script:

[INTRO MUSIC]
Host: "Welcome to the Exploring {topic} podcast! I'm your host, and today we're going to dive deep into the world of {topic}."

[SEGMENT 1 - INTRODUCTION]
Host: "Why {topic}? It's a question I get asked all the time..."
[Content about why the topic is relevant]

[SEGMENT 2 - DEEP DIVE]
Host: "Let's explore the key aspects of {topic} that everyone should know..."
[Detailed discussion]

[SEGMENT 3 - LISTENER QUESTIONS]
Host: "We received some great questions about {topic}..."
[Q&A segment]

[CLOSING]
Host: "Thanks for listening to Exploring {topic}! Don't forget to subscribe and share this episode."

🎵 Theme Music: Upbeat and engaging
⏱️ Duration: 30 minutes
"""
        }
        
        content_type = inputs.get('content_type', 'movie')
        return templates.get(content_type, templates['movie'])

    def _translate_fallback(self, content, target_lang):
        """Fallback translation when CrewAI is not available"""
        from app.translate import translate_text
        try:
            return translate_text(str(content), target_lang)
        except:
            return content

    def generate_movie(self, age_group, language, theme=None):
        if not self.crewai_available:
            return {
                "type": "movie",
                "theme": theme or "An Exciting Adventure",
                "content": self._fallback_generate({'theme': theme or 'An Exciting Adventure', 'age_group': age_group, 'content_type': 'movie'})
            }
        
        if not theme:
            try:
                curation_task = create_curation_task(self.curator, age_group, language, 'movie')
                curation_crew = Crew(agents=[self.curator], tasks=[curation_task], verbose=0)
                curation_result = curation_crew.kickoff(inputs={
                    "age_group": age_group,
                    "language": language,
                    "content_type": "movie"
                })
                try:
                    curation_data = json.loads(curation_result)
                    theme = curation_data.get('title', 'An exciting adventure')
                except:
                    theme = "An exciting adventure"
            except:
                theme = "An exciting adventure"
        
        movie_task = create_movie_task(self.movie_gen, theme, age_group)
        movie_crew = Crew(agents=[self.movie_gen], tasks=[movie_task], verbose=0)
        movie_content = movie_crew.kickoff(inputs={"theme": theme, "age_group": age_group})
        
        if language and language != 'en':
            try:
                movie_content = self._translate_fallback(movie_content, language)
            except:
                pass
        
        return {
            "type": "movie",
            "theme": theme,
            "content": str(movie_content)
        }

    def generate_song(self, age_group, language, mood=None, genre=None):
        if not self.crewai_available:
            return {
                "type": "song",
                "mood": mood or "happy",
                "genre": genre or "pop",
                "content": self._fallback_generate({'theme': mood or 'happy', 'age_group': age_group, 'content_type': 'song'})
            }
        
        if not mood:
            mood = "happy" if age_group == "baby" else "nostalgic" if age_group == "senior" else "energetic"
        if not genre:
            genre = "nursery" if age_group == "baby" else "classic" if age_group == "senior" else "pop"
        
        song_task = create_song_task(self.song_gen, mood, genre, age_group)
        song_crew = Crew(agents=[self.song_gen], tasks=[song_task], verbose=0)
        song_content = song_crew.kickoff(inputs={"mood": mood, "genre": genre, "age_group": age_group})
        
        if language and language != 'en':
            try:
                song_content = self._translate_fallback(song_content, language)
            except:
                pass
        
        return {
            "type": "song",
            "mood": mood,
            "genre": genre,
            "content": str(song_content)
        }

    def generate_radio(self, age_group, language, theme=None):
        if not self.crewai_available:
            return {
                "type": "radio",
                "theme": theme or "Talk Show",
                "content": self._fallback_generate({'theme': theme or 'Talk Show', 'age_group': age_group, 'content_type': 'radio'})
            }
        
        if not theme:
            theme = "fun talk show" if age_group == "baby" else "classic hits" if age_group == "senior" else "current topics"
        
        radio_task = create_radio_task(self.radio_gen, theme, age_group)
        radio_crew = Crew(agents=[self.radio_gen], tasks=[radio_task], verbose=0)
        radio_content = radio_crew.kickoff(inputs={"theme": theme, "age_group": age_group})
        
        if language and language != 'en':
            try:
                radio_content = self._translate_fallback(radio_content, language)
            except:
                pass
        
        return {
            "type": "radio",
            "theme": theme,
            "content": str(radio_content)
        }

    def generate_documentary(self, age_group, language, theme=None):
        if not self.crewai_available:
            return {
                "type": "documentary",
                "theme": theme or "Nature",
                "content": self._fallback_generate({'theme': theme or 'Nature', 'age_group': age_group, 'content_type': 'documentary'})
            }
        
        if not theme:
            theme = "nature" if age_group == "baby" else "history" if age_group == "senior" else "technology"
        
        doc_task = create_documentary_task(self.doc_gen, theme, age_group)
        doc_crew = Crew(agents=[self.doc_gen], tasks=[doc_task], verbose=0)
        doc_content = doc_crew.kickoff(inputs={"theme": theme, "age_group": age_group})
        
        if language and language != 'en':
            try:
                doc_content = self._translate_fallback(doc_content, language)
            except:
                pass
        
        return {
            "type": "documentary",
            "theme": theme,
            "content": str(doc_content)
        }

    def generate_podcast(self, age_group, language, theme=None):
        if not self.crewai_available:
            return {
                "type": "podcast",
                "theme": theme or "Inspiration",
                "content": self._fallback_generate({'theme': theme or 'Inspiration', 'age_group': age_group, 'content_type': 'podcast'})
            }
        
        if not theme:
            theme = "inspiration" if age_group == "young_adult" else "storytelling"
        
        podcast_task = create_podcast_task(self.podcast_gen, theme, age_group)
        podcast_crew = Crew(agents=[self.podcast_gen], tasks=[podcast_task], verbose=0)
        podcast_content = podcast_crew.kickoff(inputs={"theme": theme, "age_group": age_group})
        
        if language and language != 'en':
            try:
                podcast_content = self._translate_fallback(podcast_content, language)
            except:
                pass
        
        return {
            "type": "podcast",
            "theme": theme,
            "content": str(podcast_content)
        }

    def generate_async(self, content_type, age_group, language, extra=None):
        """Run generation in a separate thread and return a queue"""
        result_queue = Queue()
        
        def target():
            try:
                if content_type == 'movie':
                    result = self.generate_movie(age_group, language, extra.get('theme') if extra else None)
                elif content_type == 'song':
                    result = self.generate_song(
                        age_group, language, 
                        extra.get('mood') if extra else None, 
                        extra.get('genre') if extra else None
                    )
                elif content_type == 'radio':
                    result = self.generate_radio(age_group, language, extra.get('theme') if extra else None)
                elif content_type == 'documentary':
                    result = self.generate_documentary(age_group, language, extra.get('theme') if extra else None)
                elif content_type == 'podcast':
                    result = self.generate_podcast(age_group, language, extra.get('theme') if extra else None)
                else:
                    result = {"error": "Invalid content type"}
                result_queue.put(result)
            except Exception as e:
                logger.error(f"Generation error: {str(e)}")
                result_queue.put({"error": str(e)})
        
        thread = threading.Thread(target=target)
        thread.daemon = True
        thread.start()
        return result_queue