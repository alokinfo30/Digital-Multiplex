# app/tmdb.py
import requests
import os

TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_READ_ACCESS_TOKEN = os.getenv('TMDB_READ_ACCESS_TOKEN')
BASE_URL = 'https://api.themoviedb.org/3'

def discover_movies(age_group='young_adult', language='en'):
    """Fetch popular movies for the given age group (using genre filters)."""
    # Map age groups to genre IDs (example: 18=family? we'll use popularity)
    params = {
        'api_key': TMDB_API_KEY,
        'language': language,
        'sort_by': 'popularity.desc',
        'include_adult': 'false',
        'page': 1
    }
    # Add age filters: for baby -> family, young adult -> all, senior -> classic?
    # Simplified: we'll just fetch popular movies.
    response = requests.get(f'{BASE_URL}/discover/movie', params=params)
    if response.status_code == 200:
        return response.json().get('results', [])
    return []

def get_movie_details(movie_id, language='en'):
    params = {'api_key': TMDB_API_KEY, 'language': language}
    response = requests.get(f'{BASE_URL}/movie/{movie_id}', params=params)
    if response.status_code == 200:
        return response.json()
    return None