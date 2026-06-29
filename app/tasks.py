# app/tasks.py
from crewai import Task

def create_curation_task(agent, age_group, language, content_type):
    return Task(
        description=f"""
        Based on the user's age group: {age_group}, preferred language: {language}, and content type: {content_type},
        select the best possible content idea (movie, song, or radio show) that would be most enjoyable.
        Provide a short description of why this content is suitable.
        """,
        expected_output="A JSON with keys: 'title', 'genre', 'description', 'reason'.",
        agent=agent
    )

def create_movie_task(agent, theme, age_group):
    return Task(
        description=f"""
        Generate a movie with the following details:
        - Theme: {theme}
        - Age Group: {age_group}
        Include:
        - Title
        - Genre
        - Short synopsis (2-3 paragraphs)
        - Main characters (brief)
        - Runtime (approx.)
        - Moral or message
        """,
        expected_output="A well‑structured movie synopsis in markdown format.",
        agent=agent
    )

def create_song_task(agent, mood, genre, age_group):
    return Task(
        description=f"""
        Write a song with:
        - Mood: {mood}
        - Genre: {genre}
        - Age Group: {age_group}
        Provide:
        - Song title
        - Lyrics (verses and chorus)
        - Suggested musical style
        """,
        expected_output="Song lyrics with title and style notes.",
        agent=agent
    )

def create_radio_task(agent, theme, age_group):
    return Task(
        description=f"""
        Produce a radio show script about: {theme}, suitable for {age_group}.
        Include:
        - Host introduction
        - A guest interview (fictional)
        - Music break suggestions
        - Closing remarks
        Keep the tone engaging and appropriate for the age group.
        """,
        expected_output="A complete radio show script.",
        agent=agent
    )

def create_translation_task(agent, content, target_language):
    return Task(
        description=f"""
        Translate the following content into {target_language}:
        {content}
        Ensure the translation is natural and culturally appropriate.
        """,
        expected_output="The translated text in the target language.",
        agent=agent
    )

def create_documentary_task(agent, theme, age_group):
    return Task(
        description=f"""
        Create a documentary about "{theme}" suitable for age group: {age_group}.
        Include:
        - Title
        - Introduction
        - Key topics covered
        - Interview segments (fictional)
        - Conclusion
        Make it educational yet entertaining.
        """,
        expected_output="A documentary script or outline.",
        agent=agent
    )

def create_podcast_task(agent, theme, age_group):
    return Task(
        description=f"""
        Produce a podcast episode on the topic: "{theme}" for {age_group}.
        Include:
        - Episode title
        - Host introduction
        - Guest interview (fictional)
        - Segment ideas (music, trivia, etc.)
        - Closing remarks
        Keep the tone conversational and engaging.
        """,
        expected_output="A podcast script.",
        agent=agent
    )