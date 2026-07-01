# app/translate.py
import os
import logging
import requests
import json
from typing import Optional

logger = logging.getLogger(__name__)

class LibreTranslateClient:
    """Client for LibreTranslate API"""
    
    def __init__(self):
        self.base_url = os.getenv('LIBRETRANSLATE_URL', 'http://localhost:5001/translate')
        self.languages_url = os.getenv('LIBRETRANSLATE_LANGUAGES_URL', 'http://localhost:5001/languages')
        self.available_languages = []
        self._load_languages()
    
    def _load_languages(self):
        """Load available languages from LibreTranslate"""
        try:
            response = requests.get(self.languages_url, timeout=5)
            if response.status_code == 200:
                self.available_languages = [lang['code'] for lang in response.json()]
                logger.info(f"Loaded {len(self.available_languages)} languages from LibreTranslate")
            else:
                logger.warning("Could not load languages from LibreTranslate")
        except Exception as e:
            logger.warning(f"Error loading languages: {str(e)}")
            # Fallback languages
            self.available_languages = ['en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'ru', 'it']
    
    def translate(self, text: str, target_lang: str, source_lang: str = 'en') -> str:
        """
        Translate text using LibreTranslate
        
        Args:
            text (str): Text to translate
            target_lang (str): Target language code (e.g., 'hi', 'es')
            source_lang (str): Source language code (default: 'en')
        
        Returns:
            str: Translated text or original text if translation fails
        """
        if not text or not target_lang or target_lang == source_lang:
            return text
        
        try:
            # Check if language is supported
            if target_lang not in self.available_languages:
                logger.warning(f"Language {target_lang} not supported by LibreTranslate")
                return text
            
            # Prepare request
            payload = {
                'q': text,
                'source': source_lang,
                'target': target_lang,
                'format': 'text'
            }
            
            # Send translation request
            response = requests.post(
                self.base_url,
                json=payload,
                timeout=30,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('translatedText', text)
            else:
                logger.error(f"Translation error: {response.status_code} - {response.text}")
                return text
                
        except requests.exceptions.ConnectionError:
            logger.error("Failed to connect to LibreTranslate. Is the server running?")
            logger.info("Start LibreTranslate with: libretranslate --host 0.0.0.0 --port 5001")
            return text
        except requests.exceptions.Timeout:
            logger.error("LibreTranslate timeout")
            return text
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return text
    
    def translate_batch(self, texts: list, target_lang: str, source_lang: str = 'en') -> list:
        """Translate multiple texts"""
        if not texts:
            return []
        
        try:
            payload = {
                'q': texts,
                'source': source_lang,
                'target': target_lang,
                'format': 'text'
            }
            
            response = requests.post(
                self.base_url,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('translatedText', texts)
            else:
                return texts
                
        except Exception as e:
            logger.error(f"Batch translation error: {str(e)}")
            return texts
    
    def detect_language(self, text: str) -> Optional[str]:
        """Detect the language of the text"""
        try:
            response = requests.post(
                os.getenv('LIBRETRANSLATE_DETECT_URL', 'http://localhost:5001/detect'),
                json={'q': text},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result and len(result) > 0:
                    return result[0].get('language', None)
            return None
        except Exception as e:
            logger.error(f"Language detection error: {str(e)}")
            return None

# Singleton instance
libre_client = LibreTranslateClient()

def translate_text(text: str, target_lang: str, source_lang: str = 'en') -> str:
    """
    Convenience function to translate text
    
    Args:
        text (str): Text to translate
        target_lang (str): Target language code
        source_lang (str): Source language code (default: 'en')
    
    Returns:
        str: Translated text
    """
    return libre_client.translate(text, target_lang, source_lang)

def translate_batch(texts: list, target_lang: str, source_lang: str = 'en') -> list:
    """Convenience function to translate multiple texts"""
    return libre_client.translate_batch(texts, target_lang, source_lang)

def detect_language(text: str) -> Optional[str]:
    """Convenience function to detect language"""
    return libre_client.detect_language(text)

def get_supported_languages() -> list:
    """Get list of supported languages"""
    return libre_client.available_languages

def is_language_supported(lang_code: str) -> bool:
    """Check if a language is supported"""
    return lang_code in libre_client.available_languages