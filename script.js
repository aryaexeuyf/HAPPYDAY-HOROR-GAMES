document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const gameContainer = document.getElementById('game-container');
    const pages = document.querySelectorAll('.game-page');
    const startScreen = document.getElementById('start-screen');
    const levelSelectionScreen = document.getElementById('level-selection-screen');
    const narrativeScreen = document.getElementById('narrative-screen');
    const userInputScreen = document.getElementById('user-input-screen');
    const missionScreen = document.getElementById('mission-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const alertScreen = document.getElementById('alert-screen');

    const startGameBtn = document.getElementById('start-game-btn');
    const level1Btn = document.getElementById('level1-btn');
    const deleteProgressBtn = document.getElementById('delete-progress-btn');
    
    // Audio Elements
    const mainBgsound = document.getElementById('main-bgsound');
    const startSound = document.getElementById('start-sound');
    const alertBgsound = document.getElementById('alert-bgsound');

    // === Game State ===
    let currentPage = startScreen;
    let gameState = {};
    let userNames = [];
    const narratives = {
        intro: [
            "hallo saya orang di belakang Anda yang bener² GK keliatan secara wujud tapi saya telah memantau anda setelah anda membuka link website ini dan setuju² semua syarat yang kami berikan sebelum nya berarti anda telah tau konsekuensi nya yaitu anda harus menerima semua teror yang saya berikan di kawasan sini,",
            "anda pasti berada di lokasi : Dekat GFX5+PCW TOKO HARIYANTO, Unnamed Road, Jatikulon, Lengkong, Kec. Mojoanyar, Kabupaten Mojokerto, Jawa Timur 61364, anda di sebelah pojok kiri toko Hariyanto jalan njatikulon, dan orang² di dekat anda pasti anak² kecil",
        ],
        // ... narasi misi lainnya
    };
    const alertVideos = [
        '8mcXpBb3VzU', // Vidio 1
        'JTcOy3bJ4p4', // Vidio 2
        'Yz4Y61lZR_s', // Vidio 3
    ];
    let currentAlertVideoIndex = 0;
    let flashInterval;

    // === Utility Functions ===
    
    // PERBAIKAN: Fungsi untuk transisi halaman yang lebih baik
    function showPage(page) {
        if (currentPage) {
            currentPage.classList.remove('active');
        }
        page.classList.add('active');
        currentPage = page;
    }

    // PERBAIKAN: Sistem penyimpanan yang lebih solid
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
            // Default state
            gameState = { currentMission: 0 };
            userNames = ['Reyvan', 'Balqis', 'Saka', 'Carol'];
            saveGameState();
        }
    }

    function clearGameState() {
        if (confirm("Yakin ingin menghapus semua progres? Tindakan ini tidak dapat dibatalkan.")) {
            localStorage.removeItem('happyday_gameState');
            alert("Progres telah direset.");
            window.location.reload();
        }
    }

    // PERBAIKAN: Kontrol audio yang terpusat
    function playSound(soundElement, stopOthers = []) {
        stopOthers.forEach(s => s.pause());
        soundElement.currentTime = 0;
        soundElement.play().catch(e => console.log("Autoplay diblokir:", e));
    }
    
    function stopSound(soundElement) {
        soundElement.pause();
    }
    
    // Fungsi untuk animasi mengetik
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
    
    // === Game Logic & Flow ===
    
    function startNarrative(key) {
        showPage(narrativeScreen);
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
                // Selesai narasi, lanjut ke langkah berikutnya
                if (key === 'intro') {
                    gameState.currentMission = 1;
                    saveGameState();
                    setupUserInput();
                }
            }
        }
        
        continueBtn.onclick = showNext;
        showNext();
    }

    function setupUserInput() {
        showPage(userInputScreen);
        const userListEl = document.getElementById('user-list');
        const nameInput = document.getElementById('manual-name-input');
        const addBtn = document.getElementById('add-name-btn');
        const startMissionBtn = document.getElementById('start-mission-btn');
        
        function renderUsers() {
            userListEl.innerHTML = '';
            userNames.forEach(name => {
                const p = document.createElement('p');
                p.textContent = name;
                userListEl.appendChild(p);
            });
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
                gameState.currentMission = 2; // Misi memilih ketua
                saveGameState();
                runMission(2);
            } else {
                alert("Tambahkan setidaknya satu nama.");
            }
        };
        
        renderUsers();
    }
    
    function runMission(missionId) {
        showPage(missionScreen);
        const contentEl = document.getElementById('mission-content');
        contentEl.innerHTML = ''; // Kosongkan konten misi sebelumnya

        switch (missionId) {
            case 2: // Misi 1 di prompt: Spin Ketua
                contentEl.innerHTML = `
                    <h2 class="retro-text flicker">Misi 1: Pemilihan Ketua</h2>
                    <p class="spinner-display" id="spinner-display"></p>
                    <button id="spin-btn" class="btn glitch-btn">SPIN</button>
                    <p id="mission-result" class="retro-text" style="display:none;"></p>
                    <button id="mission-continue" class="btn continue-btn" style="display:none;">Lanjut</button>
                `;
                // ... (Logika spin ketua di sini) ...
                break;
            case 3: // Misi 2 di prompt: Input Kunci
                contentEl.innerHTML = `
                    <h2 class="retro-text flicker">Misi 2: Cari Kata Kunci</h2>
                    <p class="narrative-text">kalian harus mencari petunjuk text di sebelah SD mi swasta... cari kertas di masing² karpet di lantai satu... clue nya untuk menemukan kata kuncine.</p>
                    <input type="text" id="clue-input" placeholder="Clue: karpet lantai satu SD mi" class="retro-input">
                    <button id="submit-clue-btn" class="btn">Submit</button>
                    <p id="clue-feedback" class="retro-text"></p>
                `;
                // PERBAIKAN: Input sekarang bisa diisi
                document.getElementById('submit-clue-btn').onclick = () => {
                    const input = document.getElementById('clue-input').value.trim();
                    const feedback = document.getElementById('clue-feedback');
                    if (input.toUpperCase() === 'SAT43') {
                        feedback.textContent = 'BENAR. Mempersiapkan misi selanjutnya...';
                        feedback.classList.add('text-shadow-pulse');
                        setTimeout(() => {
                           gameState.currentMission = 4;
                           saveGameState();
                           runMission(4);
                        }, 5000);
                    } else {
                        feedback.textContent = 'SALAH. Coba lagi.';
                    }
                };
                break;
             // ... tambahkan case untuk misi lainnya (misi 4, 5, dst.) ...
             default:
                showPage(gameOverScreen);
        }
    }

    // === Alert System ===
    
    // PERBAIKAN: Logika waktu yang akurat
    function checkTimeForAlert() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        // Aktif jika: (jam > 19) ATAU (jam == 19 DAN menit >= 30) ATAU (jam < 6)
        if ((hour > 19 || (hour === 19 && minute >= 30)) || (hour < 6)) {
            if (!alertScreen.classList.contains('active')) {
                activateAlertMode(true);
            }
        } else {
            if (alertScreen.classList.contains('active')) {
                activateAlertMode(false);
            }
        }
    }

    function activateAlertMode(isActive) {
        if (isActive) {
            showPage(alertScreen);
            stopSound(mainBgsound);
            playSound(alertBgsound);

            const narrativeEl = document.getElementById('alert-narrative');
            const alertText = "bersembunyi cepat monsters² yang kami tahan lepas kembali karna setiap jam 8 malam semua monster keluar peringatan² bahaya pastikan kalian pulang ke rumah masing² semuanya...";
            typeWriter(narrativeEl, alertText, 50);

            playNextAlertVideo();
            setInterval(playNextAlertVideo, 30000); // Ganti video setiap 30 detik
            
            // Simulasi flash
            const flashOverlay = document.getElementById('flash-overlay');
            flashOverlay.style.display = 'block';
            flashInterval = setInterval(() => {
                flashOverlay.style.opacity = Math.random() > 0.8 ? '0.7' : '0';
            }, 200);

            // Kirim notifikasi
            sendWebNotification();

        } else {
            // Kembali ke halaman game normal
            stopSound(alertBgsound);
            playSound(mainBgsound);
            clearInterval(flashInterval);
            document.getElementById('flash-overlay').style.display = 'none';
            // Arahkan kembali ke progres terakhir
            routePlayer();
        }
    }

    function playNextAlertVideo() {
        const videoId = alertVideos[currentAlertVideoIndex];
        const player = document.getElementById('alert-video-player');
        // PERBAIKAN: Parameter embed YouTube yang lebih baik
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=${videoId}`;
        currentAlertVideoIndex = (currentAlertVideoIndex + 1) % alertVideos.length;
    }

    function sendWebNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
             const messages = ["hallo saya disini", "kami di dekat mu", "kamu di mana"];
             const body = messages[Math.floor(Math.random() * messages.length)];
             navigator.serviceWorker.ready.then(reg => {
                reg.showNotification('PERINGATAN DARI HAPPYDAY', {
                    body: body,
                    icon: '/icon-192.png',
                    vibrate: [200, 100, 200]
                });
             });
        }
    }

    // === Initialization ===
    
    function routePlayer() {
        if (gameState.currentMission === 0) {
            showPage(startScreen);
        } else if (gameState.currentMission === 1) {
            setupUserInput();
        } else if (gameState.currentMission > 1 && gameState.currentMission <= 5) { // Asumsi ada 5 misi
            runMission(gameState.currentMission);
        } else {
             showPage(gameOverScreen);
        }
    }
    
    function init() {
        loadGameState();
        
        startGameBtn.addEventListener('click', () => {
            playSound(startSound);
            playSound(mainBgsound);
            showPage(levelSelectionScreen);
            // Fullscreen request
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        });

        level1Btn.addEventListener('click', () => {
            if (gameState.currentMission < 1) {
                startNarrative('intro');
            } else {
                routePlayer();
            }
        });

        deleteProgressBtn.addEventListener('click', clearGameState);
        
        // Cek Peringatan setiap 30 detik
        setInterval(checkTimeForAlert, 30000);
        checkTimeForAlert(); // Cek langsung saat load
        
        // Minta izin notifikasi
        Notification.requestPermission();
    }

    init();
});
