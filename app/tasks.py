# app/tasks.py
from crewai import Task

def create_curation_task(agent, age_group, language, content_type):
    return Task(
        description=f"""
        Select a suitable content idea for a '{content_type}' based on the user's age group '{age_group}' and preferred language '{language}'.
        Your final answer must be a JSON object with the keys: 'title', 'genre', 'description', and 'reason'.
        Example: {{"title": "The Magical Forest", "genre": "Fantasy", "description": "A story about...", "reason": "It is age-appropriate..."}}
        """,
        agent=agent,
        expected_output="A JSON object with keys: 'title', 'genre', 'description', 'reason'."
    )

def create_movie_task(agent, theme, age_group):
    return Task(
        description=f"""
        Generate a movie with the following details:
        - Theme: {theme}
        - Target Age Group: {age_group}
        Include:
        - Title
        - Genre
        - Short synopsis (2-3 paragraphs)
        - Main characters (brief description)
        - Approximate Runtime
        - Moral or message
        """,
        agent=agent,
        expected_output="A well-structured movie synopsis formatted in markdown."
    )

def create_song_task(agent, mood, genre, age_group):
    return Task(
        description=f"""
        Write a song with:
        - Mood: {mood}
        - Genre: {genre} for age group: {age_group}
        Provide:
        - Song title
        - Lyrics (verses and chorus)
        - Suggested musical style
        """,
        agent=agent,
        expected_output="Complete song lyrics including a title and style notes."
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
        agent=agent,
        expected_output="A complete radio show script formatted for easy reading."
    )

def create_translation_task(agent, content, target_language):
    return Task(
        description=f"""
        Translate the following content into {target_language}:
        {content}
        Ensure the translation is natural and culturally appropriate.
        """,
        agent=agent,
        expected_output=f"The translated text in {target_language}."
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
        agent=agent,
        expected_output="A well-structured documentary script or a detailed outline."
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
        agent=agent,
        expected_output="A complete and engaging podcast script."
    )