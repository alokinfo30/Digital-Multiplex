document.addEventListener('DOMContentLoaded', async () => {
    const titleEl = document.getElementById('detectedTitle');
    const urlEl = document.getElementById('detectedUrl');
    const launchBtn = document.getElementById('launch4dxBtn');

    let currentUrl = '';
    let currentTitle = '';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            currentUrl = tab.url || '';
            currentTitle = tab.title || 'Streaming Video';
            titleEl.textContent = currentTitle;
            urlEl.textContent = currentUrl;
        }
    } catch (e) {
        titleEl.textContent = 'Active Video Stream Ready';
        urlEl.textContent = 'Click below to launch 4DX Multiplex';
    }

    launchBtn.addEventListener('click', () => {
        const destination = `https://alokinfo30.github.io/Digital-Multiplex/?movie=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(currentTitle)}&autoplay=1&profile=turbo`;
        chrome.tabs.create({ url: destination });
    });
});
