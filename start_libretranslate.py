# start_libretranslate.py
import subprocess
import sys
import time
import os

def start_libretranslate():
    """Start LibreTranslate server using subprocess"""
    try:
        # Check if libretranslate is installed
        subprocess.run(['libretranslate', '--version'], capture_output=True)
        
        print("=" * 60)
        print("🌐 Starting LibreTranslate Server")
        print("=" * 60)
        print("Loading language models... (this may take a few minutes)")
        print("Server will be available at: http://localhost:5001")
        print("=" * 60)
        
        # Start the server
        subprocess.run([
            'libretranslate',
            '--host', '0.0.0.0',
            '--port', '5001',
            '--load-only', 'en,hi,es,fr,de,zh,ja,ko,pt,ru,it',
            '--threads', '2'
        ])
        
    except FileNotFoundError:
        print("❌ LibreTranslate is not installed!")
        print("Run: pip install libretranslate argostranslate")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n✅ LibreTranslate server stopped.")
        sys.exit(0)

if __name__ == "__main__":
    start_libretranslate()