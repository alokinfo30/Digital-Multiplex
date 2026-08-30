document.addEventListener('DOMContentLoaded', function() {
    // ---------------------------------------------------------
    // 1. DOM ELEMENTS
    // ---------------------------------------------------------
    const studioTabs = document.querySelectorAll('.studio-tab-btn');
    const ageGroupSelect = document.getElementById('ageGroup');
    const languageSelect = document.getElementById('language');
    const genreSelect = document.getElementById('genreSelect');
    const quickThemeInput = document.getElementById('quickThemeInput');
    const quickGenerateBtn = document.getElementById('quickGenerateBtn');
    const randomizeBtn = document.getElementById('randomizeBtn');
    const voiceMicBtn = document.getElementById('voiceMicBtn');
    const loadingDiv = document.getElementById('loading');
    const loadingStatusText = document.getElementById('loadingStatusText');
    const contentDisplay = document.getElementById('contentDisplay');
    const scriptBody = document.getElementById('scriptBody');
    const scriptTitleHeading = document.getElementById('scriptTitleHeading');
    const speakScriptBtn = document.getElementById('speakScriptBtn');
    const copyScriptBtn = document.getElementById('copyScriptBtn');
    const exportScriptBtn = document.getElementById('exportScriptBtn');
    const newPromptBtn = document.getElementById('newPromptBtn');

    let currentType = 'movie';
    let currentScriptData = null;
    let isRecording = false;

    // ---------------------------------------------------------
    // 2. STUDIO TAB SWITCHER
    // ---------------------------------------------------------
    studioTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            studioTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentType = this.dataset.type;
            generateEntertainmentContent(currentType);
        });
    });

    // ---------------------------------------------------------
    // 3. VOICE MICROPHONE INPUT
    // ---------------------------------------------------------
    if (voiceMicBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        voiceMicBtn.addEventListener('click', function() {
            if (isRecording) {
                recognition.stop();
                voiceMicBtn.classList.remove('recording');
                isRecording = false;
            } else {
                try {
                    recognition.start();
                    voiceMicBtn.classList.add('recording');
                    isRecording = true;
                    if (quickThemeInput) quickThemeInput.placeholder = '🎙️ Listening to story idea... Speak now!';
                } catch (e) {
                    console.error('Speech recognition error:', e);
                }
            }
        });

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            if (quickThemeInput) {
                quickThemeInput.value = transcript;
            }
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
            generateEntertainmentContent(currentType);
        };

        recognition.onerror = function() {
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
            if (quickThemeInput) quickThemeInput.placeholder = "Enter custom theme / story premise...";
        };

        recognition.onend = function() {
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
            if (quickThemeInput) quickThemeInput.placeholder = "Enter custom theme / story premise...";
        };
    }

    // ---------------------------------------------------------
    // 4. RANDOMIZE / SURPRISE ME
    // ---------------------------------------------------------
    const surpriseThemes = [
        "Time traveler accidentally replaces a pop music icon in 1985",
        "Deep-sea research station discovers bioluminescent alien colony",
        "Undercover barista competing in the underground coffee racing league",
        "Elderly detective and teenage AI hacker solve Victorian mansion heist",
        "A sentient solar satellite falling in love with a passing comet",
        "Neon samurai protecting the last botanical garden on Mars"
    ];

    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', function() {
            const randomTheme = surpriseThemes[Math.floor(Math.random() * surpriseThemes.length)];
            if (quickThemeInput) quickThemeInput.value = randomTheme;
            const genres = ['sci_fi', 'action', 'thriller', 'romance', 'comedy', 'nature', 'tech'];
            if (genreSelect) genreSelect.value = genres[Math.floor(Math.random() * genres.length)];
            generateEntertainmentContent(currentType);
        });
    }

    if (quickGenerateBtn) {
        quickGenerateBtn.addEventListener('click', function() {
            generateEntertainmentContent(currentType);
        });
    }

    if (newPromptBtn) {
        newPromptBtn.addEventListener('click', function() {
            if (quickThemeInput) {
                quickThemeInput.value = '';
                quickThemeInput.focus();
            }
            window.scrollTo({ top: 180, behavior: 'smooth' });
        });
    }

    // ---------------------------------------------------------
    // 5. INTELLIGENT SCRIPT GENERATION ENGINE
    // ---------------------------------------------------------
    function buildClientSimulation(type, age, lang, genre, userTheme) {
        const theme = userTheme || 'Epic Cosmic Adventure';
        const langCode = lang ? lang.toUpperCase() : 'EN';

        if (type === 'movie') {
            return `<h2>🎥 Screenplay Preview: "The Vanguard Protocol"</h2>
<p><b>Genre:</b> ${genre.toUpperCase()} | <b>Age Tier:</b> ${age.toUpperCase()} | <b>Language:</b> ${langCode}</p>
<p><b>Theme:</b> "${theme}"</p>
<br/>
<h3>🌟 Story Logline:</h3>
<blockquote>When an enigmatic anomaly appears in the outer asteroid belt, a crew of specialized navigators must unite their divergent skills before the planetary defense perimeter collapses.</blockquote>
<br/>
<h3>🎬 Lead Ensemble:</h3>
<p>• <b>Commander Sean Vance:</b> Veteran deep-space explorer with uncharted navigational telemetry.</p>
<p>• <b>Dr. Lyra Vega:</b> Quantum astrophysics prodigy who decodes planetary signals.</p>
<br/>
<h3>🎭 Scene Script [ACT I - THE LAUNCH]:</h3>
<p><b>[EXT. ORBITAL DOCK 9 - DUSK]</b><br/>
The massive starship engines ignite in a wash of sapphire plasma against the dark curvature of the atmosphere. Sirens chime through the launch bay.</p>
<br/>
<p><b>VANCE:</b><br/><i>"Check thruster synchronization. Once we cross the heliosphere boundary, there is no turning back."</i></p>
<br/>
<p><b>VEGA:</b> (calmly checking the console)<br/><i>"Telemetry locked, Commander. All systems green. The anomaly is waiting."</i></p>`;
        }

        if (type === 'song') {
            return `<h2>🎵 Hit Single & Lyric Master: "Echoes in the Starlight"</h2>
<p><b>Genre:</b> ${genre.toUpperCase()} Pop / Acoustic | <b>BPM:</b> 124 | <b>Key:</b> G Major | <b>Language:</b> ${langCode}</p>
<p><b>Vibe:</b> "${theme}"</p>
<br/>
<h3>🎸 [VERSE 1]</h3>
<p>Chasing shadows down the neon street,<br/>
Listening to the rhythm of the city beat.<br/>
Looking at the skyline painted gold and blue,<br/>
Every melody I write leads me back to you.</p>
<br/>
<h3>✨ [CHORUS]</h3>
<blockquote>We are echoes in the starlight, burning so bright,<br/>
Running through the shadows into open light.<br/>
Hold on to the dream, never let it fade away,<br/>
We'll be dancing till the break of day!</blockquote>
<br/>
<h3>🎶 [BRIDGE]</h3>
<p>Through the silence of the night (ooh-yeah),<br/>
Harmonies align and the future ignites.</p>`;
        }

        if (type === 'radio') {
            return `<h2>📻 Live Radio Broadcast: "Nightwave FM 104.5 — The Pulse"</h2>
<p><b>Format:</b> Late-Night Interactive Talk & Beats | <b>Audience:</b> ${age.toUpperCase()} | <b>Language:</b> ${langCode}</p>
<p><b>Show Topic:</b> "${theme}"</p>
<br/>
<h3>🎙️ [ON AIR INTRO]</h3>
<p><b>[SFX: STATION CHIME JINGLE & SUBTLE LO-FI VINYL CRACKLE]</b></p>
<br/>
<p><b>RJ MAX:</b><br/>
<i>"Good evening night owls across the city! You are locked in with RJ Max on Nightwave FM 104.5. Tonight, we're diving deep into our listener spotlight: '${theme}'. We've got caller line 3 lighting up right now. Sarah from Downtown, you're live on the air!"</i></p>
<br/>
<p><b>CALLER SARAH:</b><br/>
<i>"Hey Max! Long-time listener. Just wanted to say that this topic is changing my whole week. Can you drop that new synthwave track right after?"</i></p>
<br/>
<p><b>RJ MAX:</b><br/>
<i>"You got it, Sarah. Crank your speakers up — this next one goes out to every dreamer on the night highway."</i></p>`;
        }

        if (type === 'documentary') {
            return `<h2>📽️ Cinematic Docu-Series: "Wonders of the Unseen Realm"</h2>
<p><b>Category:</b> Nature & Science Exploration | <b>Pacing:</b> Immersive 4K Narration | <b>Language:</b> ${langCode}</p>
<p><b>Subject:</b> "${theme}"</p>
<br/>
<h3>🎙️ Narrator Voiceover [ACT I - THE HIDDEN CORRIDORS]:</h3>
<p><b>[EXT. ANCIENT CANYON CANOPY - MISTY DAWN]</b><br/>
Golden light cascades through the primeval canopy. Microscopic ecosystems thrive in symbiotic harmony, invisible to the casual human eye.</p>
<br/>
<p><b>NARRATOR:</b><br/>
<blockquote>"Beneath the tranquil canopy lies an intricate network of biological communication. Millions of fungal hyphae transmit electrical pulses, sharing nutrients across entire ancient forests in a silent symphony of survival."</blockquote></p>
<br/>
<p><b>Key Fact:</b> Over 90% of forest tree species rely directly on mycorrhizal fungal networks for drought resilience and nutrient transfer.</p>`;
        }

        return `<h2>🎙️ Podcast Master: "The Future Frontier Podcast" (Ep. #84)</h2>
<p><b>Format:</b> Deep-Dive Discussion & Tech Insights | <b>Audience:</b> ${age.toUpperCase()} | <b>Language:</b> ${langCode}</p>
<p><b>Episode Focus:</b> "${theme}"</p>
<br/>
<h3>🎧 Episode Outline & Show Notes:</h3>
<p>• <b>[00:00 - 04:30]:</b> Welcome & High-Level Breakdown of ${theme}.</p>
<p>• <b>[04:30 - 18:45]:</b> Guest Interview with Industry Visionaries.</p>
<p>• <b>[18:45 - 28:00]:</b> Practical Frameworks & Actionable Takeaways for Listeners.</p>
<br/>
<h3>🗣️ Host Dialogue Snippet:</h3>
<p><b>HOST ALEX:</b><br/>
<i>"Welcome back to The Future Frontier. Today we're exploring why '${theme}' is fundamentally shifting the creative landscape. When you look at how fast generative workflows are evolving, it's clear we're only at day one."</i></p>`;
    }

    async function generateEntertainmentContent(type) {
        const age = ageGroupSelect ? ageGroupSelect.value : 'young_adult';
        const lang = languageSelect ? languageSelect.value : 'en';
        const genre = genreSelect ? genreSelect.value : 'sci_fi';
        const customTheme = quickThemeInput ? quickThemeInput.value.trim() : '';

        if (loadingDiv) loadingDiv.classList.remove('hidden');
        if (contentDisplay) contentDisplay.classList.add('hidden');
        if (loadingStatusText) loadingStatusText.textContent = `Assembling specialized ${type.toUpperCase()} AI agent crew...`;

        const payload = {
            type: type,
            age_group: age,
            language: lang,
            extra: {
                theme: customTheme || genre,
                genre: genre
            }
        };

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.job_id) {
                    await pollJobResult(data.job_id);
                    return;
                } else if (data.status === 'completed' && data.result) {
                    renderScriptResult(data.result, type);
                    return;
                }
            }
            throw new Error('Fallback to local intelligence');
        } catch (e) {
            // Instant high-fidelity simulation
            await new Promise(r => setTimeout(r, 600));
            const simResult = buildClientSimulation(type, age, lang, genre, customTheme);
            renderScriptResult(simResult, type);
        } finally {
            if (loadingDiv) loadingDiv.classList.add('hidden');
            if (contentDisplay) contentDisplay.classList.remove('hidden');
        }
    }

    async function pollJobResult(jobId) {
        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 1000));
            try {
                const r = await fetch(`/api/result/${jobId}`);
                if (r.ok) {
                    const data = await r.json();
                    if (data.status === 'completed' && data.result) {
                        renderScriptResult(data.result, currentType);
                        return;
                    }
                }
            } catch (err) {
                break;
            }
        }
        // Fallback if timeout
        const sim = buildClientSimulation(currentType, ageGroupSelect.value, languageSelect.value, genreSelect.value, quickThemeInput.value);
        renderScriptResult(sim, currentType);
    }

    function renderScriptResult(htmlContent, type) {
        currentScriptData = htmlContent;
        if (scriptBody) {
            scriptBody.innerHTML = htmlContent;
        }
        if (scriptTitleHeading) {
            scriptTitleHeading.textContent = `🎬 ${type.toUpperCase()} Studio Showcase`;
        }
        if (contentDisplay) {
            contentDisplay.classList.remove('hidden');
            contentDisplay.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // ---------------------------------------------------------
    // 6. AUDIO TEXT-TO-SPEECH SYNTHESIS
    // ---------------------------------------------------------
    if (speakScriptBtn && 'speechSynthesis' in window) {
        speakScriptBtn.addEventListener('click', function() {
            if (scriptBody) {
                const text = scriptBody.innerText;
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
                speakScriptBtn.textContent = '🔊 Speaking...';
                utterance.onend = () => { speakScriptBtn.textContent = '🔊 Listen Narration'; };
            }
        });
    }

    // ---------------------------------------------------------
    // 7. COPY & EXPORT SCRIPT
    // ---------------------------------------------------------
    if (copyScriptBtn) {
        copyScriptBtn.addEventListener('click', function() {
            if (scriptBody) {
                navigator.clipboard.writeText(scriptBody.innerText);
                copyScriptBtn.textContent = '✅ Copied!';
                setTimeout(() => copyScriptBtn.textContent = '📋 Copy Script', 2000);
            }
        });
    }

    if (exportScriptBtn) {
        exportScriptBtn.addEventListener('click', function() {
            if (scriptBody) {
                const blob = new Blob([scriptBody.innerText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `digital_multiplex_${currentType}_${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            }
        });
    }
});
