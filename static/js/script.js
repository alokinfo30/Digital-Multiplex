document.addEventListener('DOMContentLoaded', function() {
    const ageGroupSelect = document.getElementById('ageGroup');
    const languageSelect = document.getElementById('language');
    const tabs = document.querySelectorAll('.tab');
    const contentDisplay = document.getElementById('contentDisplay');
    const loadingDiv = document.getElementById('loading');
    const loaderDots = document.getElementById('loaderDots');

    let currentType = 'movie';
    let currentJobId = null;
    let pollInterval = null;

    // Load languages
    fetch('/api/languages')
        .then(r => r.json())
        .then(langs => {
            languageSelect.innerHTML = '';
            langs.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.code;
                opt.textContent = l.name;
                languageSelect.appendChild(opt);
            });
            // Try to set from localStorage or default
            const savedLang = localStorage.getItem('multiplex_lang') || 'en';
            if ([...languageSelect.options].some(o => o.value === savedLang)) {
                languageSelect.value = savedLang;
            }
        });

    // Load age from localStorage
    const savedAge = localStorage.getItem('multiplex_age');
    if (savedAge && [...ageGroupSelect.options].some(o => o.value === savedAge)) {
        ageGroupSelect.value = savedAge;
    }

    function generateContent(type) {
        if (pollInterval) clearInterval(pollInterval);
        loadingDiv.style.display = 'block';
        contentDisplay.innerHTML = '<div class="placeholder">⏳ Generating your content…</div>';

        const payload = {
            type: type,
            age_group: ageGroupSelect.value,
            language: languageSelect.value,
            extra: {}
        };

        // Add extra parameters based on type
        if (type === 'movie') payload.extra.theme = 'adventure';
        else if (type === 'song') { 
            payload.extra.mood = 'happy'; 
            payload.extra.genre = 'pop'; 
        }
        else if (type === 'radio') payload.extra.theme = 'entertaining talk';
        else if (type === 'documentary') payload.extra.theme = 'nature';
        else if (type === 'podcast') payload.extra.theme = 'inspiration';

        // Save preferences
        localStorage.setItem('multiplex_lang', languageSelect.value);
        localStorage.setItem('multiplex_age', ageGroupSelect.value);

        fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(data => {
            if (data.job_id) {
                currentJobId = data.job_id;
                pollResult(currentJobId);
            } else if (data.status === 'completed' && data.result) {
                // TMDB or immediate result
                loadingDiv.style.display = 'none';
                displayResult(data.result);
            } else {
                loadingDiv.style.display = 'none';
                contentDisplay.innerHTML = `<div class="placeholder">❌ Error: ${data.error || 'Unknown'}</div>`;
            }
        })
        .catch(err => {
            loadingDiv.style.display = 'none';
            contentDisplay.innerHTML = `<div class="placeholder">❌ Network error: ${err.message}</div>`;
        });
    }

    function pollResult(jobId) {
        let attempts = 0;
        pollInterval = setInterval(() => {
            fetch(`/api/result/${jobId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'completed') {
                        clearInterval(pollInterval);
                        loadingDiv.style.display = 'none';
                        displayResult(data.result);
                    } else if (data.status === 'error') {
                        clearInterval(pollInterval);
                        loadingDiv.style.display = 'none';
                        contentDisplay.innerHTML = `<div class="placeholder">❌ Error: ${data.result?.error || 'Generation failed'}</div>`;
                    } else {
                        // Still processing
                        const dots = '.'.repeat(attempts % 4 + 1);
                        loaderDots.textContent = dots;
                        attempts++;
                    }
                })
                .catch(err => {
                    clearInterval(pollInterval);
                    loadingDiv.style.display = 'none';
                    contentDisplay.innerHTML = `<div class="placeholder">❌ Polling error: ${err.message}</div>`;
                });
        }, 1500);
    }

    function displayResult(result) {
        let html = '';
        if (result.error) {
            html = `<div class="placeholder">❌ Error: ${result.error}</div>`;
        } else {
            const type = result.type || 'content';
            const iconMap = {
                'movie': '🎥',
                'song': '🎵',
                'radio': '📻',
                'documentary': '📽️',
                'podcast': '🎙️'
            };
            const icon = iconMap[type] || '📄';
            const theme = result.theme || 'Untitled';
            const content = result.content || 'No content generated.';
            
            html = `
                <div class="content-card">
                    <div class="content-header">
                        <span class="content-icon">${icon}</span>
                        <h2>${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                    </div>
                    <h3 class="content-title">${theme}</h3>
                    <div class="content-body">${formatContent(content)}</div>
                    ${result.from_tmdb ? '<div class="tmdb-badge">🎬 From TMDB</div>' : '<div class="ai-badge">🤖 AI Generated</div>'}
                </div>
            `;
        }
        contentDisplay.innerHTML = html;
    }

    function formatContent(text) {
        // Convert markdown-like formatting to HTML
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^# (.*$)/gm, '<h4>$1</h4>')
            .replace(/^## (.*$)/gm, '<h5>$1</h5>')
            .replace(/^### (.*$)/gm, '<h6>$1</h6>')
            .replace(/^\* (.*$)/gm, '• $1<br>')
            .replace(/^- (.*$)/gm, '• $1<br>')
            .replace(/\n/g, '<br>');
        
        // Fix lists
        html = html.replace(/(• .*?)(<br>|$)/g, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        return html;
    }

    // Tab clicks
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentType = this.dataset.type;
            generateContent(currentType);
        });
    });

    // Change on age/language
    ageGroupSelect.addEventListener('change', () => generateContent(currentType));
    languageSelect.addEventListener('change', () => generateContent(currentType));

    // Initial load
    generateContent('movie');
});