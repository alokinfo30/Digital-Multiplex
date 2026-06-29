# app/model_manager.py
import os
import logging
from openai import OpenAI
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class ModelManager:
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY missing")
        self.base_url = os.getenv('OPENROUTER_BASE_URL')
        self.app_url = os.getenv('OPENROUTER_APP_URL', 'http://localhost:5000')
        self.app_name = os.getenv('OPENROUTER_APP_NAME', 'DigitalMultiplex')
        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            default_headers={
                "HTTP-Referer": self.app_url,
                "X-Title": self.app_name
            }
        )
        self.primary_model = os.getenv('OPENROUTER_PRIMARY_MODEL', 'openai/gpt-4o-mini')
        self.fallback_models = [m.strip() for m in os.getenv('OPENROUTER_FALLBACK_MODELS', '').split(',') if m.strip()]
        self.agent_models = {
            'curator': os.getenv('CONTENT_CURATOR_MODEL', self.primary_model),
            'movie': os.getenv('MOVIE_GENERATOR_MODEL', self.primary_model),
            'song': os.getenv('SONG_GENERATOR_MODEL', self.primary_model),
            'radio': os.getenv('RADIO_GENERATOR_MODEL', self.primary_model),
            'translator': os.getenv('TRANSLATOR_MODEL', self.primary_model)
        }
        self._available_models_cache = None
        logger.info(f"ModelManager initialized. Primary: {self.primary_model}")

    def get_model_for_agent(self, agent_type: str) -> str:
        """Return the configured model for a given agent type."""
        return self.agent_models.get(agent_type, self.primary_model)

    def get_available_models(self) -> List[str]:
        """Return list of models that are currently available (cached)."""
        if self._available_models_cache is not None:
            return self._available_models_cache
        models = [self.primary_model] + self.fallback_models
        available = []
        for model in models:
            try:
                # Quick test
                self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "ping"}],
                    max_tokens=1
                )
                available.append(model)
            except Exception:
                logger.warning(f"Model {model} unavailable")
        self._available_models_cache = available
        return available

    def get_llm(self, model: str, temperature: float = 0.7):
        """Return a LangChain‑compatible LLM (OpenAI wrapper)."""
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=model,
            api_key=self.api_key,
            base_url=self.base_url,
            temperature=temperature,
            default_headers={
                "HTTP-Referer": self.app_url,
                "X-Title": self.app_name
            }
        )

model_manager = ModelManager()