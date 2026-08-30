document.addEventListener('DOMContentLoaded', function() {
    // ---------------------------------------------------------
    // 1. DOM ELEMENTS & STATE INITIALIZATION
    // ---------------------------------------------------------
    const studioTabs = document.querySelectorAll('.studio-tab-btn');
    const ageGroupSelect = document.getElementById('ageGroup');
    const languageSelect = document.getElementById('language');
    const genreSelect = document.getElementById('genreSelect');
    const quickThemeInput = document.getElementById('quickThemeInput');
    const quickGenerateBtn = document.getElementById('quickGenerateBtn');
    const randomizeBtn = document.getElementById('randomizeBtn');
    const voiceMicBtn = document.getElementById('voiceMicBtn');
    const sfxJingleBtn = document.getElementById('sfxJingleBtn');
    const loadingDiv = document.getElementById('loading');
    const loadingStatusText = document.getElementById('loadingStatusText');
    const contentDisplay = document.getElementById('contentDisplay');
    const seatSelectorHub = document.getElementById('seatSelectorHub');
    const concessionsHub = document.getElementById('concessionsHub');
    const triviaHub = document.getElementById('triviaHub');
    const scriptBody = document.getElementById('scriptBody');
    const scriptTitleHeading = document.getElementById('scriptTitleHeading');
    const speakScriptBtn = document.getElementById('speakScriptBtn');
    const copyScriptBtn = document.getElementById('copyScriptBtn');
    const exportScriptBtn = document.getElementById('exportScriptBtn');
    const newPromptBtn = document.getElementById('newPromptBtn');
    const geoLangBadge = document.getElementById('geoLangBadge');

    let currentType = 'movie';
    let currentScriptData = null;
    let isRecording = false;

    // ---------------------------------------------------------
    // 2. WEB AUDIO API SYNTHESIZER (ZERO ASSET DEPENDENCY)
    // ---------------------------------------------------------
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playChordChime() {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const freqs = [261.63, 329.63, 392.00, 523.25]; // C Major chord (C4, E4, G4, C5)
            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.001, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + 1.8);
            });
        } catch (e) {
            console.log('Web Audio Chord Error:', e);
        }
    }

    function playNfcTurnstileChime() {
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.55);
        } catch (e) {
            console.log('Web Audio NFC Error:', e);
        }
    }

    if (sfxJingleBtn) {
        sfxJingleBtn.addEventListener('click', playChordChime);
    }

    // ---------------------------------------------------------
    // 3. LOCATION & BROWSER AUTOMATIC LANGUAGE DETECTION
    // ---------------------------------------------------------
    const languageMap = {
        'hi': { name: 'HINDI (HI) - हिन्दी', locale: 'hi-IN', country: 'India' },
        'en': { name: 'ENGLISH (EN) - Global', locale: 'en-US', country: 'Global' },
        'es': { name: 'SPANISH (ES) - Español', locale: 'es-ES', country: 'Spain / Latin America' },
        'fr': { name: 'FRENCH (FR) - Français', locale: 'fr-FR', country: 'France' },
        'de': { name: 'GERMAN (DE) - Deutsch', locale: 'de-DE', country: 'Germany' },
        'pt': { name: 'PORTUGUESE (PT) - Português', locale: 'pt-BR', country: 'Brazil / Portugal' },
        'ar': { name: 'ARABIC (AR) - العربية', locale: 'ar-SA', country: 'Middle East' },
        'zh': { name: 'CHINESE (ZH) - 中文', locale: 'zh-CN', country: 'China' },
        'ja': { name: 'JAPANESE (JA) - 日本語', locale: 'ja-JP', country: 'Japan' },
        'ko': { name: 'KOREAN (KO) - 한국어', locale: 'ko-KR', country: 'South Korea' },
        'it': { name: 'ITALIAN (IT) - Italiano', locale: 'it-IT', country: 'Italy' },
        'ru': { name: 'RUSSIAN (RU) - Русский', locale: 'ru-RU', country: 'Russia' },
        'nl': { name: 'DUTCH (NL) - Nederlands', locale: 'nl-NL', country: 'Netherlands' },
        'tr': { name: 'TURKISH (TR) - Türkçe', locale: 'tr-TR', country: 'Turkey' }
    };

    function detectUserLocationLanguage() {
        const savedLang = localStorage.getItem('multiplex_user_lang');
        if (savedLang && languageMap[savedLang]) {
            return { lang: savedLang, method: 'Saved Preference' };
        }

        const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        for (const code of Object.keys(languageMap)) {
            if (browserLang.startsWith(code)) {
                return { lang: code, method: `Browser (${browserLang})` };
            }
        }

        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.includes('Delhi') || timeZone.includes('India')) {
                return { lang: 'hi', method: 'Location (India)' };
            }
            if (timeZone.includes('Paris')) return { lang: 'fr', method: 'Location (France)' };
            if (timeZone.includes('Berlin') || timeZone.includes('Vienna')) return { lang: 'de', method: 'Location (Germany)' };
            if (timeZone.includes('Madrid') || timeZone.includes('Mexico') || timeZone.includes('Bogota') || timeZone.includes('Buenos_Aires')) {
                return { lang: 'es', method: 'Location (Hispanic Region)' };
            }
            if (timeZone.includes('Sao_Paulo') || timeZone.includes('Lisbon')) return { lang: 'pt', method: 'Location (Brazil/Portugal)' };
            if (timeZone.includes('Tokyo')) return { lang: 'ja', method: 'Location (Japan)' };
            if (timeZone.includes('Seoul')) return { lang: 'ko', method: 'Location (Korea)' };
            if (timeZone.includes('Shanghai') || timeZone.includes('Taipei') || timeZone.includes('Hong_Kong')) return { lang: 'zh', method: 'Location (China)' };
            if (timeZone.includes('Dubai') || timeZone.includes('Riyadh') || timeZone.includes('Cairo')) return { lang: 'ar', method: 'Location (Middle East)' };
            if (timeZone.includes('Rome')) return { lang: 'it', method: 'Location (Italy)' };
            if (timeZone.includes('Moscow')) return { lang: 'ru', method: 'Location (Russia)' };
            if (timeZone.includes('Amsterdam')) return { lang: 'nl', method: 'Location (Netherlands)' };
            if (timeZone.includes('Istanbul')) return { lang: 'tr', method: 'Location (Turkey)' };
        } catch (e) {
            console.log('Timezone detection error:', e);
        }

        return { lang: 'en', method: 'Default (Global)' };
    }

    if (languageSelect) {
        languageSelect.innerHTML = '';
        Object.keys(languageMap).forEach(code => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = languageMap[code].name;
            languageSelect.appendChild(opt);
        });

        const detected = detectUserLocationLanguage();
        languageSelect.value = detected.lang;

        if (geoLangBadge) {
            geoLangBadge.innerHTML = `📍 Location Auto-Detect: <b>${languageMap[detected.lang].name.split('-')[0].trim()}</b>`;
        }

        languageSelect.addEventListener('change', function() {
            const selected = this.value;
            localStorage.setItem('multiplex_user_lang', selected);
            if (geoLangBadge) {
                geoLangBadge.innerHTML = `🌐 Language: <b>${languageMap[selected].name.split('-')[0].trim()}</b>`;
            }
            if (['movie', 'song', 'radio', 'documentary', 'podcast'].includes(currentType)) {
                generateEntertainmentContent(currentType);
            }
        });
    }

    // ---------------------------------------------------------
    // 4. STUDIO & HUB TAB SWITCHER (8 HUBS)
    // ---------------------------------------------------------
    function showHub(tabType) {
        currentType = tabType;
        studioTabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.studio-tab-btn[data-type="${tabType}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Hide all hubs
        if (contentDisplay) contentDisplay.classList.add('hidden');
        if (seatSelectorHub) seatSelectorHub.classList.add('hidden');
        if (concessionsHub) concessionsHub.classList.add('hidden');
        if (triviaHub) triviaHub.classList.add('hidden');

        if (tabType === 'tickets') {
            if (seatSelectorHub) seatSelectorHub.classList.remove('hidden');
            renderSeatMatrix();
        } else if (tabType === 'concessions') {
            if (concessionsHub) concessionsHub.classList.remove('hidden');
        } else if (tabType === 'trivia') {
            if (triviaHub) triviaHub.classList.remove('hidden');
        } else {
            if (contentDisplay) contentDisplay.classList.remove('hidden');
            generateEntertainmentContent(tabType);
        }
    }

    studioTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            showHub(this.dataset.type);
        });
    });

    // ---------------------------------------------------------
    // 5. VOICE MICROPHONE INPUT
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
                    const currentLang = languageSelect ? languageSelect.value : 'en';
                    recognition.lang = (languageMap[currentLang] && languageMap[currentLang].locale) || 'en-US';
                    recognition.start();
                    voiceMicBtn.classList.add('recording');
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
            if (['movie', 'song', 'radio', 'documentary', 'podcast'].includes(currentType)) {
                generateEntertainmentContent(currentType);
            }
        };

        recognition.onerror = function() {
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
            if (quickThemeInput) quickThemeInput.placeholder = "Enter custom premise...";
        };

        recognition.onend = function() {
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
            if (quickThemeInput) quickThemeInput.placeholder = "Enter custom premise...";
        };
    }

    // ---------------------------------------------------------
    // 6. RANDOMIZE / SURPRISE ME
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
            if (['movie', 'song', 'radio', 'documentary', 'podcast'].includes(currentType)) {
                generateEntertainmentContent(currentType);
            }
        });
    }

    if (quickGenerateBtn) {
        quickGenerateBtn.addEventListener('click', function() {
            if (['movie', 'song', 'radio', 'documentary', 'podcast'].includes(currentType)) {
                generateEntertainmentContent(currentType);
            } else {
                showHub('movie');
            }
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
    // 7. SCRIPT GENERATION SIMULATION & BACKEND SYNC
    // ---------------------------------------------------------
    function buildClientSimulation(type, age, lang, genre, userTheme) {
        const theme = userTheme || 'Epic Galactic Odyssey';
        const langInfo = languageMap[lang] || languageMap['en'];
        const langName = langInfo.name.split('-')[0].trim();

        if (type === 'movie') {
            if (lang === 'hi') {
                return `<h2>🎥 विशेष ब्लॉकबस्टर पटकथा: "होराइजन नियॉन की दास्तान"</h2>
<p><b>शैली:</b> ${genre.toUpperCase()} | <b>आयु वर्ग:</b> ${age.toUpperCase()} | <b>भाषा:</b> ${langName}</p>
<p><b>विषय (Theme):</b> "${theme}"</p>
<br/>
<h3>🌟 कहानी का सार (Logline):</h3>
<blockquote>2088 के साइबरपंक शहर में, एक विद्रोही साउंड आर्किटेक्ट को एक ऐसा गुप्त संकेत मिलता है जो ग्रह के केंद्रीय एआई नेटवर्क द्वारा मिटाई गई यादों को अनलॉक कर देता है।</blockquote>
<br/>
<h3>🎬 मुख्य पात्र:</h3>
<p>• <b>कैलन वोस (मुख्य नायक):</b> अंडरग्राउंड ऑडियो इंजीनियर और सिंथ मास्टर।</p>
<p>• <b>आर्या चेन:</b> साइबर क्राइम ब्रांच की मुख्य अन्वेषक।</p>
<br/>
<h3>🎭 दृश्य पटकथा (Scene Script - Act I):</h3>
<p><b>[स्थान: अंडरग्राउंड साउंड लैब - रात]</b><br/>
छत पर बारिश की बूंदें गिर रही हैं। लाल और सुनहरी होलोग्राफिक तरंगें हवा में तैर रही हैं।</p>
<br/>
<p><b>कैलन:</b><br/><i>"वे कहते हैं कि पुरानी यादें मिट चुकी हैं... लेकिन तरंगे कभी नहीं मरतीं, वे बस सुने जाने का इंतज़ार करती हैं।"</i></p>`;
            }

            return `<h2>🎥 Featured Blockbuster Screenplay: "Chronicles of Horizon Neo"</h2>
<p><b>Genre:</b> ${genre.toUpperCase()} | <b>Age Tier:</b> ${age.toUpperCase()} | <b>Language:</b> ${langName}</p>
<p><b>Theme:</b> "${theme}"</p>
<br/>
<h3>🌟 Story Logline:</h3>
<blockquote>In the neon-bathed megacity of Neo-Kyoto in 2088, a rebel sound architect discovers an encrypted harmonic signal capable of unlocking human memories suppressed by the planetary neural network.</blockquote>
<br/>
<h3>🎬 Key Characters:</h3>
<p>• <b>Kaelen Voss (Protagonist):</b> Rogue audio engineer and synth master.</p>
<p>• <b>Aria Chen:</b> Lead cybernetics investigator tracking the broadcast.</p>
<br/>
<h3>🎭 Act I Opening Scene:</h3>
<p><b>[INT. UNDERGROUND SYNTH LAB - NIGHT]</b><br/>
Rain drums against the plexiglass skylight. Holographic waveforms pulse in vibrant crimson and gold. Kaelen adjusts the frequency slider.</p>
<br/>
<p><b>KAELEN:</b><br/><i>"They told us the past was deleted. But frequencies don't vanish... they just wait to be heard."</i></p>`;
        }

        if (type === 'song') {
            if (lang === 'hi') {
                return `<h2>🎵 मूल गीत और स्वरलिपि: "सितारों की गूंज"</h2>
<p><b>शैली:</b> ${genre.toUpperCase()} पॉप / ध्वनिक | <b>ताल (BPM):</b> 124 | <b>भाषा:</b> ${langName}</p>
<p><b>भाव:</b> "${theme}"</p>
<br/>
<h3>🎸 [पहला अंतरा (Verse 1)]</h3>
<p>शहर की रोशनियों में ढूंढता हूं तुझे,<br/>
हर धड़कन में सुनाई देती है तेरी सदा मुझे।<br/>
सपनों के आसमान में नई सुबह का रंग है,<br/>
तेरे संग हर सफर जैसे नया उमंग है।</p>
<br/>
<h3>✨ [मुखड़ा (Chorus)]</h3>
<blockquote>हम हैं तारों की तरह जो रात में चमकते हैं,<br/>
रोशनी की राह पर बेख़ौफ़ आगे बढ़ते हैं।<br/>
हाथ थाम ले मेरा, मंज़िलें बुलाती हैं,<br/>
हवाएं भी अब हमारा ही तराना गाती हैं!</blockquote>`;
            }

            return `<h2>🎵 Hit Single & Lyric Master: "Echoes in the Starlight"</h2>
<p><b>Genre:</b> ${genre.toUpperCase()} Pop / Acoustic | <b>BPM:</b> 124 | <b>Key:</b> G Major | <b>Language:</b> ${langName}</p>
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
We'll be dancing till the break of day!</blockquote>`;
        }

        if (type === 'radio') {
            return `<h2>📻 Live Radio Broadcast: "Nightwave FM 104.5 — The Pulse"</h2>
<p><b>Format:</b> Interactive Late-Night Talk & Beats | <b>Audience:</b> ${age.toUpperCase()} | <b>Language:</b> ${langName}</p>
<p><b>Show Topic:</b> "${theme}"</p>
<br/>
<h3>🎙️ [ON AIR INTRO]</h3>
<p><b>[SFX: STATION CHIME JINGLE & SUBTLE VINYL CRACKLE]</b></p>
<br/>
<p><b>RJ MAX:</b><br/>
<i>"Good evening night owls! You are locked in with RJ Max on Nightwave FM 104.5 in ${langName}. Tonight, we're diving deep into our listener spotlight: '${theme}'. Caller Line 3 is live right now!"</i></p>`;
        }

        if (type === 'documentary') {
            return `<h2>📽️ IMAX Cinematic Docu-Series: "Wonders of the Unseen Realm"</h2>
<p><b>Category:</b> Nature & Science Exploration | <b>Language:</b> ${langName} | <b>Pacing:</b> Immersive 4K</p>
<p><b>Subject:</b> "${theme}"</p>
<br/>
<h3>🎙️ Narrator Voiceover [ACT I - THE HIDDEN CORRIDORS]:</h3>
<blockquote>"Beneath the tranquil canopy lies an intricate network of biological communication. Millions of fungal hyphae transmit electrical pulses, sharing nutrients across entire ancient forests in a silent symphony of survival."</blockquote>`;
        }

        return `<h2>🎙️ Podcast Master: "The Future Frontier Podcast" (Ep. #84)</h2>
<p><b>Format:</b> Deep-Dive Discussion | <b>Language:</b> ${langName} | <b>Audience:</b> ${age.toUpperCase()}</p>
<p><b>Episode Focus:</b> "${theme}"</p>
<br/>
<h3>🎧 Episode Outline:</h3>
<p>• <b>[00:00 - 04:30]:</b> Welcome & Breakdown of ${theme}.</p>
<p>• <b>[04:30 - 18:45]:</b> Expert Perspectives & Creative Frameworks.</p>
<p>• <b>[18:45 - 28:00]:</b> Summary & Actionable Takeaways.</p>`;
    }

    async function generateEntertainmentContent(type) {
        const age = ageGroupSelect ? ageGroupSelect.value : 'young_adult';
        const lang = languageSelect ? languageSelect.value : 'en';
        const genre = genreSelect ? genreSelect.value : 'sci_fi';
        const customTheme = quickThemeInput ? quickThemeInput.value.trim() : '';

        if (loadingDiv) loadingDiv.classList.remove('hidden');
        if (contentDisplay) contentDisplay.classList.add('hidden');
        if (loadingStatusText) loadingStatusText.textContent = `Assembling specialized ${type.toUpperCase()} AI agent crew in ${languageMap[lang] ? languageMap[lang].name.split('-')[0].trim() : lang}...`;

        const payload = {
            type: type,
            age_group: age,
            language: lang,
            extra: { theme: customTheme || genre, genre: genre }
        };

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'completed' && data.result) {
                    renderScriptResult(data.result, type);
                    return;
                }
            }
            throw new Error('Fallback simulation');
        } catch (e) {
            await new Promise(r => setTimeout(r, 600));
            const simResult = buildClientSimulation(type, age, lang, genre, customTheme);
            renderScriptResult(simResult, type);
        } finally {
            if (loadingDiv) loadingDiv.classList.add('hidden');
            if (contentDisplay) contentDisplay.classList.remove('hidden');
        }
    }

    function renderScriptResult(htmlContent, type) {
        currentScriptData = htmlContent;
        if (scriptBody) scriptBody.innerHTML = htmlContent;
        if (scriptTitleHeading) scriptTitleHeading.textContent = `🎬 ${type.toUpperCase()} Studio Showcase`;
        if (contentDisplay) {
            contentDisplay.classList.remove('hidden');
            contentDisplay.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // ---------------------------------------------------------
    // 8. TEXT-TO-SPEECH NARRATION (TTS)
    // ---------------------------------------------------------
    if (speakScriptBtn && 'speechSynthesis' in window) {
        speakScriptBtn.addEventListener('click', function() {
            if (scriptBody) {
                const text = scriptBody.innerText;
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                const currentLang = languageSelect ? languageSelect.value : 'en';
                utterance.lang = (languageMap[currentLang] && languageMap[currentLang].locale) || 'en-US';
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
                speakScriptBtn.textContent = '🔊 Speaking...';
                utterance.onend = () => { speakScriptBtn.textContent = '🔊 Listen Narration'; };
            }
        });
    }

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

    // ---------------------------------------------------------
    // 9. VIP SEAT MATRIX CONTROLLER (MODULE 6)
    // ---------------------------------------------------------
    let selectedSeats = ['C3', 'C4'];
    function renderSeatMatrix() {
        const grid = document.getElementById('seatMatrixGrid');
        if (!grid) return;
        grid.innerHTML = '';
        const rows = ['A', 'B', 'C', 'D'];
        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';
            const label = document.createElement('span');
            label.className = 'seat-row-label';
            label.textContent = row;
            rowDiv.appendChild(label);

            for (let i = 1; i <= 8; i++) {
                const seatId = `${row}${i}`;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'cinema-seat-btn';
                if (row === 'C' || row === 'D') btn.classList.add('vip');
                btn.textContent = i;
                btn.dataset.seat = seatId;

                if (selectedSeats.includes(seatId)) {
                    btn.classList.add('selected');
                }

                btn.addEventListener('click', function() {
                    if (selectedSeats.includes(seatId)) {
                        selectedSeats = selectedSeats.filter(s => s !== seatId);
                        btn.classList.remove('selected');
                    } else {
                        selectedSeats.push(seatId);
                        btn.classList.add('selected');
                    }
                    const passText = document.getElementById('passSeatsText');
                    if (passText) {
                        passText.textContent = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None Selected';
                    }
                });

                rowDiv.appendChild(btn);
            }
            grid.appendChild(rowDiv);
        });
    }

    const nfcGateTapBtn = document.getElementById('nfcGateTapBtn');
    if (nfcGateTapBtn) {
        nfcGateTapBtn.addEventListener('click', function() {
            playNfcTurnstileChime();
            nfcGateTapBtn.textContent = '✅ Gate Unlocked (NFC OK)';
            setTimeout(() => { nfcGateTapBtn.textContent = '📱 NFC Gate Tap'; }, 2200);
        });
    }

    const confirmSeatsBtn = document.getElementById('confirmSeatsBtn');
    if (confirmSeatsBtn) {
        confirmSeatsBtn.addEventListener('click', function() {
            playChordChime();
            alert(`🎟️ VIP Tickets Confirmed for Seats: ${selectedSeats.join(', ')}! Pass ready on your digital wallet.`);
        });
    }

    // ---------------------------------------------------------
    // 10. CONCESSIONS & SNACK BAR CONTROLLER (MODULE 7)
    // ---------------------------------------------------------
    let cart = [];
    let discountRate = 0.0;

    document.querySelectorAll('.add-snack-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            cart.push({ name, price });
            updateCartUI();
        });
    });

    const applyPromoBtn = document.getElementById('applyPromoBtn');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', function() {
            const code = (document.getElementById('promoCodeInput').value || '').trim().toUpperCase();
            if (code === 'MULTIPLEX20' || code === 'POPCORN50') {
                discountRate = 0.20;
                alert('🎉 Promo Code Applied! 20% Discount Activated.');
            } else {
                alert('❌ Invalid code. Use "MULTIPLEX20" for 20% discount.');
            }
            updateCartUI();
        });
    }

    function updateCartUI() {
        const list = document.getElementById('cartItemsList');
        const totalText = document.getElementById('cartTotalText');
        if (!list || !totalText) return;

        if (cart.length === 0) {
            list.innerHTML = '<li style="color:#94a3b8; font-size:0.9rem;">Cart is empty. Click "+ Add to Cart" above!</li>';
            totalText.textContent = '$0.00';
            return;
        }

        list.innerHTML = '';
        let subtotal = 0;
        cart.forEach((item, idx) => {
            subtotal += item.price;
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.color = '#e2e8f0';
            li.innerHTML = `<span>${item.name}</span><b>$${item.price.toFixed(2)}</b>`;
            list.appendChild(li);
        });

        const total = subtotal * (1 - discountRate);
        totalText.textContent = `$${total.toFixed(2)}` + (discountRate > 0 ? ' (20% OFF)' : '');
    }

    // ---------------------------------------------------------
    // 11. CINEPHILE TRIVIA ARENA CONTROLLER (MODULE 8)
    // ---------------------------------------------------------
    let triviaPoints = 450;
    const triviaQuestions = [
        {
            q: "Which revolutionary sci-fi film popularized 'Bullet Time' in 1999?",
            opts: ["A) The Matrix", "B) Blade Runner", "C) Minority Report", "D) Total Recall"],
            ans: 0
        },
        {
            q: "Who composed the iconic soundtrack for 'Interstellar' & 'Inception'?",
            opts: ["A) John Williams", "B) Hans Zimmer", "C) Ennio Morricone", "D) Howard Shore"],
            ans: 1
        },
        {
            q: "Which movie won the Oscar for Best Picture in 2020 (First Non-English film)?",
            opts: ["A) 1917", "B) Parasite", "C) Roma", "D) Joker"],
            ans: 1
        }
    ];
    let currentTriviaIdx = 0;

    function loadTriviaQuestion(idx) {
        const qData = triviaQuestions[idx];
        const title = document.getElementById('triviaQuestionTitle');
        const grid = document.getElementById('triviaOptionsGrid');
        const feedback = document.getElementById('triviaFeedbackText');
        if (!title || !grid) return;

        title.textContent = qData.q;
        grid.innerHTML = '';
        if (feedback) feedback.textContent = '';

        qData.opts.forEach((optText, oIdx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'trivia-btn';
            btn.textContent = optText;

            btn.addEventListener('click', function() {
                if (oIdx === qData.ans) {
                    btn.classList.add('correct');
                    triviaPoints += 50;
                    playChordChime();
                    if (feedback) feedback.textContent = '🎉 Correct Answer! +50 Multiplex Stars awarded!';
                } else {
                    btn.classList.add('incorrect');
                    if (feedback) feedback.textContent = '❌ Incorrect. Good try!';
                }
                const ptsText = document.getElementById('triviaPointsText');
                if (ptsText) ptsText.textContent = `🌟 ${triviaPoints} STARS`;

                setTimeout(() => {
                    currentTriviaIdx = (currentTriviaIdx + 1) % triviaQuestions.length;
                    loadTriviaQuestion(currentTriviaIdx);
                }, 2200);
            });

            grid.appendChild(btn);
        });
    }

    loadTriviaQuestion(0);
});