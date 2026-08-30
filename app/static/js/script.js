document.addEventListener('DOMContentLoaded', function() {
    // ---------------------------------------------------------
    // 1. DOM ELEMENTS & STATE INITIALIZATION
    // ---------------------------------------------------------
    const studioTabs = document.querySelectorAll('.studio-tab-btn');
    const ageGroupSelect = document.getElementById('ageGroup');
    const languageSelect = document.getElementById('language');
    const movieDubLanguage = document.getElementById('movieDubLanguage');
    const genreSelect = document.getElementById('genreSelect');
    const quickThemeInput = document.getElementById('quickThemeInput');
    const quickGenerateBtn = document.getElementById('quickGenerateBtn');
    const randomizeBtn = document.getElementById('randomizeBtn');
    const voiceMicBtn = document.getElementById('voiceMicBtn');
    const dimLightsBtn = document.getElementById('dimLightsBtn');
    const spatialAudioBtn = document.getElementById('spatialAudioBtn');
    
    // Hub Containers
    const virtualTheaterHub = document.getElementById('virtualTheaterHub');
    const converterHub = document.getElementById('converterHub');
    const globalCatalogHub = document.getElementById('globalCatalogHub');
    const recommendationsHub = document.getElementById('recommendationsHub');
    const contentDisplay = document.getElementById('contentDisplay');
    const seatSelectorHub = document.getElementById('seatSelectorHub');
    const concessionsHub = document.getElementById('concessionsHub');
    const triviaHub = document.getElementById('triviaHub');
    const loadingDiv = document.getElementById('loading');
    const loadingStatusText = document.getElementById('loadingStatusText');
    const geoLangBadge = document.getElementById('geoLangBadge');
    const catalogLocationBadge = document.getElementById('catalogLocationBadge');

    // 4DX Converter Elements
    const converterMovieInput = document.getElementById('converterMovieInput');
    const converterProfileSelect = document.getElementById('converterProfileSelect');
    const executeConvertBtn = document.getElementById('executeConvertBtn');
    const converterActiveStatusText = document.getElementById('converterActiveStatusText');
    const testConverted4dxBtn = document.getElementById('testConverted4dxBtn');

    // Global Movies & Recommendations
    const globalMoviesGrid = document.getElementById('globalMoviesGrid');
    const regionTabBtns = document.querySelectorAll('.region-tab-btn');
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    const refreshRecsBtn = document.getElementById('refreshRecsBtn');
    const surpriseRecBtn = document.getElementById('surpriseRecBtn');

    // Virtual Screen & Canvas
    const canvas = document.getElementById('cinemaMovieCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const screenAmbientGlow = document.getElementById('screenAmbientGlow');
    const floatingEmojiContainer = document.getElementById('floatingEmojiContainer');
    const moviePlayPauseBtn = document.getElementById('moviePlayPauseBtn');
    const movieMuteBtn = document.getElementById('movieMuteBtn');
    const movieTrailerSwitchBtn = document.getElementById('movieTrailerSwitchBtn');
    const fullscreenTheaterBtn = document.getElementById('fullscreenTheaterBtn');
    const moviePlayingTitle = document.getElementById('moviePlayingTitle');
    const imaxScreenWrapper = document.getElementById('imaxScreenWrapper');
    const theaterStrobeOverlay = document.getElementById('theaterStrobeOverlay');
    const screenFogOverlay = document.getElementById('screenFogOverlay');
    const auditoriumSeatsContainer = document.getElementById('auditoriumSeatsContainer');

    // 4DX Triggers
    const triggerSeatRumbleBtn = document.getElementById('triggerSeatRumbleBtn');
    const triggerAirBlastBtn = document.getElementById('triggerAirBlastBtn');
    const triggerStrobeBtn = document.getElementById('triggerStrobeBtn');
    const triggerFogBtn = document.getElementById('triggerFogBtn');
    const toggleAuto4dxBtn = document.getElementById('toggleAuto4dxBtn');
    const hud4dxMotion = document.getElementById('hud4dxMotion');
    const hud4dxWind = document.getElementById('hud4dxWind');
    const hud4dxMist = document.getElementById('hud4dxMist');

    // Watch Party & Chat
    const chatMessagesBox = document.getElementById('chatMessagesBox');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const privateRoomCodeInput = document.getElementById('privateRoomCodeInput');
    const copyInviteLinkBtn = document.getElementById('copyInviteLinkBtn');
    const joinPrivateRoomBtn = document.getElementById('joinPrivateRoomBtn');
    const avatarNameInput = document.getElementById('avatarNameInput');
    const updateAvatarBtn = document.getElementById('updateAvatarBtn');
    const auditoriumSeatsRow = document.getElementById('auditoriumSeatsRow');
    const hallPillBtns = document.querySelectorAll('.hall-pill-btn');

    // Script Display Elements
    const scriptBody = document.getElementById('scriptBody');
    const scriptTitleHeading = document.getElementById('scriptTitleHeading');
    const speakScriptBtn = document.getElementById('speakScriptBtn');
    const copyScriptBtn = document.getElementById('copyScriptBtn');
    const exportScriptBtn = document.getElementById('exportScriptBtn');
    const newPromptBtn = document.getElementById('newPromptBtn');

    let currentType = 'virtual_theater';
    let currentScriptData = null;
    let isRecording = false;
    let isMoviePlaying = true;
    let isMuted = false;
    let isLightsDimmed = false;
    let isAuto4dx = true;
    let activeFeatureFilmIdx = 0;
    let userAvatarName = 'Alex 🍿';
    let detectedCountry = 'Global';
    let activeRegion = 'all';

    // ---------------------------------------------------------
    // 2. WEB AUDIO API SYNTHESIZER (SURROUND SOUND & 4DX SFX)
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

    // Spatial Dolby Atmos Opening Swell
    function playSpatialAtmosSwell() {
        try {
            const ctxA = getAudioContext();
            const now = ctxA.currentTime;
            
            // Sub Bass Sweep
            const oscSub = ctxA.createOscillator();
            const gainSub = ctxA.createGain();
            oscSub.type = 'sine';
            oscSub.frequency.setValueAtTime(40, now);
            oscSub.frequency.exponentialRampToValueAtTime(110, now + 1.5);
            gainSub.gain.setValueAtTime(0.001, now);
            gainSub.gain.linearRampToValueAtTime(0.3, now + 0.8);
            gainSub.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
            oscSub.connect(gainSub);
            gainSub.connect(ctxA.destination);
            oscSub.start(now);
            oscSub.stop(now + 2.6);

            // Harmonic Chime Swell
            const freqs = [329.63, 392.00, 493.88, 659.25, 987.77];
            freqs.forEach((freq, idx) => {
                const osc = ctxA.createOscillator();
                const gain = ctxA.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.001, now + 0.3 + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.18, now + 0.5 + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
                osc.connect(gain);
                gain.connect(ctxA.destination);
                osc.start(now + 0.3 + idx * 0.08);
                osc.stop(now + 3.2);
            });
        } catch (e) {
            console.log('Web Audio Atmos Error:', e);
        }
    }

    // 4DX Sub-Bass Transducer Rumble
    function play4dxSubBassRumble() {
        try {
            const ctxA = getAudioContext();
            const now = ctxA.currentTime;
            const osc = ctxA.createOscillator();
            const gain = ctxA.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(45, now);
            osc.frequency.linearRampToValueAtTime(32, now + 0.4);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc.connect(gain);
            gain.connect(ctxA.destination);
            osc.start(now);
            osc.stop(now + 0.5);
        } catch (e) {
            console.log('4DX Audio Error:', e);
        }
    }

    // 4DX Air Blast White Noise Generator
    function play4dxAirBlastSFX() {
        try {
            const ctxA = getAudioContext();
            const now = ctxA.currentTime;
            const bufferSize = ctxA.sampleRate * 0.4;
            const buffer = ctxA.createBuffer(1, bufferSize, ctxA.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctxA.createBufferSource();
            noise.buffer = buffer;
            const filter = ctxA.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            const gain = ctxA.createGain();
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctxA.destination);
            noise.start(now);
        } catch (e) {
            console.log('4DX Air Blast Error:', e);
        }
    }

    function playNfcTurnstileChime() {
        try {
            const ctxA = getAudioContext();
            const now = ctxA.currentTime;
            const osc = ctxA.createOscillator();
            const gain = ctxA.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain);
            gain.connect(ctxA.destination);
            osc.start(now);
            osc.stop(now + 0.55);
        } catch (e) {
            console.log('Web Audio NFC Error:', e);
        }
    }

    // ---------------------------------------------------------
    // 3. 4DX MULTI-SENSORY EFFECT TRIGGERS & HAPTICS
    // ---------------------------------------------------------
    function trigger4dxSeatRumble() {
        if ('vibrate' in navigator) {
            navigator.vibrate([120, 40, 200, 40, 300]);
        }
        play4dxSubBassRumble();

        if (imaxScreenWrapper) {
            imaxScreenWrapper.classList.remove('cinema-4dx-shake');
            void imaxScreenWrapper.offsetWidth;
            imaxScreenWrapper.classList.add('cinema-4dx-shake');
        }
        if (auditoriumSeatsContainer) {
            auditoriumSeatsContainer.classList.remove('cinema-4dx-shake');
            void auditoriumSeatsContainer.offsetWidth;
            auditoriumSeatsContainer.classList.add('cinema-4dx-shake');
        }

        if (hud4dxMotion) {
            hud4dxMotion.textContent = '💥 Motion: RUMBLE (4DX MAX)';
            hud4dxMotion.style.color = '#f87171';
            setTimeout(() => {
                hud4dxMotion.textContent = '💥 Motion: Active';
                hud4dxMotion.style.color = '#67e8f9';
            }, 1800);
        }
    }

    function trigger4dxAirBlast() {
        play4dxAirBlastSFX();
        if (hud4dxWind) {
            hud4dxWind.textContent = '💨 Wind: 80 km/h GUST!';
            hud4dxWind.style.color = '#38bdf8';
            setTimeout(() => {
                hud4dxWind.textContent = '💨 Wind: 48 km/h';
                hud4dxWind.style.color = '#67e8f9';
            }, 1800);
        }
    }

    function trigger4dxLightningStrobe() {
        if (theaterStrobeOverlay) {
            theaterStrobeOverlay.classList.remove('active-strobe');
            void theaterStrobeOverlay.offsetWidth;
            theaterStrobeOverlay.classList.add('active-strobe');
        }
        play4dxSubBassRumble();
    }

    function trigger4dxMist() {
        if (screenFogOverlay) {
            screenFogOverlay.classList.add('active-fog');
            setTimeout(() => {
                screenFogOverlay.classList.remove('active-fog');
            }, 3000);
        }
        if (hud4dxMist) {
            hud4dxMist.textContent = '🌫️ Mist: 98% Cyber-Rain!';
            hud4dxMist.style.color = '#a7f3d0';
            setTimeout(() => {
                hud4dxMist.textContent = '🌫️ Mist: 85% Fog';
                hud4dxMist.style.color = '#67e8f9';
            }, 3000);
        }
    }

    if (triggerSeatRumbleBtn) triggerSeatRumbleBtn.addEventListener('click', trigger4dxSeatRumble);
    if (triggerAirBlastBtn) triggerAirBlastBtn.addEventListener('click', trigger4dxAirBlast);
    if (triggerStrobeBtn) triggerStrobeBtn.addEventListener('click', trigger4dxLightningStrobe);
    if (triggerFogBtn) triggerFogBtn.addEventListener('click', trigger4dxMist);

    if (toggleAuto4dxBtn) {
        toggleAuto4dxBtn.addEventListener('click', function() {
            isAuto4dx = !isAuto4dx;
            toggleAuto4dxBtn.textContent = isAuto4dx ? '🔄 Auto-4DX: ON' : '⏸️ Auto-4DX: OFF';
            toggleAuto4dxBtn.style.color = isAuto4dx ? '#38bdf8' : '#94a3b8';
        });
    }

    if (spatialAudioBtn) {
        spatialAudioBtn.addEventListener('click', function() {
            playSpatialAtmosSwell();
            spatialAudioBtn.textContent = '🔊 Dolby Atmos 3D Playing';
            setTimeout(() => { spatialAudioBtn.textContent = '🔊 Spatial Atmos SFX'; }, 3000);
        });
    }

    if (dimLightsBtn) {
        dimLightsBtn.addEventListener('click', function() {
            isLightsDimmed = !isLightsDimmed;
            document.body.classList.toggle('cinema-lights-dimmed', isLightsDimmed);
            dimLightsBtn.textContent = isLightsDimmed ? '💡 Lights On' : '💡 Dim Lights';
        });
    }

    // ---------------------------------------------------------
    // 4. LOCATION & BROWSER AUTOMATIC LANGUAGE DETECTION
    // ---------------------------------------------------------
    const languageMap = {
        'hi': { name: 'HINDI (HI) - हिन्दी', locale: 'hi-IN', country: 'India', defaultRegion: 'india' },
        'en': { name: 'ENGLISH (EN) - Global', locale: 'en-US', country: 'Global', defaultRegion: 'all' },
        'es': { name: 'SPANISH (ES) - Español', locale: 'es-ES', country: 'Spain / Latin America', defaultRegion: 'latin' },
        'fr': { name: 'FRENCH (FR) - Français', locale: 'fr-FR', country: 'France', defaultRegion: 'europe' },
        'de': { name: 'GERMAN (DE) - Deutsch', locale: 'de-DE', country: 'Germany', defaultRegion: 'europe' },
        'pt': { name: 'PORTUGUESE (PT) - Português', locale: 'pt-BR', country: 'Brazil / Portugal', defaultRegion: 'latin' },
        'ar': { name: 'ARABIC (AR) - العربية', locale: 'ar-SA', country: 'Middle East', defaultRegion: 'latin' },
        'zh': { name: 'CHINESE (ZH) - 中文', locale: 'zh-CN', country: 'China', defaultRegion: 'japan' },
        'ja': { name: 'JAPANESE (JA) - 日本語', locale: 'ja-JP', country: 'Japan', defaultRegion: 'japan' },
        'ko': { name: 'KOREAN (KO) - 한국어', locale: 'ko-KR', country: 'South Korea', defaultRegion: 'korea' },
        'it': { name: 'ITALIAN (IT) - Italiano', locale: 'it-IT', country: 'Italy', defaultRegion: 'europe' },
        'ru': { name: 'RUSSIAN (RU) - Русский', locale: 'ru-RU', country: 'Russia', defaultRegion: 'europe' },
        'nl': { name: 'DUTCH (NL) - Nederlands', locale: 'nl-NL', country: 'Netherlands', defaultRegion: 'europe' },
        'tr': { name: 'TURKISH (TR) - Türkçe', locale: 'tr-TR', country: 'Turkey', defaultRegion: 'europe' }
    };

    function detectUserLocationLanguage() {
        const savedLang = localStorage.getItem('multiplex_user_lang');
        if (savedLang && languageMap[savedLang]) {
            return { lang: savedLang, method: 'Saved Preference', region: languageMap[savedLang].defaultRegion };
        }

        const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        for (const code of Object.keys(languageMap)) {
            if (browserLang.startsWith(code)) {
                return { lang: code, method: `Browser (${browserLang})`, region: languageMap[code].defaultRegion };
            }
        }

        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.includes('Delhi') || timeZone.includes('India')) {
                return { lang: 'hi', method: 'Location (India)', region: 'india' };
            }
            if (timeZone.includes('Paris')) return { lang: 'fr', method: 'Location (France)', region: 'europe' };
            if (timeZone.includes('Berlin') || timeZone.includes('Vienna')) return { lang: 'de', method: 'Location (Germany)', region: 'europe' };
            if (timeZone.includes('Madrid') || timeZone.includes('Mexico') || timeZone.includes('Bogota') || timeZone.includes('Buenos_Aires')) {
                return { lang: 'es', method: 'Location (Hispanic Region)', region: 'latin' };
            }
            if (timeZone.includes('Sao_Paulo') || timeZone.includes('Lisbon')) return { lang: 'pt', method: 'Location (Brazil/Portugal)', region: 'latin' };
            if (timeZone.includes('Tokyo')) return { lang: 'ja', method: 'Location (Japan)', region: 'japan' };
            if (timeZone.includes('Seoul')) return { lang: 'ko', method: 'Location (Korea)', region: 'korea' };
            if (timeZone.includes('Shanghai') || timeZone.includes('Taipei') || timeZone.includes('Hong_Kong')) return { lang: 'zh', method: 'Location (China)', region: 'japan' };
            if (timeZone.includes('Dubai') || timeZone.includes('Riyadh') || timeZone.includes('Cairo')) return { lang: 'ar', method: 'Location (Middle East)', region: 'latin' };
            if (timeZone.includes('Rome')) return { lang: 'it', method: 'Location (Italy)', region: 'europe' };
            if (timeZone.includes('Moscow')) return { lang: 'ru', method: 'Location (Russia)', region: 'europe' };
            if (timeZone.includes('Amsterdam')) return { lang: 'nl', method: 'Location (Netherlands)', region: 'europe' };
            if (timeZone.includes('Istanbul')) return { lang: 'tr', method: 'Location (Turkey)', region: 'europe' };
        } catch (e) {
            console.log('Timezone detection error:', e);
        }

        return { lang: 'en', method: 'Default (Global)', region: 'all' };
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
        detectedCountry = languageMap[detected.lang].country;
        activeRegion = detected.region;

        if (geoLangBadge) {
            geoLangBadge.innerHTML = `📍 Location: <b>${languageMap[detected.lang].country} (${languageMap[detected.lang].name.split('-')[0].trim()})</b>`;
        }
        if (catalogLocationBadge) {
            catalogLocationBadge.innerHTML = `📍 Auto-Filtered: <b>${languageMap[detected.lang].country}</b>`;
        }

        languageSelect.addEventListener('change', function() {
            const selected = this.value;
            localStorage.setItem('multiplex_user_lang', selected);
            if (geoLangBadge) {
                geoLangBadge.innerHTML = `🌐 Language: <b>${languageMap[selected].name.split('-')[0].trim()}</b>`;
            }
            renderGlobalMovies(languageMap[selected].defaultRegion);
            renderRecommendations();
            if (['movie', 'song', 'radio', 'documentary', 'podcast'].includes(currentType)) {
                generateEntertainmentContent(currentType);
            }
        });
    }

    if (movieDubLanguage) {
        movieDubLanguage.addEventListener('change', function() {
            const dub = this.options[this.selectedIndex].text;
            broadcastChatMessage('System', `🔊 Switched movie audio track to: ${dub}`);
            playSpatialAtmosSwell();
        });
    }

    if (genreSelect) {
        genreSelect.addEventListener('change', function() {
            renderRecommendations();
            renderGlobalMovies(activeRegion);
        });
    }

    if (ageGroupSelect) {
        ageGroupSelect.addEventListener('change', function() {
            renderRecommendations();
        });
    }

    // ---------------------------------------------------------
    // 5. UNIVERSAL 4DX MOVIE CONVERTER ENGINE
    // ---------------------------------------------------------
    function convertAnyMovieTo4DX(movieTitleOrUrl, profile = 'turbo') {
        const title = (movieTitleOrUrl || 'Featured 4DX Masterpiece').trim();
        
        let profileTag = '4DX Turbo Haptics (Max Motion)';
        let colorA = '#ef4444';
        let colorB = '#f59e0b';

        if (profile === 'action') {
            profileTag = '4DX Action & Combat (Explosion Jolt + Strobes)';
            colorA = '#dc2626';
            colorB = '#38bdf8';
        } else if (profile === 'nature') {
            profileTag = '4DX Nature & Ocean (Mist + Wind Gusts)';
            colorA = '#10b981';
            colorB = '#06b6d4';
        } else if (profile === 'space') {
            profileTag = '4DX Deep Space IMAX (Sub-Bass Transducer)';
            colorA = '#8b5cf6';
            colorB = '#38bdf8';
        }

        featureFilms[activeFeatureFilmIdx] = {
            title: title,
            tag: `⚡ Converted to 4DX • ${profileTag}`,
            sub: `Real-time audio-visual frequency analysis active for "${title}" with full haptic seat synchronization.`,
            colorA: colorA,
            colorB: colorB,
            theme: profile
        };

        if (moviePlayingTitle) {
            moviePlayingTitle.textContent = `NOW SCREENING IN 4DX: "${title}" (${profileTag})`;
        }

        if (converterActiveStatusText) {
            converterActiveStatusText.textContent = `✅ Successfully Converted "${title}" to 4DX! Live Haptic Stream Synced.`;
        }

        playSpatialAtmosSwell();
        trigger4dxSeatRumble();
        trigger4dxAirBlast();

        broadcastChatMessage('4DX Synthesizer', `⚡ Converted "${title}" into live 4DX experience for all viewers!`);

        showHub('virtual_theater');
        window.scrollTo({ top: 120, behavior: 'smooth' });
    }

    if (executeConvertBtn) {
        executeConvertBtn.addEventListener('click', function() {
            const inputVal = converterMovieInput ? converterMovieInput.value : '';
            const profile = converterProfileSelect ? converterProfileSelect.value : 'turbo';
            convertAnyMovieTo4DX(inputVal || 'Interstellar 4DX Laser', profile);
        });
    }

    if (testConverted4dxBtn) {
        testConverted4dxBtn.addEventListener('click', function() {
            trigger4dxSeatRumble();
            trigger4dxAirBlast();
            trigger4dxLightningStrobe();
        });
    }

    // ---------------------------------------------------------
    // 6. WORLDWIDE MOVIE CATALOG (LOCATION-BASED AUTO-FILTER)
    // ---------------------------------------------------------
    const worldwideMoviesCatalog = [
        // India & Bollywood
        {
            id: 'in_rrr',
            region: 'india',
            title: 'RRR: Rise Roar Revolt (4DX Extreme)',
            country: '🇮🇳 India (Tollywood / Pan-India)',
            tag: 'Action & Fire vs Water • 4DX Maximum Rumble',
            rating: '⭐ 9.5/10 • Oscar Winner',
            duration: '3h 07m',
            dubs: 'Hindi, Telugu, Tamil, English Dub, Japanese Dub',
            desc: 'Two legendary revolutionaries fight against British colonial rule with heart-stopping stunts and fire-burst sequences.',
            colorA: '#ef4444',
            colorB: '#f59e0b'
        },
        {
            id: 'in_kalki',
            region: 'india',
            title: 'Kalki 2898 AD: The Cybernetic Avatar',
            country: '🇮🇳 India (Sci-Fi Epic)',
            tag: 'Futuristic Dystopia • Sub-Bass Laser 4DX',
            rating: '⭐ 9.3/10 • Global Blockbuster',
            duration: '3h 01m',
            dubs: 'Hindi, Telugu, English, French Dub',
            desc: 'In the year 2898 AD in Kasi, a dystopian empire is challenged by ancient prophecies and high-tech warriors.',
            colorA: '#06b6d4',
            colorB: '#f59e0b'
        },
        {
            id: 'in_jawan',
            region: 'india',
            title: 'Jawan: High-Octane Vigilante 4DX',
            country: '🇮🇳 India (Bollywood)',
            tag: 'Adrenaline Thriller • Air Blast Speed',
            rating: '⭐ 9.1/10 • All-Time Record',
            duration: '2h 49m',
            dubs: 'Hindi, Tamil, Telugu, English Dub',
            desc: 'A man driven by a personal vendetta to rectify the wrongs in society with massive explosive action set pieces.',
            colorA: '#b91c1c',
            colorB: '#f59e0b'
        },
        // Hollywood
        {
            id: 'us_avatar2',
            region: 'hollywood',
            title: 'Avatar: The Way of Water (4DX Ocean Immersion)',
            country: '🇺🇸 Hollywood (Global)',
            tag: 'IMAX 3D Laser • 4DX Mist & Rain Chamber',
            rating: '⭐ 9.4/10 • $2.3B Worldwide',
            duration: '3h 12m',
            dubs: 'English, Hindi Dub, Spanish Dub, French Dub, Japanese Dub',
            desc: 'Jake Sully and Neytiri explore the majestic oceanic reefs of Pandora with immersive underwater haptics.',
            colorA: '#0284c7',
            colorB: '#10b981'
        },
        {
            id: 'us_dune2',
            region: 'hollywood',
            title: 'Dune: Part Two (4DX Sandstorm & Shai-Hulud)',
            country: '🇺🇸 Hollywood (Sci-Fi Masterpiece)',
            tag: 'Desert Sandstorm Wind • Sub-Bass Worm Rumble',
            rating: '⭐ 9.6/10 • Critics Top Choice',
            duration: '2h 46m',
            dubs: 'English, Hindi Dub, Spanish Dub, German Dub',
            desc: 'Paul Atreides unites with the Fremen on the desert planet Arrakis with seismic sandworm riding vibrations.',
            colorA: '#f59e0b',
            colorB: '#d97706'
        },
        {
            id: 'us_oppenheimer',
            region: 'hollywood',
            title: 'Oppenheimer (4DX Trinity Shockwave)',
            country: '🇺🇸 Hollywood (70mm IMAX)',
            tag: 'Quantum Physics • Shockwave Seat Jolt',
            rating: '⭐ 9.5/10 • 7 Oscar Wins',
            duration: '3h 00m',
            dubs: 'English, Hindi Dub, French, German, Italian Dub',
            desc: 'The dramatic story of J. Robert Oppenheimer and the Trinity nuclear test that changed the world forever.',
            colorA: '#ea580c',
            colorB: '#fbbf24'
        },
        // Japan & Anime
        {
            id: 'jp_demon_slayer',
            region: 'japan',
            title: 'Demon Slayer: Infinity Castle 4DX',
            country: '🇯🇵 Japan (Anime Blockbuster)',
            tag: 'Flame & Water Breathing • Lightning Strobe FX',
            rating: '⭐ 9.7/10 • Record Breaking Anime',
            duration: '2h 15m',
            dubs: 'Japanese Original, English Dub, Hindi Dub, Spanish Dub',
            desc: 'Tanjiro and the Hashira invade the shifting Infinity Castle in an ultimate clash of elemental breathing techniques.',
            colorA: '#ef4444',
            colorB: '#a855f7'
        },
        {
            id: 'jp_spirited_away',
            region: 'japan',
            title: 'Spirited Away (Studio Ghibli 4DX Remaster)',
            country: '🇯🇵 Japan (Ghibli Classic)',
            tag: 'Spiritual Realm • Gentle Mist & Wind Breeze',
            rating: '⭐ 9.8/10 • Oscar Winning Legend',
            duration: '2h 05m',
            dubs: 'Japanese Original, English Dub, French Dub, Hindi Dub',
            desc: 'A young girl wanders into a magical world of spirits and witches, embarking on an unforgettable journey.',
            colorA: '#10b981',
            colorB: '#38bdf8'
        },
        // Korea
        {
            id: 'kr_parasite',
            region: 'korea',
            title: 'Parasite (Black & White 4DX Edition)',
            country: '🇰🇷 South Korea (Palme d\'Or & Oscar)',
            tag: 'Psychological Tension • Rainstorm Flood 4DX',
            rating: '⭐ 9.6/10 • Historic Oscar Winner',
            duration: '2h 12m',
            dubs: 'Korean Original, English Dub, Spanish Dub, Hindi Dub',
            desc: 'Greed and class discrimination threaten the newly formed symbiotic relationship between two contrasting families.',
            colorA: '#475569',
            colorB: '#06b6d4'
        },
        {
            id: 'kr_busan',
            region: 'korea',
            title: 'Train to Busan (4DX Express Motion)',
            country: '🇰🇷 South Korea (Zombie Thriller)',
            tag: 'High-Speed Locomotive Jolt • Intense Action',
            rating: '⭐ 9.2/10 • Worldwide Cult Hit',
            duration: '1h 58m',
            dubs: 'Korean Original, English Dub, Hindi Dub',
            desc: 'Passengers on a bullet train fight for survival as a viral outbreak spreads uncontrollably across South Korea.',
            colorA: '#b91c1c',
            colorB: '#38bdf8'
        },
        // Europe (France, Germany, Spain)
        {
            id: 'eu_anatomy',
            region: 'europe',
            title: 'Anatomy of a Fall (4DX Acoustic Courtroom)',
            country: '🇫🇷 France (Palme d\'Or Winner)',
            tag: 'Alpine Snowstorm Mist • Dolby Atmos Acoustics',
            rating: '⭐ 9.2/10 • Oscar Winner',
            duration: '2h 31m',
            dubs: 'French Original, English, German Dub, Spanish Dub',
            desc: 'A woman is suspected of murder after her husband\'s death in the French Alps, leading to a gripping courtroom thriller.',
            colorA: '#38bdf8',
            colorB: '#f8fafc'
        },
        {
            id: 'eu_dark',
            region: 'europe',
            title: 'Dark: The Time Odyssey (4DX Chrono Wave)',
            country: '🇩🇪 Germany (Mind-Bending Mystery)',
            tag: 'Temporal Lightning Strobe • Rain Forest Mist',
            rating: '⭐ 9.5/10 • Global Phenomenon',
            duration: '2h 20m',
            dubs: 'German Original, English Dub, Spanish Dub, Hindi Dub',
            desc: 'Four families unravel a sinister time-travel conspiracy spanning several generations across a mysterious German town.',
            colorA: '#f59e0b',
            colorB: '#3b82f6'
        },
        // Latin America & Middle East
        {
            id: 'lat_pans',
            region: 'latin',
            title: 'Pan\'s Labyrinth (4DX Fairy Tale Noir)',
            country: '🇲🇽/🇪🇸 Spain & Mexico (Guillermo del Toro)',
            tag: 'Dark Fantasy • Forest Mist & Creature Haptics',
            rating: '⭐ 9.4/10 • 3 Oscar Wins',
            duration: '1h 58m',
            dubs: 'Spanish Original, English Dub, French Dub',
            desc: 'In 1944 Spain, a young girl discovers a mythical labyrinth and an ancient faun who offers her magical trials.',
            colorA: '#15803d',
            colorB: '#b45309'
        },
        {
            id: 'me_theeb',
            region: 'latin',
            title: 'Theeb: Wolf of the Desert 4DX',
            country: '🇯🇴/🇸🇦 Jordan & Middle East',
            tag: 'Desert Sun Heat • Sandstorm Air Blast',
            rating: '⭐ 9.0/10 • Oscar Nominee',
            duration: '1h 40m',
            dubs: 'Arabic Original, English Subtitles, French Dub',
            desc: 'In 1916 Arabia, a young Bedouin boy embarks on a perilous journey across the vast Wadi Rum desert.',
            colorA: '#d97706',
            colorB: '#b45309'
        }
    ];

    function renderGlobalMovies(regionFilter = 'all') {
        if (!globalMoviesGrid) return;
        globalMoviesGrid.innerHTML = '';

        let filtered = worldwideMoviesCatalog;
        if (regionFilter && regionFilter !== 'all') {
            filtered = worldwideMoviesCatalog.filter(m => m.region === regionFilter);
        }

        filtered.forEach(m => {
            const card = document.createElement('div');
            card.className = 'global-movie-card';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="movie-country-badge">${m.country}</span>
                    <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">${m.duration}</span>
                </div>
                <div>
                    <h3 style="color:#fff; font-size:1.1rem; font-weight:800;">${m.title}</h3>
                    <div style="font-size:0.76rem; color:#f59e0b; font-weight:700; margin-top:3px;">${m.rating} • <span style="color:#38bdf8;">${m.tag}</span></div>
                    <div style="font-size:0.72rem; color:#6ee7b7; margin-top:2px;">🎙️ Dubs: ${m.dubs}</div>
                </div>
                <p style="font-size:0.82rem; color:#cbd5e1; line-height:1.5;">${m.desc}</p>
                <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                    <button type="button" class="btn-generate-action screen-global-btn" data-id="${m.id}" style="padding:8px 14px; font-size:0.82rem;">⚡ Convert & Screen in 4DX</button>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="btn-secondary-action book-global-btn" style="flex:1; padding:6px; font-size:0.78rem;">🎟️ Book Seats</button>
                        <button type="button" class="btn-secondary-action share-global-btn" style="flex:1; padding:6px; font-size:0.78rem;">💬 Share</button>
                    </div>
                </div>
            `;

            // Screen button
            const screenBtn = card.querySelector('.screen-global-btn');
            screenBtn.addEventListener('click', function() {
                convertAnyMovieTo4DX(m.title, m.region === 'india' ? 'action' : (m.region === 'japan' ? 'turbo' : 'space'));
            });

            // Book button
            const bookBtn = card.querySelector('.book-global-btn');
            bookBtn.addEventListener('click', function() {
                showHub('tickets');
            });

            // Share button
            const shareBtn = card.querySelector('.share-global-btn');
            shareBtn.addEventListener('click', function() {
                const roomCode = (privateRoomCodeInput && privateRoomCodeInput.value) || 'FAMILY-2026';
                const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
                const text = `🎬 Let's watch "${m.title}" (${m.country}) in 4DX together on Digital Multiplex! Join our VIP room: ${url}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            });

            globalMoviesGrid.appendChild(card);
        });
    }

    regionTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            regionTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeRegion = this.dataset.region;
            renderGlobalMovies(activeRegion);
        });
    });

    renderGlobalMovies(activeRegion);

    // ---------------------------------------------------------
    // 7. SOCIAL SHARING ENGINE
    // ---------------------------------------------------------
    function getShareInviteData() {
        const roomCode = (privateRoomCodeInput && privateRoomCodeInput.value) || 'FAMILY-2026';
        const filmTitle = (featureFilms[activeFeatureFilmIdx] && featureFilms[activeFeatureFilmIdx].title) || 'Horizon Neo: 4DX Laser';
        const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
        const text = `🎬 Join our private VIP 4DX Cinema Suite to watch "${filmTitle}" together in real-time with tactile 4DX haptics and live chat! 🍿💥 Room Code: #${roomCode} 👉 ${url}`;
        return { roomCode, filmTitle, url, text };
    }

    function shareToWhatsApp() {
        const { text } = getShareInviteData();
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }

    function shareToFacebook() {
        const { url, filmTitle } = getShareInviteData();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`Join our private 4DX virtual cinema watch party for "${filmTitle}"!`)}`, '_blank');
    }

    function shareToInstagram() {
        const { text, url } = getShareInviteData();
        navigator.clipboard.writeText(`${text}\n\nLink: ${url}`);
        alert('📸 VIP Watch Party invite text copied to clipboard! Open Instagram Stories or DMs and paste to invite your friends.');
        window.open('https://www.instagram.com/', '_blank');
    }

    function shareToTwitter() {
        const { text } = getShareInviteData();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }

    function shareToTelegram() {
        const { text, url } = getShareInviteData();
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    }

    function shareNative() {
        const { text, url, filmTitle } = getShareInviteData();
        if (navigator.share) {
            navigator.share({
                title: `🎬 Digital Multiplex 4DX: ${filmTitle}`,
                text: text,
                url: url
            }).catch(e => console.log('Share dismissed:', e));
        } else {
            navigator.clipboard.writeText(url);
            alert('🔗 Private Cinema invite link copied to clipboard!');
        }
    }

    const headerWhatsApp = document.getElementById('headerShareWhatsApp');
    const headerFacebook = document.getElementById('headerShareFacebook');
    const headerInstagram = document.getElementById('headerShareInstagram');
    const headerTwitter = document.getElementById('headerShareTwitter');
    const headerTelegram = document.getElementById('headerShareTelegram');
    const headerNative = document.getElementById('headerShareNative');

    if (headerWhatsApp) headerWhatsApp.addEventListener('click', shareToWhatsApp);
    if (headerFacebook) headerFacebook.addEventListener('click', shareToFacebook);
    if (headerInstagram) headerInstagram.addEventListener('click', shareToInstagram);
    if (headerTwitter) headerTwitter.addEventListener('click', shareToTwitter);
    if (headerTelegram) headerTelegram.addEventListener('click', shareToTelegram);
    if (headerNative) headerNative.addEventListener('click', shareNative);

    const roomWhatsApp = document.getElementById('roomShareWhatsApp');
    const roomInstagram = document.getElementById('roomShareInstagram');
    const roomFacebook = document.getElementById('roomShareFacebook');

    if (roomWhatsApp) roomWhatsApp.addEventListener('click', shareToWhatsApp);
    if (roomInstagram) roomInstagram.addEventListener('click', shareToInstagram);
    if (roomFacebook) roomFacebook.addEventListener('click', shareToFacebook);

    // ---------------------------------------------------------
    // 8. AI SMART RECOMMENDATION & ENGAGEMENT ENGINE
    // ---------------------------------------------------------
    const recommendationsCatalog = [
        {
            id: 'rec_scifi_1',
            genre: 'sci_fi',
            title: 'Quantum Convergence: 2099',
            badge: '99% MATCH',
            tag: '4DX Laser • Cyberpunk Thriller',
            rating: '⭐ 9.4/10 • IMDb Top 10',
            duration: '2h 18m',
            age: 'young_adult',
            desc: 'A rogue neural architect navigates underground frequency grids to reconstruct fractured memories of humanity.',
            colorA: '#ef4444',
            colorB: '#f59e0b'
        },
        {
            id: 'rec_action_1',
            genre: 'action',
            title: 'Apex Velocity: Nitro Drift 4DX',
            badge: '98% MATCH',
            tag: 'Extreme Motion • Air Blast FX',
            rating: '⭐ 9.1/10 • 96% Rotten Tomatoes',
            duration: '1h 55m',
            age: 'young_adult',
            desc: 'High-octane hypercar racing through floating megastructure tracks with extreme G-force seat rumbles.',
            colorA: '#38bdf8',
            colorB: '#ef4444'
        },
        {
            id: 'rec_mystery_1',
            genre: 'thriller',
            title: 'The Midnight Cipher',
            badge: '97% MATCH',
            tag: 'Dolby Atmos 3D • Psychological Noir',
            rating: '⭐ 9.3/10 • Critics Choice',
            duration: '2h 05m',
            age: 'senior',
            desc: 'An enigmatic detective decodes auditory audio frequencies from an abandoned Victorian broadcast station.',
            colorA: '#8b5cf6',
            colorB: '#ec4899'
        },
        {
            id: 'rec_romance_1',
            genre: 'romance',
            title: 'Starlight Serenade Across Time',
            badge: '96% MATCH',
            tag: 'Acoustic Harmonies • Romantic Drama',
            rating: '⭐ 8.9/10 • Audience Favorite',
            duration: '1h 48m',
            age: 'young_adult',
            desc: 'Two musicians born centuries apart communicate through melodies trapped inside a cosmic lighthouse.',
            colorA: '#ec4899',
            colorB: '#f59e0b'
        },
        {
            id: 'rec_nature_1',
            genre: 'nature',
            title: 'Realm of the Ancient Biosphere',
            badge: '99% MATCH',
            tag: 'IMAX 4DX Mist & Rain • 8K Ultra HDR',
            rating: '⭐ 9.6/10 • Award Winning Doc',
            duration: '1h 32m',
            age: 'senior',
            desc: 'Deep exploration into unexplored bioluminescent ocean trenches and subterranean fungal networks.',
            colorA: '#10b981',
            colorB: '#06b6d4'
        },
        {
            id: 'rec_tech_1',
            genre: 'tech',
            title: 'Singularity: The Synthetic Dawn',
            badge: '97% MATCH',
            tag: '4DX Lightning Strobe • AI Epic',
            rating: '⭐ 9.2/10 • Global Premiere',
            duration: '2h 10m',
            age: 'young_adult',
            desc: 'The birth of the first benevolent sentient planetary superintelligence and humanity’s leap into cosmic exploration.',
            colorA: '#06b6d4',
            colorB: '#a855f7'
        }
    ];

    function renderRecommendations() {
        if (!recommendationsGrid) return;
        recommendationsGrid.innerHTML = '';

        const selectedGenre = (genreSelect && genreSelect.value) || 'sci_fi';
        const selectedAge = (ageGroupSelect && ageGroupSelect.value) || 'young_adult';

        let filtered = [...recommendationsCatalog].sort((a, b) => {
            let scoreA = (a.genre === selectedGenre ? 10 : 0) + (a.age === selectedAge ? 5 : 0);
            let scoreB = (b.genre === selectedGenre ? 10 : 0) + (b.age === selectedAge ? 5 : 0);
            return scoreB - scoreA;
        });

        filtered.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="rec-badge-match">${rec.badge}</span>
                    <span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">${rec.duration}</span>
                </div>
                <div>
                    <h3 class="rec-title">${rec.title}</h3>
                    <div class="rec-meta-row" style="margin-top:4px;">
                        <span style="color:#f59e0b;">${rec.rating}</span>
                        <span>•</span>
                        <span style="color:#38bdf8;">${rec.tag}</span>
                    </div>
                </div>
                <p style="font-size:0.82rem; color:#cbd5e1; line-height:1.5;">${rec.desc}</p>
                <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                    <button type="button" class="rec-btn-action screen-rec-btn" data-id="${rec.id}">▶️ Screen Now in 4DX</button>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="btn-secondary-action book-rec-btn" style="flex:1; padding:6px; font-size:0.78rem;">🎟️ Book Seats</button>
                        <button type="button" class="btn-secondary-action share-rec-btn" style="flex:1; padding:6px; font-size:0.78rem;">💬 Share</button>
                    </div>
                </div>
            `;

            const screenBtn = card.querySelector('.screen-rec-btn');
            screenBtn.addEventListener('click', function() {
                convertAnyMovieTo4DX(rec.title, rec.genre === 'nature' ? 'nature' : 'turbo');
            });

            const bookBtn = card.querySelector('.book-rec-btn');
            bookBtn.addEventListener('click', function() {
                showHub('tickets');
            });

            const shareBtn = card.querySelector('.share-rec-btn');
            shareBtn.addEventListener('click', function() {
                const roomCode = (privateRoomCodeInput && privateRoomCodeInput.value) || 'FAMILY-2026';
                const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
                const text = `🎬 Check out "${rec.title}" on Digital Multiplex! Join our 4DX suite: ${url}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            });

            recommendationsGrid.appendChild(card);
        });
    }

    renderRecommendations();

    if (refreshRecsBtn) {
        refreshRecsBtn.addEventListener('click', function() {
            renderRecommendations();
            playSpatialAtmosSwell();
            refreshRecsBtn.textContent = '✅ Matches Refreshed';
            setTimeout(() => { refreshRecsBtn.textContent = '🔄 Refresh Matches'; }, 1800);
        });
    }

    if (surpriseRecBtn) {
        surpriseRecBtn.addEventListener('click', function() {
            const genres = ['sci_fi', 'action', 'thriller', 'romance', 'comedy', 'nature', 'tech'];
            if (genreSelect) {
                genreSelect.value = genres[Math.floor(Math.random() * genres.length)];
                renderRecommendations();
            }
            playSpatialAtmosSwell();
            trigger4dxSeatRumble();
        });
    }

    // ---------------------------------------------------------
    // 9. VIRTUAL IMAX SCREEN 60FPS CINEMATIC CANVAS ENGINE
    // ---------------------------------------------------------
    const featureFilms = [
        {
            title: 'Horizon Neo: The 4DX Cybernetic Odyssey',
            tag: 'IMAX 3D Laser • 4DX Extreme Haptics',
            sub: 'In 2088, the frequencies of the past awaken the stars...',
            colorA: '#ef4444',
            colorB: '#f59e0b',
            theme: 'cyberpunk'
        },
        {
            title: 'Cosmic Voyage: Uncharted Galaxies 4DX',
            tag: 'IMAX 70mm Film • Deep Space Nebula',
            sub: 'Journey beyond the heliosphere boundary into the unknown.',
            colorA: '#38bdf8',
            colorB: '#8b5cf6',
            theme: 'space'
        },
        {
            title: 'Starlight Melodies & Neon Nights 4DX',
            tag: 'Dolby Atmos Live Acoustic Premiere',
            sub: 'Harmonies that resonate through time and space.',
            colorA: '#ec4899',
            colorB: '#a855f7',
            theme: 'music'
        }
    ];

    let animFrame = 0;
    const stars = Array.from({ length: 80 }, () => ({
        x: Math.random() * 960,
        y: Math.random() * 540,
        radius: Math.random() * 2.2 + 0.6,
        speed: Math.random() * 1.5 + 0.4
    }));

    function drawCinemaCanvas() {
        if (!ctx) return;
        animFrame++;

        const film = featureFilms[activeFeatureFilmIdx];

        const bgGrad = ctx.createLinearGradient(0, 0, 960, 540);
        bgGrad.addColorStop(0, '#040714');
        bgGrad.addColorStop(0.5, '#0a1026');
        bgGrad.addColorStop(1, '#02040a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 960, 540);

        if (isMoviePlaying) {
            ctx.fillStyle = '#ffffff';
            stars.forEach(s => {
                s.x -= s.speed;
                if (s.x < 0) s.x = 960;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            const nebGrad = ctx.createRadialGradient(480 + Math.sin(animFrame * 0.02) * 80, 270 + Math.cos(animFrame * 0.02) * 40, 30, 480, 270, 380);
            nebGrad.addColorStop(0, film.colorA + '44');
            nebGrad.addColorStop(0.5, film.colorB + '22');
            nebGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = nebGrad;
            ctx.fillRect(0, 0, 960, 540);

            ctx.strokeStyle = film.colorA + '33';
            ctx.lineWidth = 1.5;
            const horizonY = 360;
            for (let x = -200; x <= 1160; x += 60) {
                ctx.beginPath();
                ctx.moveTo(480, horizonY - 40);
                ctx.lineTo(x + Math.sin(animFrame * 0.01) * 30, 540);
                ctx.stroke();
            }

            ctx.save();
            ctx.textAlign = 'center';
            
            ctx.shadowColor = film.colorA;
            ctx.shadowBlur = 24;
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 34px Inter, sans-serif';
            ctx.fillText(film.title, 480, 240);

            ctx.shadowBlur = 10;
            ctx.fillStyle = film.colorB;
            ctx.font = '700 16px Inter, sans-serif';
            ctx.fillText(`⚡ ${film.tag}`, 480, 280);

            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(160, 460, 640, 50);
            ctx.fillStyle = '#f8fafc';
            ctx.font = '500 15px Inter, sans-serif';
            ctx.fillText(`💬 ${film.sub}`, 480, 492);

            ctx.restore();

            if (isAuto4dx && animFrame % 240 === 0) {
                const fxRand = Math.random();
                if (fxRand < 0.4) {
                    trigger4dxSeatRumble();
                } else if (fxRand < 0.7) {
                    trigger4dxAirBlast();
                } else {
                    trigger4dxLightningStrobe();
                }
            }
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(0, 0, 960, 540);
            ctx.fillStyle = '#ef4444';
            ctx.font = '900 48px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⏸️ 4DX SCREENING PAUSED', 480, 270);
            ctx.font = '600 18px Inter, sans-serif';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('Press Play to resume synchronized 4DX playback with your suite', 480, 310);
        }

        if (animFrame % 60 === 0 && screenAmbientGlow) {
            screenAmbientGlow.style.background = `radial-gradient(ellipse at top, ${film.colorA}40 0%, ${film.colorB}20 45%, transparent 75%)`;
        }

        requestAnimationFrame(drawCinemaCanvas);
    }

    if (canvas) {
        drawCinemaCanvas();
    }

    if (moviePlayPauseBtn) {
        moviePlayPauseBtn.addEventListener('click', function() {
            isMoviePlaying = !isMoviePlaying;
            moviePlayPauseBtn.textContent = isMoviePlaying ? '⏸️ Pause' : '▶️ Resume Film';
            broadcastChatMessage('System', isMoviePlaying ? '▶️ Resumed 4DX screening for all viewers' : '⏸️ Paused screening');
        });
    }

    if (movieTrailerSwitchBtn) {
        movieTrailerSwitchBtn.addEventListener('click', function() {
            activeFeatureFilmIdx = (activeFeatureFilmIdx + 1) % featureFilms.length;
            const f = featureFilms[activeFeatureFilmIdx];
            if (moviePlayingTitle) {
                moviePlayingTitle.textContent = `NOW SCREENING: "${f.title}" (${f.tag})`;
            }
            playSpatialAtmosSwell();
            trigger4dxSeatRumble();
            broadcastChatMessage('System', `🎬 Feature switched to: "${f.title}"`);
        });
    }

    if (movieMuteBtn) {
        movieMuteBtn.addEventListener('click', function() {
            isMuted = !isMuted;
            movieMuteBtn.textContent = isMuted ? '🔇 Sound Muted' : '🔊 Sound On';
        });
    }

    if (fullscreenTheaterBtn && imaxScreenWrapper) {
        fullscreenTheaterBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                imaxScreenWrapper.requestFullscreen().catch(err => alert(`Fullscreen error: ${err.message}`));
            } else {
                document.exitFullscreen();
            }
        });
    }

    // ---------------------------------------------------------
    // 10. VIRTUAL AUDITORIUM SEATING ROW WITH LIVE AVATARS
    // ---------------------------------------------------------
    let viewersList = [
        { name: 'Emma ❤️', avatar: '👩', seat: 'Seat 1', isFriend: true },
        { name: 'David 👓', avatar: '👨‍💼', seat: 'Seat 2', isFriend: true },
        { name: 'Sophia ✨', avatar: '👩‍🎨', seat: 'Seat 3', isFriend: true },
        { name: 'Alex 🍿 (You)', avatar: '🧑', seat: 'Seat 4', isUser: true },
        { name: 'Dad 👓', avatar: '👨', seat: 'Seat 5', isFriend: true },
        { name: 'Mom 👩‍🍳', avatar: '👩', seat: 'Seat 6', isFriend: true },
        { name: 'Lucas 🚀', avatar: '🧑‍🚀', seat: 'Seat 7', isFriend: false },
        { name: 'Mia 🎧', avatar: '👧', seat: 'Seat 8', isFriend: false }
    ];

    function renderAuditoriumSeats() {
        if (!auditoriumSeatsRow) return;
        auditoriumSeatsRow.innerHTML = '';

        viewersList.forEach((v, idx) => {
            const seatDiv = document.createElement('div');
            seatDiv.className = 'virtual-viewer-seat';
            if (v.isUser) seatDiv.classList.add('active-user');
            if (v.isFriend) seatDiv.classList.add('friend-seat');

            seatDiv.innerHTML = `
                <div class="viewer-avatar-bubble" title="${v.name}">${v.avatar}</div>
                <div class="theater-chair-graphic"></div>
                <span class="viewer-name-tag">${v.name}</span>
            `;

            seatDiv.addEventListener('click', function() {
                viewersList.forEach(item => { item.isUser = false; });
                viewersList[idx].isUser = true;
                viewersList[idx].name = `${userAvatarName} (You)`;
                renderAuditoriumSeats();
                trigger4dxSeatRumble();
                broadcastChatMessage('System', `💺 You moved to ${v.seat}`);
            });

            auditoriumSeatsRow.appendChild(seatDiv);
        });
    }

    renderAuditoriumSeats();

    if (updateAvatarBtn) {
        updateAvatarBtn.addEventListener('click', function() {
            const newName = (avatarNameInput.value || 'Alex 🍿').trim();
            userAvatarName = newName;
            const mySeat = viewersList.find(v => v.isUser);
            if (mySeat) {
                mySeat.name = `${userAvatarName} (You)`;
                renderAuditoriumSeats();
            }
            broadcastChatMessage('System', `👤 Your avatar was updated to "${userAvatarName}"`);
        });
    }

    // ---------------------------------------------------------
    // 11. PRIVATE WATCH PARTY & LIVE CHAT / FLOATING EMOJI DECK
    // ---------------------------------------------------------
    function broadcastChatMessage(sender, text, isMe = false) {
        if (!chatMessagesBox) return;
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble' + (isMe ? ' my-msg' : '');
        bubble.innerHTML = `<b>${sender}:</b> ${text}`;
        chatMessagesBox.appendChild(bubble);
        chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
    }

    if (sendChatBtn && chatInput) {
        function handleSendChat() {
            const text = chatInput.value.trim();
            if (text) {
                broadcastChatMessage(`${userAvatarName} (You)`, text, true);
                chatInput.value = '';
            }
        }
        sendChatBtn.addEventListener('click', handleSendChat);
        chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSendChat(); });
    }

    function triggerFloatingEmoji(emoji) {
        if (!floatingEmojiContainer) return;
        const span = document.createElement('span');
        span.className = 'floating-reaction-emoji';
        span.textContent = emoji;
        span.style.left = `${15 + Math.random() * 70}%`;
        floatingEmojiContainer.appendChild(span);
        setTimeout(() => span.remove(), 3200);
    }

    document.querySelectorAll('.reaction-emoji-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const emoji = this.dataset.emoji;
            triggerFloatingEmoji(emoji);
            trigger4dxSeatRumble();
            broadcastChatMessage(`${userAvatarName}`, `reacted ${emoji}`, true);
        });
    });

    if (copyInviteLinkBtn) {
        copyInviteLinkBtn.addEventListener('click', function() {
            const { url } = getShareInviteData();
            navigator.clipboard.writeText(url);
            copyInviteLinkBtn.textContent = '✅ Link Copied!';
            setTimeout(() => { copyInviteLinkBtn.textContent = '🔗 Copy Link'; }, 2200);
        });
    }

    if (joinPrivateRoomBtn) {
        joinPrivateRoomBtn.addEventListener('click', function() {
            const code = (privateRoomCodeInput.value || 'FAMILY-2026').trim().toUpperCase();
            playSpatialAtmosSwell();
            trigger4dxSeatRumble();
            alert(`👑 Entered Private 4DX Watch Party Suite: #${code}! Sync stream connected with loved ones.`);
            const privateHall = document.getElementById('privateHallPill');
            if (privateHall) {
                privateHall.textContent = `👑 Private Suite (#${code})`;
                hallPillBtns.forEach(b => b.classList.remove('active'));
                privateHall.classList.add('active');
            }
            broadcastChatMessage('Suite Host', `Welcome to Private Suite #${code}! The 4DX screening is fully synchronized.`);
        });
    }

    hallPillBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            hallPillBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const hall = this.dataset.hall;
            trigger4dxSeatRumble();
            if (hall === 'private') {
                alert('👑 Switched to Private Family 4DX Suite. Invite friends to watch along!');
            } else {
                alert(`🎬 Switched to Auditorium ${this.textContent}`);
            }
        });
    });

    // ---------------------------------------------------------
    // 12. STUDIO & HUB TAB SWITCHER (CONVERTER, GLOBAL CATALOG & OTHERS)
    // ---------------------------------------------------------
    function showHub(tabType) {
        currentType = tabType;
        studioTabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.studio-tab-btn[data-type="${tabType}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Hide all hubs
        if (virtualTheaterHub) virtualTheaterHub.classList.add('hidden');
        if (converterHub) converterHub.classList.add('hidden');
        if (globalCatalogHub) globalCatalogHub.classList.add('hidden');
        if (recommendationsHub) recommendationsHub.classList.add('hidden');
        if (contentDisplay) contentDisplay.classList.add('hidden');
        if (seatSelectorHub) seatSelectorHub.classList.add('hidden');
        if (concessionsHub) concessionsHub.classList.add('hidden');
        if (triviaHub) triviaHub.classList.add('hidden');

        if (tabType === 'virtual_theater') {
            if (virtualTheaterHub) virtualTheaterHub.classList.remove('hidden');
            if (converterHub) converterHub.classList.remove('hidden');
            if (globalCatalogHub) globalCatalogHub.classList.remove('hidden');
            if (recommendationsHub) recommendationsHub.classList.remove('hidden');
        } else if (tabType === 'converter') {
            if (converterHub) {
                converterHub.classList.remove('hidden');
                converterHub.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (tabType === 'global_catalog') {
            if (globalCatalogHub) {
                globalCatalogHub.classList.remove('hidden');
                globalCatalogHub.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (tabType === 'recommendations') {
            if (recommendationsHub) {
                recommendationsHub.classList.remove('hidden');
                recommendationsHub.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (tabType === 'tickets') {
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
    // 13. QUICK PROMPT & MIC INPUT
    // ---------------------------------------------------------
    if (quickGenerateBtn) {
        quickGenerateBtn.addEventListener('click', function() {
            const customPremise = quickThemeInput ? quickThemeInput.value.trim() : '';
            if (customPremise) {
                convertAnyMovieTo4DX(customPremise, 'turbo');
            } else if (['movie', 'song', 'radio', 'documentary', 'podcast'].includes(currentType)) {
                generateEntertainmentContent(currentType);
            } else {
                showHub('converter');
            }
        });
    }

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
                    if (quickThemeInput) quickThemeInput.placeholder = '🎙️ Speak ANY movie title to convert to 4DX...';
                } catch (e) {
                    console.error('Speech recognition error:', e);
                }
            }
        });

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            if (quickThemeInput) quickThemeInput.value = transcript;
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
            convertAnyMovieTo4DX(transcript, 'turbo');
        };

        recognition.onerror = function() {
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
        };

        recognition.onend = function() {
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
        };
    }

    // ---------------------------------------------------------
    // 14. SCRIPT GENERATION & SIMULATION ENGINE
    // ---------------------------------------------------------
    function buildClientSimulation(type, age, lang, genre, userTheme) {
        const theme = userTheme || 'Epic Galactic Odyssey';
        const langInfo = languageMap[lang] || languageMap['en'];
        const langName = langInfo.name.split('-')[0].trim();

        if (type === 'movie') {
            if (lang === 'hi') {
                return `<h2>🎥 विशेष 4DX ब्लॉकबस्टर पटकथा: "होराइजन नियॉन की दास्तान"</h2>
<p><b>शैली:</b> ${genre.toUpperCase()} | <b>आयु वर्ग:</b> ${age.toUpperCase()} | <b>भाषा:</b> ${langName} | <b>4DX प्रभाव:</b> एक्टिव</p>
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

            return `<h2>🎥 Featured 4DX Blockbuster Screenplay: "Chronicles of Horizon Neo"</h2>
<p><b>Genre:</b> ${genre.toUpperCase()} | <b>Age Tier:</b> ${age.toUpperCase()} | <b>Language:</b> ${langName} | <b>4DX Mode:</b> Extreme Motion</p>
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
<i>"Good evening night owls! You are locked in with RJ Max on Nightwave FM 104.5 in ${langName}. Tonight's listener spotlight: '${theme}'. Caller Line 3 is live right now!"</i></p>`;
        }

        if (type === 'documentary') {
            return `<h2>📽️ IMAX 4DX Cinematic Docu-Series: "Wonders of the Unseen Realm"</h2>
<p><b>Category:</b> Nature & Science Exploration | <b>Language:</b> ${langName} | <b>Pacing:</b> Immersive 4K 4DX</p>
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
    // 15. TEXT-TO-SPEECH NARRATION (TTS) & EXPORT
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
    // 16. VIP SEAT MATRIX & CONCESSIONS & TRIVIA CONTROLLERS
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

                if (selectedSeats.includes(seatId)) btn.classList.add('selected');

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
            playSpatialAtmosSwell();
            trigger4dxSeatRumble();
            alert(`🎟️ 4DX VIP Tickets Confirmed for Seats: ${selectedSeats.join(', ')}! Pass ready on your digital wallet.`);
        });
    }

    // Concessions
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
        cart.forEach((item) => {
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

    // Trivia
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
                    playSpatialAtmosSwell();
                    trigger4dxSeatRumble();
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