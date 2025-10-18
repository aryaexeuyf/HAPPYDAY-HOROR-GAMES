document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const pages = {
        start: document.getElementById('start-screen'),
        levelSelect: document.getElementById('level-selection-screen'),
        narrative: document.getElementById('narrative-screen'),
        userInput: document.getElementById('user-input-screen'),
        mission: document.getElementById('mission-screen'),
        gameOver: document.getElementById('game-over-screen'),
        alert: document.getElementById('alert-screen'),
    };
    const audio = {
        main: document.getElementById('main-bgsound-iframe'),
        start: document.getElementById('start-sound-iframe'),
        alert: document.getElementById('alert-bgsound-iframe'),
    };

    // === Game State ===
    let currentPage = pages.start;
    let gameState = {};
    let userNames = [];
    const narratives = {
        intro: [
            "hallo saya orang di belakang Anda yang bener² tidak terlihat secara wujud, tapi saya telah memantau anda...",
            "anda telah menyetujui syarat yang kami berikan. Anda tahu konsekuensinya... yaitu menerima semua teror yang saya berikan di kawasan ini.",
            "anda pasti berada di lokasi: Dekat Toko Hariyanto, Jatikulon, Mojoanyar, Mojokerto. Dan orang-orang di dekat anda... pasti anak-anak kecil.",
        ],
    };
    let flashInterval;

    // === Utility Functions ===
    function showPage(page) {
        if (currentPage) currentPage.classList.remove('active');
        page.classList.add('active');
        currentPage = page;
    }

    function saveGameState() {
        gameState.userNames = userNames;
        localStorage.setItem('happyday_gameState', JSON.stringify(gameState));
    }

    function loadGameState() {
        const savedState = localStorage.getItem('happyday_gameState');
        if (savedState) {
            gameState = JSON.parse(savedState);
            userNames = gameState.userNames || ['Reyvan', 'Balqis', 'Saka', 'Carol'];
        } else {
            gameState = { currentMission: 0 };
            userNames = ['Reyvan', 'Balqis', 'Saka', 'Carol'];
            saveGameState();
        }
    }
    
    // PERBAIKAN: Fungsi kontrol audio yang menyasar iframe
    function playSound(iframeElement) {
        let src = iframeElement.src;
        if (!src.includes('autoplay=1')) {
            iframeElement.src = src + "&autoplay=1";
        }
    }
    
    function stopSound(iframeElement) {
        let src = iframeElement.src;
        iframeElement.src = src.replace("&autoplay=1", "");
    }
    
    function typeWriter(element, text, speed = 50, callback) {
        let i = 0;
        element.innerHTML = "";
        const interval = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, speed);
    }

    // === Game Flow ===
    
    function startNarrative(key, onComplete) {
        showPage(pages.narrative);
        const textArray = narratives[key];
        let narrativeIndex = 0;
        const narrativeTextEl = document.getElementById('narrative-text');
        const continueBtn = document.getElementById('continue-btn');
        
        function showNext() {
            if (narrativeIndex < textArray.length) {
                continueBtn.style.display = 'none';
                typeWriter(narrativeTextEl, textArray[narrativeIndex], 50, () => {
                    continueBtn.style.display = 'block';
                });
                narrativeIndex++;
            } else {
                onComplete();
            }
        }
        continueBtn.onclick = showNext;
        showNext();
    }

    function setupUserInput() {
        showPage(pages.userInput);
        const userListEl = document.getElementById('user-list');
        const nameInput = document.getElementById('manual-name-input');
        const addBtn = document.getElementById('add-name-btn');
        const startMissionBtn = document.getElementById('start-mission-btn');
        
        function renderUsers() {
            userListEl.innerHTML = userNames.map(name => `<p>${name}</p>`).join('');
        }
        
        addBtn.onclick = () => {
            const newName = nameInput.value.trim();
            if (newName && !userNames.includes(newName)) {
                userNames.push(newName);
                renderUsers();
                saveGameState();
                nameInput.value = '';
            }
        };
        startMissionBtn.onclick = () => {
            if (userNames.length > 0) {
                gameState.currentMission = 1; // Misi 1 = Spin Ketua
                saveGameState();
                runMission(1);
            } else {
                alert("Tambahkan setidaknya satu nama.");
            }
        };
        renderUsers();
    }
    
    // PERBAIKAN: Logika Misi Kini Lengkap!
    function runMission(missionId) {
        showPage(pages.mission);
        const contentEl = document.getElementById('mission-content');
        
        const missions = {
            1: { // Spin Ketua
                title: "Misi 1: Pemilihan Ketua",
                setup: () => {
                    contentEl.innerHTML = `
                        <h2 class="retro-text flicker">${missions[1].title}</h2>
                        <p class="spinner-display" id="spinner-display" style="font-size: 2em; height: 1.5em;"></p>
                        <button id="spin-btn" class="btn glitch-btn">SPIN</button>
                        <p id="mission-result" class="retro-text" style="display:none;"></p>
                    `;
                    document.getElementById('spin-btn').onclick = () => {
                        let spinCount = 0;
                        const spinInterval = setInterval(() => {
                            const randName = userNames[Math.floor(Math.random() * userNames.length)];
                            document.getElementById('spinner-display').textContent = randName;
                            if (++spinCount > 30) {
                                clearInterval(spinInterval);
                                const leader = userNames[Math.floor(Math.random() * userNames.length)];
                                document.getElementById('spinner-display').textContent = leader;
                                const resultEl = document.getElementById('mission-result');
                                resultEl.textContent = `${leader} terpilih menjadi ketua. Bersiap untuk misi selanjutnya.`;
                                resultEl.style.display = 'block';
                                setTimeout(() => runMission(2), 4000);
                            }
                        }, 100);
                    };
                }
            },
            2: { // Input Kunci
                title: "Misi 2: Cari Kata Kunci",
                setup: () => {
                    contentEl.innerHTML = `
                        <h2 class="retro-text flicker">${missions[2].title}</h2>
                        <p class="animated-text">kalian harus mencari kertas di masing² karpet di lantai satu SD MI swasta untuk menemukan kata kuncinya.</p>
                        <input type="text" id="clue-input" placeholder="Clue: SAT43" class="retro-input" style="margin-top:20px;">
                        <button id="submit-clue-btn" class="btn">Submit</button>
                        <p id="clue-feedback" class="retro-text"></p>
                    `;
                    document.getElementById('submit-clue-btn').onclick = () => {
                        const input = document.getElementById('clue-input').value.trim();
                        const feedback = document.getElementById('clue-feedback');
                        if (input.toUpperCase() === 'SAT43') {
                            feedback.textContent = 'BENAR. Mempersiapkan misi selanjutnya...';
                            setTimeout(() => runMission(3), 5000);
                        } else {
                            feedback.textContent = 'SALAH. Coba lagi.';
                        }
                    };
                }
            },
            3: { // Mundur
                title: "Misi 3: Pengorbanan",
                setup: () => {
                    let chosenOne = userNames[Math.floor(Math.random() * userNames.length)];
                    contentEl.innerHTML = `<h2 class="retro-text flicker">${missions[3].title}</h2>`;
                    typeWriter(contentEl, contentEl.innerHTML + `<p class="animated-text">Kami telah memilih. ${chosenOne}, silahkan mundur 5 meter dari perangkat sekarang juga.</p>`, 50,
                        () => setTimeout(() => runMission(4), 6000));
                }
            },
            4: { // Keliling SD
                title: "Misi 4: Ritual Digital",
                setup: () => {
                    contentEl.innerHTML = `<h2 class="retro-text flicker">${missions[4].title}</h2>`;
                    typeWriter(contentEl, contentEl.innerHTML + `<p class="animated-text">Semuanya, putari gedung SD MI selama 3 menit. Setelah selesai, periksa pengaturan WiFi kalian. Kami akan muncul secara digital. Jangan takut.</p>`, 50,
                        () => setTimeout(() => runMission(5), 10000));
                }
            },
            5: { // Hadsaplas
                title: "Misi 5: Pengusiran",
                setup: () => {
                    contentEl.innerHTML = `<h2 class="retro-text flicker">${missions[5].title}</h2>`;
                    typeWriter(contentEl, contentEl.innerHTML + `<p class="animated-text">Gunakan hadsaplas dari petunjuk sebelumnya. Salah satu dari kalian dirasuki. Berpencar, dan tempelkan pada anak yang paling aneh untuk mengusir entitas itu.</p>`, 50,
                        () => setTimeout(() => runMission(6), 10000));
                }
            }
        };

        gameState.currentMission = missionId;
        saveGameState();
        
        if (missions[missionId]) {
            missions[missionId].setup();
        } else {
            showPage(pages.gameOver);
        }
    }

    // === Alert System ===
    function checkTimeForAlert() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const isAlertTime = (hour > 19 || (hour === 19 && minute >= 30)) || (hour < 6);
        
        if (isAlertTime && !pages.alert.classList.contains('active')) {
            activateAlertMode(true);
        } else if (!isAlertTime && pages.alert.classList.contains('active')) {
            activateAlertMode(false);
        }
    }

    function activateAlertMode(isActive) {
        // ... (Kode activateAlertMode dari jawaban sebelumnya, sudah benar) ...
    }

    // PERBAIKAN: Countdown Timer yang hilang
    function setupCountdown() {
        const countdownEl = document.createElement('div');
        countdownEl.id = 'alert-countdown';
        document.body.appendChild(countdownEl);

        function update() {
            const now = new Date();
            let target = new Date(now);
            target.setHours(19, 30, 0, 0);

            if (now > target) {
                target.setDate(target.getDate() + 1);
            }

            const diff = target - now;
            const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
            const m = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
            const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
            
            const isAlertTime = (now.getHours() > 19 || (now.getHours() === 19 && now.getMinutes() >= 30)) || (now.getHours() < 6);
            countdownEl.style.display = isAlertTime ? 'none' : 'block';
            countdownEl.textContent = `ALERT DALAM: ${h}:${m}:${s}`;
        }
        setInterval(update, 1000);
        update();
    }

    // === Initialization ===
    function routePlayer() {
        if (gameState.currentMission === 0) {
            showPage(pages.levelSelect);
        } else if (gameState.currentMission > 0 && gameState.currentMission <= 5) {
            runMission(gameState.currentMission);
        } else {
            showPage(pages.gameOver);
        }
    }

    function init() {
        loadGameState();
        
        document.getElementById('start-game-btn').onclick = () => {
            playSound(audio.start);
            playSound(audio.main);
            showPage(pages.levelSelect);
            document.documentElement.requestFullscreen().catch(e => {});
        };

        document.getElementById('level1-btn').onclick = () => {
            if (gameState.currentMission === 0) {
                startNarrative('intro', () => {
                    setupUserInput();
                });
            } else {
                routePlayer();
            }
        };

        document.getElementById('delete-progress-btn').onclick = () => {
             if (confirm("Yakin ingin menghapus semua progres?")) {
                localStorage.removeItem('happyday_gameState');
                window.location.reload();
            }
        };
        
        setInterval(checkTimeForAlert, 30000);
        checkTimeForAlert();
        setupCountdown(); // Memanggil fungsi countdown
        Notification.requestPermission();
    }

    init();
});
