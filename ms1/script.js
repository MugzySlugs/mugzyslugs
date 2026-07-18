document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       Cursor Slug Trail Effect
       ========================================================================== */
    const canvas = document.getElementById('trail-canvas');
    const ctx = canvas.getContext('2d');

    let points = [];
    const maxPoints = 35;
    const baseWidth = 14;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
        points.push({ x: e.clientX, y: e.clientY, age: 0 });
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Filter and update points
        points = points.filter(p => {
            p.age += 1.2;
            return p.age < maxPoints;
        });

        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                // Quadratic curve for smoothness
                const xc = (points[i].x + points[i - 1].x) / 2;
                const yc = (points[i].y + points[i - 1].y) / 2;
                ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
            }

            // Slime trail aesthetics: Neon Green
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(57, 255, 20, 0.8)';
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.45)';
            ctx.lineWidth = baseWidth;
            ctx.stroke();

            // Draw inner core slime line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                const xc = (points[i].x + points[i - 1].x) / 2;
                const yc = (points[i].y + points[i - 1].y) / 2;
                ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
            }
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = baseWidth / 3;
            ctx.stroke();

            // Reset shadows for optimization
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(animate);
    }
    animate();


    /* ==========================================================================
       Navigation Link Scroll Highlights
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });


    /* ==========================================================================
       Interactive Music Player
       ========================================================================== */
    const playlistTracks = document.querySelectorAll('.playlist-track');
    const currentTitle = document.getElementById('current-title');
    const currentGenre = document.getElementById('current-genre');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressFill = document.getElementById('progress-fill');
    const progressBg = document.getElementById('progress-bg');
    const currTimeLabel = document.getElementById('curr-time');
    const totalTimeLabel = document.getElementById('total-time');
    const visualizer = document.getElementById('visualizer');

    let currentTrackIndex = 0;
    let isPlaying = false;
    let trackProgressSeconds = 0;
    let trackDurationSeconds = 165; // 2:45 default
    let progressTimer = null;

    // Load track information helper
    function loadTrack(index) {
        playlistTracks.forEach(t => t.classList.remove('active'));
        const trackElement = playlistTracks[index];
        trackElement.classList.add('active');

        const title = trackElement.getAttribute('data-title');
        const genre = trackElement.getAttribute('data-genre');
        const durationStr = trackElement.getAttribute('data-duration');

        currentTitle.textContent = title;
        currentGenre.textContent = genre;
        totalTimeLabel.textContent = durationStr;

        // Parse duration
        const parts = durationStr.split(':');
        trackDurationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        
        // Reset progress
        resetProgress();

        if (isPlaying) {
            startProgressTimer();
        }
    }

    function resetProgress() {
        trackProgressSeconds = 0;
        progressFill.style.width = '0%';
        currTimeLabel.textContent = '0:00';
    }

    function togglePlay() {
        if (isPlaying) {
            // Pause
            isPlaying = false;
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            visualizer.classList.remove('playing');
            clearInterval(progressTimer);
        } else {
            // Play
            isPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            visualizer.classList.add('playing');
            startProgressTimer();
        }
    }

    function startProgressTimer() {
        clearInterval(progressTimer);
        progressTimer = setInterval(() => {
            trackProgressSeconds++;
            if (trackProgressSeconds > trackDurationSeconds) {
                // Next track on end
                nextTrack();
            } else {
                updateProgressUI();
            }
        }, 1000);
    }

    function updateProgressUI() {
        const percentage = (trackProgressSeconds / trackDurationSeconds) * 100;
        progressFill.style.width = `${percentage}%`;

        // Format timestamps
        const m = Math.floor(trackProgressSeconds / 60);
        const s = Math.floor(trackProgressSeconds % 60);
        currTimeLabel.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlistTracks.length;
        loadTrack(currentTrackIndex);
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlistTracks.length) % playlistTracks.length;
        loadTrack(currentTrackIndex);
    }

    // Playback events
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    playlistTracks.forEach((track, idx) => {
        track.addEventListener('click', () => {
            currentTrackIndex = idx;
            loadTrack(currentTrackIndex);
            if (!isPlaying) {
                togglePlay();
            }
        });
    });

    // ProgressBar seeking simulation
    progressBg.addEventListener('click', (e) => {
        const rect = progressBg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        trackProgressSeconds = Math.floor(percentage * trackDurationSeconds);
        updateProgressUI();
    });


    /* ==========================================================================
       Twitch Chat Simulation
       ========================================================================== */
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    const botUserPool = [
        { name: 'dbd_junkie99', role: 'pleb' },
        { name: 'SlimeSlinger', role: 'vip' },
        { name: 'FogWhisperer', role: 'mod' },
        { name: 'MugzySlugs', role: 'streamer' },
        { name: 'ToxicNea_x', role: 'pleb' },
        { name: 'LoFi_Dreamer', role: 'vip' },
        { name: 'VetSupport_1', role: 'pleb' },
    ];

    const botMessages = [
        "Let's goooo! DBD lobby is looking spicy today.",
        "That loop was insane! absolute genius pathing.",
        "Mugzy play Social Suicide next, love that track!",
        "Are we playing Albion Online later tonight?",
        "Thank you for your service, Mugzy! Appreciate the vibes.",
        "Slug army rise up! 🐌💚",
        "That killer had no idea what hit them haha.",
        "Yo, new song drops when? NUMBIN is on repeat.",
        "Lobby time! Who's joining the custom game?",
        "Cozy stream vibes tonight, perfect after a long day.",
    ];

    function appendChatMessage(username, role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg');

        let badgeHtml = '';
        if (role === 'streamer') badgeHtml = '<span class="user-streamer"><i class="fa-solid fa-crown"></i> </span>';
        else if (role === 'mod') badgeHtml = '<span class="user-mod"><i class="fa-solid fa-shield"></i> </span>';
        else if (role === 'vip') badgeHtml = '<span class="user-vip"><i class="fa-solid fa-gem"></i> </span>';

        msgDiv.innerHTML = `
            ${badgeHtml}<span class="chat-username user-${role}">${username}:</span>
            <span class="chat-text">${escapeHTML(text)}</span>
        `;

        chatMessagesContainer.appendChild(msgDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        // Keep chat tidy (max 50 messages)
        if (chatMessagesContainer.childElementCount > 50) {
            chatMessagesContainer.removeChild(chatMessagesContainer.firstChild);
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Populate initial chat
    for (let i = 0; i < 5; i++) {
        const randomUser = botUserPool[Math.floor(Math.random() * botUserPool.length)];
        const randomMsg = botMessages[Math.floor(Math.random() * botMessages.length)];
        appendChatMessage(randomUser.name, randomUser.role, randomMsg);
    }

    // Simulated Chat loop
    setInterval(() => {
        const randomUser = botUserPool[Math.floor(Math.random() * botUserPool.length)];
        const randomMsg = botMessages[Math.floor(Math.random() * botMessages.length)];
        appendChatMessage(randomUser.name, randomUser.role, randomMsg);
    }, 4500);

    // User message send handler
    function sendUserMessage() {
        const text = chatInput.value.trim();
        if (text === '') return;

        appendChatMessage('You', 'vip', text);
        chatInput.value = '';

        // Bot response after short delay
        setTimeout(() => {
            const replies = [
                "Welcome to the Slug Pit! Glad to have you here.",
                "Big facts, couldn't agree more!",
                "Slug army represent! 🐌",
                "Appreciate the support in chat!",
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            const randomMod = botUserPool.find(u => u.role === 'mod' || u.role === 'vip');
            appendChatMessage(randomMod.name, randomMod.role, randomReply);
        }, 1500);
    }

    chatSendBtn.addEventListener('click', sendUserMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });
});
