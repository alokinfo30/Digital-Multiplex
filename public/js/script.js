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
    const dimLightsBtn = document.getElementById('dimLightsBtn');
    const spatialAudioBtn = document.getElementById('spatialAudioBtn');
    
    // Hub Containers
    const virtualTheaterHub = document.getElementById('virtualTheaterHub');
    const contentDisplay = document.getElementById('contentDisplay');
    const seatSelectorHub = document.getElementById('seatSelectorHub');
    const concessionsHub = document.getElementById('concessionsHub');
    const triviaHub = document.getElementById('triviaHub');
    const loadingDiv = document.getElementById('loading');
    const loadingStatusText = document.getElementById('loadingStatusText');
    const geoLangBadge = document.getElementById('geoLangBadge');

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
    let activeFeatureFilmIdx = 0;
    let userAvatarName = 'Alex 🍿';
    let userSeatIdx = 3;

    // ---------------------------------------------------------
    // 2. WEB AUDIO API SYNTHESIZER (SURROUND SOUND & SFX)
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
            const freqs = [329.63, 392.00, 493.88, 659.25, 987.77]; // E minor 9th shimmer
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
    // 4. VIRTUAL IMAX SCREEN 60FPS CINEMATIC CANVAS ENGINE
    // ---------------------------------------------------------
    const featureFilms = [
        {
            title: 'Horizon Neo: The Cybernetic Odyssey',
            tag: 'IMAX 3D Laser • 4K Dolby Vision',
            sub: 'In 2088, the frequencies of the past awaken the stars...',
            colorA: '#ef4444',
            colorB: '#f59e0b',
            theme: 'cyberpunk'
        },
        {
            title: 'Cosmic Voyage: Uncharted Galaxies',
            tag: 'IMAX 70mm Film • Deep Space Odyssey',
            sub: 'Journey beyond the heliosphere boundary into the unknown.',
            colorA: '#38bdf8',
            colorB: '#8b5cf6',
            theme: 'space'
        },
        {
            title: 'Starlight Melodies & Neon Nights',
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

        // Background space gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 960, 540);
        bgGrad.addColorStop(0, '#040714');
        bgGrad.addColorStop(0.5, '#0a1026');
        bgGrad.addColorStop(1, '#02040a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 960, 540);

        if (isMoviePlaying) {
            // Starfield simulation
            ctx.fillStyle = '#ffffff';
            stars.forEach(s => {
                s.x -= s.speed;
                if (s.x < 0) s.x = 960;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Nebula glow
            const nebGrad = ctx.createRadialGradient(480 + Math.sin(animFrame * 0.02) * 80, 270 + Math.cos(animFrame * 0.02) * 40, 30, 480, 270, 380);
            nebGrad.addColorStop(0, film.colorA + '44');
            nebGrad.addColorStop(0.5, film.colorB + '22');
            nebGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = nebGrad;
            ctx.fillRect(0, 0, 960, 540);

            // Horizon Neon Gridlines (Perspective)
            ctx.strokeStyle = film.colorA + '33';
            ctx.lineWidth = 1.5;
            const horizonY = 360;
            for (let x = -200; x <= 1160; x += 60) {
                ctx.beginPath();
                ctx.moveTo(480, horizonY - 40);
                ctx.lineTo(x + Math.sin(animFrame * 0.01) * 30, 540);
                ctx.stroke();
            }

            // Central Holographic Title Emblem
            ctx.save();
            ctx.textAlign = 'center';
            
            // Outer Glow Halo
            ctx.shadowColor = film.colorA;
            ctx.shadowBlur = 24;
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 36px Inter, sans-serif';
            ctx.fillText(film.title, 480, 240);

            // Subtitle Tag
            ctx.shadowBlur = 10;
            ctx.fillStyle = film.colorB;
            ctx.font = '700 16px Inter, sans-serif';
            ctx.fillText(`⚡ ${film.tag}`, 480, 280);

            // Dialogue / Subtitle overlay
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(160, 460, 640, 50);
            ctx.fillStyle = '#f8fafc';
            ctx.font = '500 15px Inter, sans-serif';
            ctx.fillText(`💬 ${film.sub}`, 480, 492);

            ctx.restore();
        } else {
            // Paused Overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(0, 0, 960, 540);
            ctx.fillStyle = '#ef4444';
            ctx.font = '900 48px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⏸️ SCREENING PAUSED', 480, 270);
            ctx.font = '600 18px Inter, sans-serif';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('Press Play to resume synchronized playback with your suite', 480, 310);
        }

        // Ambient Ambilight Glow sync
        if (animFrame % 60 === 0 && screenAmbientGlow) {
            screenAmbientGlow.style.background = `radial-gradient(ellipse at top, ${film.colorA}40 0%, ${film.colorB}20 45%, transparent 75%)`;
        }

        requestAnimationFrame(drawCinemaCanvas);
    }

    if (canvas) {
        drawCinemaCanvas();
    }

    // Movie Controls
    if (moviePlayPauseBtn) {
        moviePlayPauseBtn.addEventListener('click', function() {
            isMoviePlaying = !isMoviePlaying;
            moviePlayPauseBtn.textContent = isMoviePlaying ? '⏸️ Pause' : '▶️ Resume Film';
            broadcastChatMessage('System', isMoviePlaying ? '▶️ Resumed screening for all viewers' : '⏸️ Paused screening');
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
    // 5. VIRTUAL AUDITORIUM SEATING ROW WITH LIVE AVATARS
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
                // Change User Seat to this position
                viewersList.forEach(item => { item.isUser = false; });
                viewersList[idx].isUser = true;
                viewersList[idx].name = `${userAvatarName} (You)`;
                renderAuditoriumSeats();
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
    // 6. PRIVATE WATCH PARTY & LIVE CHAT / FLOATING EMOJI DECK
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

    // Floating Reaction Emojis
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
            broadcastChatMessage(`${userAvatarName}`, `reacted ${emoji}`, true);
        });
    });

    if (copyInviteLinkBtn) {
        copyInviteLinkBtn.addEventListener('click', function() {
            const roomCode = privateRoomCodeInput.value || 'FAMILY-2026';
            const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
            navigator.clipboard.writeText(inviteUrl);
            copyInviteLinkBtn.textContent = '✅ Invite Link Copied!';
            setTimeout(() => { copyInviteLinkBtn.textContent = '🔗 Copy Invite Link'; }, 2200);
        });
    }

    if (joinPrivateRoomBtn) {
        joinPrivateRoomBtn.addEventListener('click', function() {
            const code = (privateRoomCodeInput.value || 'FAMILY-2026').trim().toUpperCase();
            playSpatialAtmosSwell();
            alert(`👑 Entered Private Watch Party Suite: #${code}! Sync stream connected with loved ones.`);
            const privateHall = document.getElementById('privateHallPill');
            if (privateHall) {
                privateHall.textContent = `👑 Private Suite (#${code})`;
                hallPillBtns.forEach(b => b.classList.remove('active'));
                privateHall.classList.add('active');
            }
            broadcastChatMessage('Suite Host', `Welcome to Private Suite #${code}! The screening is fully synchronized.`);
        });
    }

    hallPillBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            hallPillBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const hall = this.dataset.hall;
            if (hall === 'private') {
                alert('👑 Switched to Private Family Suite. Invite friends to watch along!');
            } else {
                alert(`🎬 Switched to Auditorium ${this.textContent}`);
            }
        });
    });

    // ---------------------------------------------------------
    // 7. STUDIO & HUB TAB SWITCHER (8 HUBS)
    // ---------------------------------------------------------
    function showHub(tabType) {
        currentType = tabType;
        studioTabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.studio-tab-btn[data-type="${tabType}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Hide all hubs
        if (virtualTheaterHub) virtualTheaterHub.classList.add('hidden');
        if (contentDisplay) contentDisplay.classList.add('hidden');
        if (seatSelectorHub) seatSelectorHub.classList.add('hidden');
        if (concessionsHub) concessionsHub.classList.add('hidden');
        if (triviaHub) triviaHub.classList.add('hidden');

        if (tabType === 'virtual_theater') {
            if (virtualTheaterHub) virtualTheaterHub.classList.remove('hidden');
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
    // 8. VOICE MICROPHONE INPUT
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
            } else {
                // If in virtual theater, switch film title
                if (moviePlayingTitle) {
                    moviePlayingTitle.textContent = `NOW SCREENING: "${transcript}" (Custom Feature)`;
                }
                playSpatialAtmosSwell();
                broadcastChatMessage('System', `🎬 Now screening custom feature: "${transcript}"`);
            }
        };

        recognition.onerror = function() {
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
            if (quickThemeInput) quickThemeInput.placeholder = "Enter movie premise to screen...";
        };

        recognition.onend = function() {
            voiceMicBtn.classList.remove('recording');
            isRecording = false;
            if (quickThemeInput) quickThemeInput.placeholder = "Enter movie premise to screen...";
        };
    }

    // ---------------------------------------------------------
    // 9. RANDOMIZE / SURPRISE ME
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
            } else {
                if (moviePlayingTitle) {
                    moviePlayingTitle.textContent = `NOW SCREENING: "${randomTheme}"`;
                }
                playSpatialAtmosSwell();
            }
        });
    }

    if (quickGenerateBtn) {
        quickGenerateBtn.addEventListener('click', function() {
            const customPremise = quickThemeInput ? quickThemeInput.value.trim() : '';
            if (currentType === 'virtual_theater' && customPremise) {
                if (moviePlayingTitle) {
                    moviePlayingTitle.textContent = `NOW SCREENING: "${customPremise}" (4K HDR)`;
                }
                playSpatialAtmosSwell();
                broadcastChatMessage('System', `🎬 Screening custom feature: "${customPremise}"`);
            } else if (['movie', 'song', 'radio', 'documentary', 'podcast'].includes(currentType)) {
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
    // 10. SCRIPT GENERATION & SIMULATION ENGINE
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
    // 11. TEXT-TO-SPEECH NARRATION (TTS)
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
    // 12. VIP SEAT MATRIX & CONCESSIONS & TRIVIA CONTROLLERS
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
            alert(`🎟️ VIP Tickets Confirmed for Seats: ${selectedSeats.join(', ')}! Pass ready on your digital wallet.`);
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
