# app/crew.py
from crewai import Crew
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
import logging
import json
import threading
from queue import Queue

logger = logging.getLogger(__name__)

class MultiplexCrew:
    def __init__(self):
        self.curator = create_curator_agent()
        self.movie_gen = create_movie_generator_agent()
        self.song_gen = create_song_generator_agent()
        self.radio_gen = create_radio_generator_agent()
        self.translator = create_translator_agent()
        self.doc_gen = create_documentary_generator_agent()
        self.podcast_gen = create_podcast_generator_agent()
        logger.info("MultiplexCrew initialized with all agents")

    def _run_crew(self, agents, tasks, inputs):
        crew = Crew(agents=agents, tasks=tasks, verbose=False)
        return crew.kickoff(inputs=inputs)

    def _translate(self, content, target_lang):
        if not target_lang or target_lang == 'en':
            return content
        task = create_translation_task(self.translator, content, target_lang)
        crew = Crew(agents=[self.translator], tasks=[task], verbose=False)
        return crew.kickoff(inputs={"content": content, "target_language": target_lang})

    def generate_movie(self, age_group, language, theme=None):
        if not theme:
            curation_task = create_curation_task(self.curator, age_group, language, 'movie')
            curation_crew = Crew(agents=[self.curator], tasks=[curation_task], verbose=False)
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
        
        movie_task = create_movie_task(self.movie_gen, theme, age_group)
        movie_crew = Crew(agents=[self.movie_gen], tasks=[movie_task], verbose=False)
        movie_content = movie_crew.kickoff(inputs={"theme": theme, "age_group": age_group})
        
        if language and language != 'en':
            movie_content = self._translate(movie_content, language)
        
        return {
            "type": "movie",
            "theme": theme,
            "content": str(movie_content)
        }

    def generate_song(self, age_group, language, mood=None, genre=None):
        if not mood:
            mood = "happy" if age_group == "baby" else "nostalgic" if age_group == "senior" else "energetic"
        if not genre:
            genre = "nursery" if age_group == "baby" else "classic" if age_group == "senior" else "pop"
        
        song_task = create_song_task(self.song_gen, mood, genre, age_group)
        song_crew = Crew(agents=[self.song_gen], tasks=[song_task], verbose=False)
        song_content = song_crew.kickoff(inputs={"mood": mood, "genre": genre, "age_group": age_group})
        
        if language and language != 'en':
            song_content = self._translate(song_content, language)
        
        return {
            "type": "song",
            "mood": mood,
            "genre": genre,
            "content": str(song_content)
        }

    def generate_radio(self, age_group, language, theme=None):
        if not theme:
            theme = "fun talk show" if age_group == "baby" else "classic hits" if age_group == "senior" else "current topics"
        
        radio_task = create_radio_task(self.radio_gen, theme, age_group)
        radio_crew = Crew(agents=[self.radio_gen], tasks=[radio_task], verbose=False)
        radio_content = radio_crew.kickoff(inputs={"theme": theme, "age_group": age_group})
        
        if language and language != 'en':
            radio_content = self._translate(radio_content, language)
        
        return {
            "type": "radio",
            "theme": theme,
            "content": str(radio_content)
        }

    def generate_documentary(self, age_group, language, theme=None):
        if not theme:
            theme = "nature" if age_group == "baby" else "history" if age_group == "senior" else "technology"
        
        doc_task = create_documentary_task(self.doc_gen, theme, age_group)
        doc_crew = Crew(agents=[self.doc_gen], tasks=[doc_task], verbose=False)
        doc_content = doc_crew.kickoff(inputs={"theme": theme, "age_group": age_group})
        
        if language and language != 'en':
            doc_content = self._translate(doc_content, language)
        
        return {
            "type": "documentary",
            "theme": theme,
            "content": str(doc_content)
        }

    def generate_podcast(self, age_group, language, theme=None):
        if not theme:
            theme = "inspiration" if age_group == "young_adult" else "storytelling"
        
        podcast_task = create_podcast_task(self.podcast_gen, theme, age_group)
        podcast_crew = Crew(agents=[self.podcast_gen], tasks=[podcast_task], verbose=False)
        podcast_content = podcast_crew.kickoff(inputs={"theme": theme, "age_group": age_group})
        
        if language and language != 'en':
            podcast_content = self._translate(podcast_content, language)
        
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