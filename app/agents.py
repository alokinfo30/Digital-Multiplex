# app/agents.py
from crewai import Agent
from app.model_manager import model_manager
import logging

logger = logging.getLogger(__name__)

def create_curator_agent():
    """Agent that selects appropriate content based on user age and preferences."""
    model = model_manager.get_model_for_agent('curator')
    llm = model_manager.get_llm(model, temperature=0.4)
    return Agent(
        role="Content Curator",
        goal="Select the most suitable movie, song, or radio show for the user's age group and preferences.",
        backstory="You are an expert curator at a digital multiplex. You understand what content suits babies, young adults, and seniors. You also consider language and past choices.",
        allow_delegation=False,
        verbose=True,
        llm=llm
    )

def create_movie_generator_agent():
    model = model_manager.get_model_for_agent('movie')
    llm = model_manager.get_llm(model, temperature=0.8)
    return Agent(
        role="Movie Generator",
        goal="Create an engaging movie synopsis, title, genre, and runtime for the chosen theme and age group.",
        backstory="You are a creative screenwriter who can produce compelling movie ideas for all ages. You include a short plot, main characters, and a moral lesson.",
        allow_delegation=False,
        verbose=True,
        llm=llm
    )

def create_song_generator_agent():
    model = model_manager.get_model_for_agent('song')
    llm = model_manager.get_llm(model, temperature=0.9)
    return Agent(
        role="Song Generator",
        goal="Write original song lyrics with a specified mood and genre, suitable for the age group.",
        backstory="You are a versatile songwriter capable of crafting nursery rhymes, pop hits, or classic melodies. You include catchy choruses and meaningful verses.",
        allow_delegation=False,
        verbose=True,
        llm=llm
    )

def create_radio_generator_agent():
    model = model_manager.get_model_for_agent('radio')
    llm = model_manager.get_llm(model, temperature=0.7)
    return Agent(
        role="Radio Show Generator",
        goal="Produce a short radio show script with a host, interviews, and music segments, tailored to the age group.",
        backstory="You are a seasoned radio producer who creates lively shows that engage listeners of all generations. You include talk segments, jokes, and song recommendations.",
        allow_delegation=False,
        verbose=True,
        llm=llm
    )

def create_translator_agent():
    model = model_manager.get_model_for_agent('translator')
    llm = model_manager.get_llm(model, temperature=0.3)
    return Agent(
        role="Translator",
        goal="Translate any given content into the user's preferred language while preserving tone and meaning.",
        backstory="You are a fluent polyglot who can translate text accurately into multiple languages, keeping the original style and cultural nuances.",
        allow_delegation=False,
        verbose=True,
        llm=llm
    )

def create_documentary_generator_agent():
    model = model_manager.get_model_for_agent('documentary')
    llm = model_manager.get_llm(model, temperature=0.7)
    return Agent(
        role="Documentary Generator",
        goal="Create a documentary outline covering a factual topic in an engaging manner.",
        backstory="You are a documentary filmmaker who researches and structures compelling non‑fiction narratives.",
        allow_delegation=False,
        verbose=True,
        llm=llm
    )

def create_podcast_generator_agent():
    model = model_manager.get_model_for_agent('podcast')
    llm = model_manager.get_llm(model, temperature=0.8)
    return Agent(
        role="Podcast Generator",
        goal="Produce a podcast episode script with hosts, interviews, and segments.",
        backstory="You are a podcast producer who creates lively audio content for various audiences.",
        allow_delegation=False,
        verbose=True,
        llm=llm
    )