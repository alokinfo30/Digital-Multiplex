#!/usr/bin/env python
"""
Test LibreTranslate integration
Run: python test_translation.py
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_libre_translate():
    """Test LibreTranslate integration"""
    print("=" * 60)
    print("🌐 LIBRETRANSLATE TEST")
    print("=" * 60)
    
    # Test translation
    from app.translate import translate_text, get_supported_languages, is_language_supported
    
    print("\n📋 Supported Languages:")
    print("-" * 60)
    languages = get_supported_languages()
    print(f"Total: {len(languages)} languages")
    print(f"Sample: {', '.join(languages[:10])}")
    
    print("\n🔄 Testing Translation:")
    print("-" * 60)
    
    test_texts = [
        ("Hello, how are you?", "hi", "नमस्ते, आप कैसे हैं?"),
        ("Good morning!", "es", "¡Buenos días!"),
        ("I love movies and music.", "fr", "J'adore les films et la musique."),
        ("Welcome to the Digital Multiplex!", "de", "Willkommen im Digital Multiplex!")
    ]
    
    for text, lang, expected in test_texts:
        print(f"\nOriginal: {text}")
        print(f"Target: {lang}")
        
        # Translate
        translated = translate_text(text, lang)
        print(f"Translated: {translated}")
        
        # Check if language is supported
        supported = is_language_supported(lang)
        print(f"Language supported: {'✅ Yes' if supported else '❌ No'}")
        
        print("-" * 40)
    
    print("\n" + "=" * 60)
    print("✅ Translation test complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_libre_translate()