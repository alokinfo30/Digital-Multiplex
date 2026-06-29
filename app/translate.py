# app/translate.py
import os
from google.cloud import translate_v2 as translate
import requests

def translate_text(text, target_lang, source_lang='en'):
    provider = os.getenv('TRANSLATION_PROVIDER', 'google')
    if provider == 'google':
        translate_client = translate.Client(api_key=os.getenv('GOOGLE_TRANSLATE_API_KEY'))
        result = translate_client.translate(text, target_language=target_lang, source_language=source_lang)
        return result['translatedText']
    elif provider == 'libre':
        url = os.getenv('LIBRETRANSLATE_URL', 'http://localhost:5000/translate')
        data = {'q': text, 'source': source_lang, 'target': target_lang}
        response = requests.post(url, data=data)
        if response.status_code == 200:
            return response.json()['translatedText']
        else:
            return text
    else:
        return text