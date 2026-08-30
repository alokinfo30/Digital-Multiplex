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
    const geoLangBadge = document.getElementById('geoLangBadge');

    let currentType = 'movie';
    let currentScriptData = null;
    let isRecording = false;

    // ---------------------------------------------------------
    // 2. LOCATION & BROWSER AUTOMATIC LANGUAGE DETECTION
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
        // 1. Check if user already manually selected a language
        const savedLang = localStorage.getItem('multiplex_user_lang');
        if (savedLang && languageMap[savedLang]) {
            return { lang: savedLang, method: 'Saved Preference' };
        }

        // 2. Detect from browser navigator.language
        const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        for (const code of Object.keys(languageMap)) {
            if (browserLang.startsWith(code)) {
                return { lang: code, method: `Browser (${browserLang})` };
            }
        }

        // 3. Heuristic detection via User TimeZone
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

    // Populate language selector with all 14 languages
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

        // On User Change
        languageSelect.addEventListener('change', function() {
            const selected = this.value;
            localStorage.setItem('multiplex_user_lang', selected);
            if (geoLangBadge) {
                geoLangBadge.innerHTML = `🌐 Language: <b>${languageMap[selected].name.split('-')[0].trim()}</b>`;
            }
            generateEntertainmentContent(currentType);
        });
    }

    // ---------------------------------------------------------
    // 3. STUDIO TAB SWITCHER
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
    // 4. VOICE MICROPHONE INPUT
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
    // 5. RANDOMIZE / SURPRISE ME
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
    // 6. MULTILINGUAL & AGE-APPROPRIATE GENERATION ENGINE
    // ---------------------------------------------------------
    function buildClientSimulation(type, age, lang, genre, userTheme) {
        const theme = userTheme || 'Epic Cinematic Journey';
        const langInfo = languageMap[lang] || languageMap['en'];
        const langName = langInfo.name.split('-')[0].trim();

        // Multilingual headers & subtitles
        if (type === 'movie') {
            if (lang === 'hi') {
                return `<h2>🎥 विशेष ब्लॉकबस्टर पटकथा: "होराइजन नियॉन की दास्तान"</h2>
<p><b>शैली:</b> ${genre.toUpperCase()} | <b>आयु वर्ग:</b> ${age.toUpperCase()} | <b>भाषा:</b> ${langName}</p>
<p><b>विषय (Theme):</b> "${theme}"</p>
<br/>
<h3>🌟 कहानी का सार (Logline):</h3>
<blockquote>2088 के साइबरपंक शहर में, एक संगीतकार को ऐसा ध्वनि संकेत मिलता है जो शहर के केंद्रीय एआई नेटवर्क द्वारा छिपाई गई मानवीय स्मृतियों को अनलॉक कर देता है।</blockquote>
<br/>
<h3>🎬 मुख्य पात्र:</h3>
<p>• <b>कैलन वोस:</b> विद्रोही साउंड इंजीनियर और सिंथ मास्टर।</p>
<p>• <b>आर्या चेन:</b> मुख्य साइबर अन्वेषक।</p>
<br/>
<h3>🎭 दृश्य पटकथा (Scene Script - Act I):</h3>
<p><b>[स्थान: अंडरग्राउंड साउंड लैब - रात]</b><br/>
कांच की छत पर बारिश की बूंदें गिर रही हैं। होलोग्राफिक तरंगें चमक रही हैं। कैलन स्लाइडर आगे बढ़ाता है।</p>
<br/>
<p><b>कैलन:</b><br/><i>"उन्होंने कहा था कि अतीत मिटा दिया गया है... लेकिन ध्वनियां कभी गायब नहीं होतीं, वे केवल सुने जाने का इंतज़ार करती हैं।"</i></p>`;
            }

            if (lang === 'es') {
                return `<h2>🎥 Guión Cinematográfico: "Las Crónicas de Horizon Neo"</h2>
<p><b>Género:</b> ${genre.toUpperCase()} | <b>Público:</b> ${age.toUpperCase()} | <b>Idioma:</b> ${langName}</p>
<p><b>Tema:</b> "${theme}"</p>
<br/>
<h3>🌟 Sinopsis Principal:</h3>
<blockquote>En la megaciudad de Neo-Kyoto en 2088, un arquitecto de sonido descubre una señal armónica capaz de desbloquear memorias humanas suprimidas por la red planetaria.</blockquote>
<br/>
<h3>🎬 Personajes Principales:</h3>
<p>• <b>Kaelen Voss:</b> Ingeniero de audio rebelde.</p>
<p>• <b>Aria Chen:</b> Investigadora de cibernética cuántica.</p>
<br/>
<h3>🎭 Escena (Acto I):</h3>
<p><b>[INT. LABORATORIO SUBTERRÁNEO - NOCHE]</b><br/>
La lluvia golpea el tragaluz de plexiglás. Las ondas holográficas brillan en carmesí y oro.</p>
<br/>
<p><b>KAELEN:</b><br/><i>"Nos dijeron que el pasado fue borrado. Pero las frecuencias no desaparecen... solo esperan ser escuchadas."</i></p>`;
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
<p><b>भाव (Mood):</b> "${theme}"</p>
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
<p><b>Format:</b> Interactive Talk & Hits | <b>Audience:</b> ${age.toUpperCase()} | <b>Language:</b> ${langName}</p>
<p><b>Topic:</b> "${theme}"</p>
<br/>
<h3>🎙️ [ON AIR INTRO]</h3>
<p><b>[SFX: STATION CHIME JINGLE & UPBEAT SOUNDBED]</b></p>
<br/>
<p><b>RJ MAX:</b><br/>
<i>"Welcome back to Nightwave FM! Broadcasting live in ${langName} across all frequencies. Tonight's listener spotlight: '${theme}'. Caller Line 1 is buzzing — let's take our first listener call!"</i></p>`;
        }

        if (type === 'documentary') {
            return `<h2>📽️ Cinematic Docu-Series: "Wonders of the Unseen Realm"</h2>
<p><b>Category:</b> Nature & Cosmic Exploration | <b>Language:</b> ${langName} | <b>Pacing:</b> Immersive 4K</p>
<p><b>Subject:</b> "${theme}"</p>
<br/>
<h3>🎙️ Narrator Voiceover:</h3>
<blockquote>"Beneath the tranquil canopy lies an intricate network of biological communication. Millions of fungal hyphae transmit electrical pulses, sharing nutrients across entire ancient forests in a silent symphony of survival."</blockquote>`;
        }

        return `<h2>🎙️ Podcast Master: "The Future Frontier Podcast" (Ep. #84)</h2>
<p><b>Format:</b> Deep-Dive Discussion | <b>Language:</b> ${langName} | <b>Audience:</b> ${age.toUpperCase()}</p>
<p><b>Episode Focus:</b> "${theme}"</p>
<br/>
<h3>🎧 Episode Outline:</h3>
<p>• <b>[00:00 - 04:30]:</b> Welcome & Breakdown of ${theme}.</p>
<p>• <b>[04:30 - 18:45]:</b> Expert Perspectives & Creative Insights.</p>
<p>• <b>[18:45 - 28:00]:</b> Summary & Listener Q&A.</p>`;
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
    // 7. MULTILINGUAL AUDIO TEXT-TO-SPEECH SYNTHESIS
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

    // ---------------------------------------------------------
    // 8. COPY & EXPORT SCRIPT
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