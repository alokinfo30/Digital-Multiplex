// Digital Multiplex — 4DX Universal Streaming Injector Content Script
(function() {
    'use strict';

    const MULTIPLEX_APP_URL = 'https://alokinfo30.github.io/Digital-Multiplex/';
    const BUTTON_ID = 'digital-multiplex-4dx-stream-btn';

    function getStreamData() {
        const url = window.location.href;
        let title = document.title || 'Streaming Video';

        // Platform-specific title extraction
        if (window.location.hostname.includes('youtube.com')) {
            const ytTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, #title h1 yt-formatted-string, h1.title');
            if (ytTitle && ytTitle.textContent) {
                title = ytTitle.textContent.trim();
            }
        } else if (window.location.hostname.includes('netflix.com')) {
            const netflixTitle = document.querySelector('.video-title h4, .ellipsize-text');
            if (netflixTitle && netflixTitle.textContent) {
                title = netflixTitle.textContent.trim();
            }
        }

        // Direct HTML5 Video source fallback if available
        let videoSrc = url;
        const videoElem = document.querySelector('video');
        if (videoElem && videoElem.currentSrc && !videoElem.currentSrc.startsWith('blob:')) {
            videoSrc = videoElem.currentSrc;
        }

        return { url, title, videoSrc };
    }

    function redirectTo4DX() {
        const { url, title, videoSrc } = getStreamData();
        const targetParam = encodeURIComponent(url);
        const titleParam = encodeURIComponent(title);
        
        // Construct destination URL with autoplay and 4DX turbo profile
        const destination = `${MULTIPLEX_APP_URL}?movie=${targetParam}&title=${titleParam}&autoplay=1&profile=turbo`;
        
        // Open in new tab or navigate
        window.open(destination, '_blank');
    }

    function inject4DXButton() {
        // Prevent duplicate buttons
        if (document.getElementById(BUTTON_ID)) return;

        // Check if page has video or is on a streaming platform
        const hasVideo = document.querySelector('video') !== null;
        const isStreamingSite = /youtube\.com|netflix\.com|primevideo\.com|hotstar\.com|disneyplus\.com|twitch\.tv|vimeo\.com|dailymotion\.com|crunchyroll\.com|jiocinema\.com|zee5\.com/i.test(window.location.hostname);

        if (!hasVideo && !isStreamingSite) return;

        // Create the 4DX Floating Button
        const btn = document.createElement('div');
        btn.id = BUTTON_ID;
        btn.className = 'dm-4dx-floating-injector-btn';
        btn.innerHTML = `
            <div class="dm-4dx-inner-pill">
                <span class="dm-4dx-pulse-dot"></span>
                <span class="dm-4dx-icon">⚡</span>
                <span class="dm-4dx-text">WATCH IN 4DX MOVIE THEATER</span>
            </div>
        `;

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            redirectTo4DX();
        });

        // Insert into DOM
        document.body.appendChild(btn);
    }

    // Run injection on load and listen for URL changes / dynamic SPA navigation
    inject4DXButton();

    const observer = new MutationObserver(() => {
        inject4DXButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Handle YouTube dynamic page navigation (yt-navigate-finish)
    window.addEventListener('yt-navigate-finish', inject4DXButton);
    window.addEventListener('popstate', inject4DXButton);

})();
