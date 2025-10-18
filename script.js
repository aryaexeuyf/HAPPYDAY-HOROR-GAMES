document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const pages = document.querySelectorAll('.game-page');
    const startScreen = document.getElementById('start-screen');
    const levelSelectionScreen = document.getElementById('level-selection-screen');
    const narrativeLevel1Screen = document.getElementById('narrative-level1-screen');
    const userInputScreen = document.getElementById('user-input-screen');
    const mission1Screen = document.getElementById('mission1-screen');
    const mission2Screen = document.getElementById('mission2-screen');
    const mission3Screen = document.getElementById('mission3-screen');
    const mission4Screen = document.getElementById('mission4-screen');
    const mission5Screen = document['mission5-screen']; // Menggunakan notasi bracket jika ada dash
    const gameOverScreen = document.getElementById('game-over-screen');
    const alertScreen = document.getElementById('alert-screen');

    const startGameBtn = document.getElementById('start-game-btn');
    const startSoundIframe = document.getElementById('start-sound-iframe'); // Iframe untuk suara klik start
    const level1Btn = document.getElementById('level1-btn');
    const level2Btn = document.getElementById('level2-btn');
    const level3Btn = document.getElementById('level3-btn');
    const levelStatus = document.getElementById('level-status');
    const deleteProgressBtn = document.getElementById('delete-progress-btn');
    const narrativeText = document.getElementById('narrative-text');
    const continueNarrativeBtn = document.getElementById('continue-narrative-btn');
    const userInputList = document.getElementById('user-list');
    const manualNameInput = document.getElementById('manual-name-input');
    const addNameBtn = document.getElementById('add-name-btn');
    const startMissionBtn = document.getElementById('start-mission-btn');
    const spinnerDisplay = document.getElementById('spinner-display');
    const spinBtn = document.getElementById('spin-btn');
    const chosenLeaderText = document.getElementById('chosen-leader-text');
    const continueMission1Btn = document.getElementById('continue-mission1-btn');
    const mission2Narrative = document.getElementById('mission2-narrative');
    const clueInput = document.getElementById('clue-input');
    const submitClueBtn = document.getElementById('submit-clue-btn');
    const clueFeedback = document.getElementById('clue-feedback');
    const loadingSpinner = document.getElementById('loading-spinner');
    const continueMission2Btn = document.getElementById('continue-mission2-btn');
    const mission3Narrative = document.getElementById('mission3-narrative');
    const mission3SpinnerDisplay = document.getElementById('mission3-spinner-display');
    const mission3SpinBtn = document.getElementById('mission3-spin-btn');
    const chosenChildText = document.getElementById('chosen-child-text');
    const continueMission3Btn = document.getElementById('continue-mission3-btn');
    const mission4Narrative = document.getElementById('mission4-narrative');
    const continueMission4Btn = document.getElementById('continue-mission4-btn');
    const mission5Narrative = document.getElementById('mission5-narrative');
    const missionCompleteBtn = document.getElementById('mission-complete-btn');

    const alertNarrative = document.getElementById('alert-narrative');
    const alertVideoIframe1 = document.getElementById('alert-video-iframe1');
    const alertVideoIframe2 = document.getElementById('alert-video-iframe2');
    const alertVideoIframe3 = document.getElementById('alert-video-iframe3');
    const alertBacksound = document.getElementById('alert-backsound');
    const flashOverlay = document.getElementById('flash-overlay');

    let currentActivePage = startScreen;
    let userNames = ['Reyvan', 'Balqis', 'Saka', 'Carol'];
    let currentNarrativeIndex = 0;
    let typingInterval;
    let missionProgression = {
        level1: {
            narrativeDone: false,
            userInputDone: false,
            mission1Done: false,
            mission2Done: false,
            mission3Done: false,
            mission4Done: false,
            mission5Done: false
        }
    };

    // --- Fungsi Utilitas ---
    function showPage(page) {
        currentActivePage.classList.remove('active');
        page.classList.add('active');
        currentActivePage = page;
        // Opsional: Panggil requestFullscreen() di sini jika browser mengizinkan
        // document.documentElement.requestFullscreen();
    }

    function saveProgress() {
        localStorage.setItem('happyday_progress', JSON.stringify(missionProgression));
        localStorage.setItem('happyday_users', JSON.stringify(userNames));
    }

    function loadProgress() {
        const savedProgress = localStorage.getItem('happyday_progress');
        const savedUsers = localStorage.getItem('happyday_users');
        if (savedProgress) {
            missionProgression = JSON.parse(savedProgress);
        }
        if (savedUsers) {
            userNames = JSON.parse(savedUsers);
            renderUserList();
        }
    }

    function clearProgress() {
        if (confirm("Apakah Anda yakin ingin menghapus semua progres? Ini tidak dapat dibatalkan.")) {
            localStorage.removeItem('happyday_progress');
            localStorage.removeItem('happyday_users');
            missionProgression = { level1: { narrativeDone: false, userInputDone: false, mission1Done: false, mission2Done: false, mission3Done: false, mission4Done: false, mission5Done: false } };
            userNames = ['Reyvan', 'Balqis', 'Saka', 'Carol'];
            renderUserList();
            alert("Progres telah dihapus!");
            showPage(levelSelectionScreen); // Kembali ke halaman pemilihan level
        }
    }

    function typeWriterEffect(element, text, speed, callback) {
        let i = 0;
        element.textContent = '';
        clearInterval(typingInterval);
        element.style.width = '0%'; // Reset width for typing animation

        typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                if (callback) callback();
            }
        }, speed);
    }

    function renderUserList() {
        userInputList.innerHTML = '';
        userNames.forEach(name => {
            const p = document.createElement('p');
            p.textContent = name;
            userInputList.appendChild(p);
        });
    }

    // --- Event Listeners & Logic ---

    // Permintaan Fullscreen di awal
    function requestFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE/Edge */
            element.msRequestFullscreen();
        }
    }

    // Panggil fullscreen saat interaksi pertama
    document.addEventListener('click', requestFullscreen, { once: true });
    document.addEventListener('touchstart', requestFullscreen, { once: true });


    startGameBtn.addEventListener('click', () => {
        // Play start sound effect
        if (startSoundIframe) {
            const src = startSoundIframe.src;
            startSoundIframe.src = src.replace('autoplay=0', 'autoplay=1'); // Aktifkan autoplay
            setTimeout(() => {
                startSoundIframe.src = src.replace('autoplay=1', 'autoplay=0'); // Hentikan setelah beberapa saat
            }, 30000); // Stop after 30 seconds, adjust as needed
        }
        showPage(levelSelectionScreen);
    });

    level1Btn.addEventListener('click', () => {
        // Jika sudah melewati input pengguna, langsung ke misi pertama
        if (missionProgression.level1.userInputDone) {
            showPage(mission1Screen); // Atau ke misi yang terakhir diselesaikan
        } else if (missionProgression.level1.narrativeDone) {
            showPage(userInputScreen);
        } else {
            showPage(narrativeLevel1Screen);
            startLevel1Narrative();
        }
    });

    level2Btn.addEventListener('click', () => {
        levelStatus.textContent = "Level game ini sedang dalam pengembangan (HAPPYDAY Present)";
    });

    level3Btn.addEventListener('click', () => {
        levelStatus.textContent = "Level game ini sedang dalam pengembangan (HAPPYDAY Present)";
    });

    deleteProgressBtn.addEventListener('click', clearProgress);

    // --- Narasi Level 1 ---
    const level1NarrativeTexts = [
        "Hallo saya orang di belakang Anda yang bener-bener GK keliatan secara wujud tapi saya telah memantau anda setelah anda membuka link website ini dan setuju-setuju semua syarat yang kami berikan sebelumnya berarti anda telah tau konsekuensinya yaitu anda harus menerima semua teror yang saya berikan di kawasan sini,",
        "anda pasti berada di lokasi : Dekat GFX5+PCW TOKO HARIYANTO, Unnamed Road, Jatikulon, Lengkong, Kec. Mojoanyar, Kabupaten Mojokerto, Jawa Timur 61364,",
        "anda di sebelah pojok kiri toko Hariyanto jalan njatikulon, dan orang-orang di dekat anda pasti anak-anak kecil."
    ];

    function startLevel1Narrative() {
        currentNarrativeIndex = 0;
        displayNextNarrative();
    }

    function displayNextNarrative() {
        if (currentNarrativeIndex < level1NarrativeTexts.length) {
            continueNarrativeBtn.style.display = 'none';
            typeWriterEffect(narrativeText, level1NarrativeTexts[currentNarrativeIndex], 70, () => {
                continueNarrativeBtn.style.display = 'block';
            });
            currentNarrativeIndex++;
        } else {
            missionProgression.level1.narrativeDone = true;
            saveProgress();
            showPage(userInputScreen);
        }
    }

    continueNarrativeBtn.addEventListener('click', displayNextNarrative);

    // --- User Input ---
    addNameBtn.addEventListener('click', () => {
        const newName = manualNameInput.value.trim();
        if (newName && !userNames.includes(newName)) {
            userNames.push(newName);
            manualNameInput.value = '';
            renderUserList();
            saveProgress();
        }
    });

    startMissionBtn.addEventListener('click', () => {
        if (userNames.length > 0) {
            missionProgression.level1.userInputDone = true;
            saveProgress();
            showPage(mission1Screen);
        } else {
            alert("Harap tambahkan setidaknya satu nama!");
        }
    });

    // --- Misi 1: Spin Ketua ---
    spinBtn.addEventListener('click', () => {
        if (userNames.length === 0) {
            alert("Tidak ada nama untuk di-spin!");
            return;
        }
        spinBtn.disabled = true;
        let spinCount = 0;
        const totalSpins = 30; // Jumlah putaran untuk efek animasi
        const spinSpeed = 100; // Kecepatan putaran

        const spinningInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * userNames.length);
            spinnerDisplay.textContent = userNames[randomIndex];
            spinCount++;
            if (spinCount > totalSpins) {
                clearInterval(spinningInterval);
                const chosenLeader = userNames[Math.floor(Math.random() * userNames.length)];
                chosenLeaderText.textContent = `Nama yang akan kami pilih menjadi ketua di game horor ini adalah ${chosenLeader}. Berikutnya akan menjalankan misi.`;
                chosenLeaderText.style.display = 'block';
                continueMission1Btn.style.display = 'block';
                missionProgression.level1.mission1Done = true;
                saveProgress();
            }
        }, spinSpeed);
    });

    continueMission1Btn.addEventListener('click', () => {
        showPage(mission2Screen);
        startMission2Narrative();
    });

    // --- Misi 2: Cari Petunjuk ---
    const mission2NarrativeTexts = [
        "Kalian harus mencari petunjuk text di sebelah SD mi swasta yang kami pilih menjadikan suatu misi untuk mencari kata kunci untuk menamatkan game horor ini, yaitu kalian harus mencari kertas di masing-masing karpet di lantai satu satu persatu cari manual dan buka ini clue nya untuk menemukan kata kuncinya."
    ];
    const correctClue = "SAT43";

    function startMission2Narrative() {
        typeWriterEffect(mission2Narrative, mission2NarrativeTexts[0], 70, () => {
            clueInput.style.display = 'block';
            submitClueBtn.style.display = 'block';
        });
    }

    submitClueBtn.addEventListener('click', () => {
        const userAnswer = clueInput.value.trim();
        if (userAnswer === correctClue) {
            clueFeedback.textContent = "Kata kunci benar!";
            loadingSpinner.style.display = 'block';
            clueInput.disabled = true;
            submitClueBtn.disabled = true;
            setTimeout(() => {
                loadingSpinner.style.display = 'none';
                continueMission2Btn.style.display = 'block';
                missionProgression.level1.mission2Done = true;
                saveProgress();
            }, 5000); // Loading 5 detik
        } else {
            clueFeedback.textContent = "Kata kunci salah, coba lagi.";
            clueInput.value = '';
        }
    });

    continueMission2Btn.addEventListener('click', () => {
        showPage(mission3Screen);
        startMission3Narrative();
    });

    // --- Misi 3: Mundur 1 anak ---
    const mission3NarrativeTexts = [
        "Silahkan di antara kalian mundur 1 anak kami akan spin.",
        "Langsung di antara orang lain yang dipilih satu harap mundur 5 meter dari perangkat hp salah satu anak yang dipilih."
    ];
    let currentMission3NarrativeIndex = 0;

    function startMission3Narrative() {
        currentMission3NarrativeIndex = 0;
        displayNextMission3Narrative();
    }

    function displayNextMission3Narrative() {
        if (currentMission3NarrativeIndex === 0) {
            typeWriterEffect(mission3Narrative, mission3NarrativeTexts[0], 70, () => {
                document.querySelector('#mission3-screen .spinner-container').style.display = 'block';
                mission3SpinBtn.style.display = 'block';
            });
            currentMission3NarrativeIndex++;
        } else if (currentMission3NarrativeIndex === 1) {
             typeWriterEffect(mission3Narrative, mission3NarrativeTexts[1], 70, () => {
                continueMission3Btn.style.display = 'block';
            });
            currentMission3NarrativeIndex++;
        } else {
            // Should not happen if flow is controlled
        }
    }

    mission3SpinBtn.addEventListener('click', () => {
        if (userNames.length === 0) {
            alert("Tidak ada nama untuk di-spin!");
            return;
        }
        mission3SpinBtn.disabled = true;
        let spinCount = 0;
        const totalSpins = 30;
        const spinSpeed = 100;

        const spinningInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * userNames.length);
            mission3SpinnerDisplay.textContent = userNames[randomIndex];
            spinCount++;
            if (spinCount > totalSpins) {
                clearInterval(spinningInterval);
                const chosenChild = userNames[Math.floor(Math.random() * userNames.length)];
                chosenChildText.textContent = `Yang terpilih untuk mundur adalah: ${chosenChild}`;
                chosenChildText.style.display = 'block';
                // Lanjutkan narasi setelah spin
                setTimeout(displayNextMission3Narrative, 2000);
                missionProgression.level1.mission3Done = true;
                saveProgress();
            }
        }, spinSpeed);
    });

    continueMission3Btn.addEventListener('click', () => {
        showPage(mission4Screen);
        startMission4Narrative();
    });

    // --- Misi 4: Keliling SD MI ---
    const mission4NarrativeTexts = [
        "Harap semua orang yang berada di kawasan ini semuanya mengikuti aturan misi ini yaitu memutari SD MI selama 3 menit dan setelah selesai dan balik langsung buka pengaturan wifi kalian dan lihat apa yang terjadi, di situ kami akan muncul secara digital karena kamu tidak dapat kalian lihat, di situ ada nama-nama game dan nama-nama anomali kami jadi harap jangan takut."
    ];

    function startMission4Narrative() {
        typeWriterEffect(mission4Narrative, mission4NarrativeTexts[0], 70, () => {
            continueMission4Btn.style.display = 'block';
        });
    }

    continueMission4Btn.addEventListener('click', () => {
        showPage(mission5Screen);
        startMission5Narrative();
    });

    // --- Misi 5: Hadsaplas ---
    const mission5NarrativeTexts = [
        "Selanjutnya yaitu memakai hadsaplas yang kami berikan sebelumnya di key tersembunyi yang kalian temui di misi sebelumnya pakai dan kalian bersembunyi dan berpencar masing-masing karena di salah satu kalian ada yang kerasukan, tempel hadsaplas itu ke salah satu anak terus bisa mengusir jin ghoib."
    ];

    function startMission5Narrative() {
        typeWriterEffect(mission5Narrative, mission5NarrativeTexts[0], 70, () => {
            missionCompleteBtn.style.display = 'block';
        });
    }

    missionCompleteBtn.addEventListener('click', () => {
        missionProgression.level1.mission5Done = true;
        saveProgress();
        showPage(gameOverScreen);
        // Pastikan tidak bisa kembali setelah misi selesai
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function () {
            window.history.pushState(null, null, window.location.href);
        });
    });

    // --- Sistem Alert Peringatan Real-time ---
    let alertInterval;
    let currentAlertVideoIndex = 0;
    const alertVideos = [alertVideoIframe1, alertVideoIframe2, alertVideoIframe3];

    function showAlert() {
        const now = new Date();
        const hour = now.getHours();

        // Aktifkan alert dari 19:30 sampai 06:00
        if (hour >= 19 || hour < 6) { // 19:00 (7 PM) to 05:59 (5:59 AM)
            if (!alertScreen.classList.contains('active')) {
                showPage(alertScreen);
                // Play alert backsound
                if (alertBacksound.paused) {
                    alertBacksound.currentTime = 0;
                    alertBacksound.play();
                }

                // Mulai putar video peringatan
                playNextAlertVideo();
                // Atur interval untuk mengganti video setiap beberapa detik
                setInterval(playNextAlertVideo, 30000); // Ganti video setiap 30 detik

                // Tampilkan narasi alert
                const alertText = "Bersembunyi cepat monsters-monster yang kami tahan lepas kembali karena setiap jam 8 malam semua monster keluar peringatan-peringatan bahaya pastikan kalian pulang ke rumah masing-masing semuanya, pastikan anak kecil di sekitar kalian telah memasuki rumah karena kami akan melakukan teror di kawasan ini.";
                typeWriterEffect(alertNarrative, alertText, 50, () => {
                    // Loop narasi setelah selesai
                    alertInterval = setInterval(() => {
                        typeWriterEffect(alertNarrative, alertText, 50);
                    }, (alertText.length * 50) + 5000); // Tunggu sebentar lalu ulangi
                });

                // Aktifkan efek flash kamera
                toggleCameraFlash(true);

                // Kirim notifikasi web
                sendWebNotification();
            }
        } else {
            // Matikan alert jika di luar jam
            if (alertScreen.classList.contains('active')) {
                clearInterval(alertInterval);
                if (!alertBacksound.paused) {
                    alertBacksound.pause();
                }
                alertVideos.forEach(iframe => iframe.style.display = 'none'); // Sembunyikan semua video
                toggleCameraFlash(false);
                showPage(currentActivePage === alertScreen ? startScreen : currentActivePage); // Kembali ke halaman terakhir atau start
            }
        }
    }

    function playNextAlertVideo() {
        alertVideos.forEach(iframe => iframe.style.display = 'none'); // Sembunyikan semua
        alertVideos[currentAlertVideoIndex].style.display = 'block'; // Tampilkan yang aktif
        // Pastikan video mulai dari awal setiap kali ditampilkan
        const currentSrc = alertVideos[currentAlertVideoIndex].src;
        alertVideos[currentAlertVideoIndex].src = currentSrc.replace('autoplay=0', 'autoplay=1');

        // Otomatis pindah ke video berikutnya
        currentAlertVideoIndex = (currentAlertVideoIndex + 1) % alertVideos.length;
        // Jika perlu, hentikan video sebelumnya saat berganti
        // alertVideos[(currentAlertVideoIndex - 1 + alertVideos.length) % alertVideos.length].src = alertVideos[(currentAlertVideoIndex - 1 + alertVideos.length) % alertVideos.length].src.replace('autoplay=1', 'autoplay=0');
    }

    // Fungsi untuk mengaktifkan/menonaktifkan flash kamera belakang
    // PENTING: Akses flash kamera sangat terbatas dan mungkin tidak berfungsi di semua browser atau tanpa izin eksplisit.
    // Biasanya, ini hanya dimungkinkan selama sesi media aktif (misalnya, kamera sedang merekam).
    function toggleCameraFlash(enable) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log("Kamera tidak didukung.");
            return;
        }

        if (enable) {
            flashOverlay.style.display = 'block'; // Tampilkan overlay flash
            // Karena kontrol langsung flash sulit, kita simulasikan dengan overlay
            // Untuk kontrol flash asli, akan butuh video stream yang aktif
            // Jika Anda memiliki elemen <video> aktif, Anda bisa mencoba:
            // const track = window.cameraStream.getVideoTracks()[0];
            // if (track && typeof track.getCapabilities === 'function') {
            //     const capabilities = track.getCapabilities();
            //     if (capabilities.torch) {
            //         track.applyConstraints({
            //             advanced: [{ torch: true }]
            //         }).catch(e => console.error("Gagal mengaktifkan flash:", e));
            //     }
            // }
        } else {
            flashOverlay.style.display = 'none';
            // Menonaktifkan flash asli
            // const track = window.cameraStream.getVideoTracks()[0];
            // if (track && typeof track.getCapabilities === 'function') {
            //     const capabilities = track.getCapabilities();
            //     if (capabilities.torch) {
            //         track.applyConstraints({
            //             advanced: [{ torch: false }]
            //         }).catch(e => console.error("Gagal menonaktifkan flash:", e));
            //     }
            // }
        }
    }


    // Kirim notifikasi web
    function sendWebNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const messages = [
                "Hallo saya disini, kami di dekat mu, kamu di mana",
                "Text random aneh lainnya...",
                "Peringatan! Bahaya!",
                "Mereka datang..."
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];

            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('HAPPY DAY Season 2 Peringatan!', {
                    body: randomMessage,
                    icon: '/icon-192.png', // Pastikan ikon ini ada
                    vibrate: [200, 100, 200, 100, 200, 100, 200],
                    requireInteraction: true // Notifikasi akan tetap terlihat sampai diklik
                });
            });
        }
    }

    // Periksa waktu setiap menit untuk alert
    setInterval(showAlert, 60000); // Setiap 1 menit
    showAlert(); // Panggil segera saat load untuk cek kondisi awal

    // Countdown menuju alert (opsional, kecil saja di UI)
    const countdownElement = document.createElement('div');
    countdownElement.id = 'alert-countdown';
    countdownElement.style.cssText = 'position: fixed; top: 10px; right: 10px; color: #FFF; font-family: "Press Start 2P", cursive; font-size: 0.8em; text-shadow: 0 0 5px #F00; z-index: 1000;';
    document.body.appendChild(countdownElement);

    function updateCountdown() {
        const now = new Date();
        let targetTime = new Date(now);
        targetTime.setHours(19, 30, 0, 0); // Atur target ke 19:30 hari ini

        // Jika sekarang sudah lewat 19:30, set target ke 19:30 besok
        if (now.getHours() >= 19 && now.getMinutes() >= 30) {
            targetTime.setDate(targetTime.getDate() + 1);
        }

        const diff = targetTime - now;
        if (diff > 0) {
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            countdownElement.textContent = `Alert dalam: ${hours}j ${minutes}m ${seconds}d`;
            countdownElement.style.display = 'block';
        } else {
            countdownElement.style.display = 'none'; // Sembunyikan jika alarm aktif
        }
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- Inisialisasi ---
    loadProgress();
    renderUserList();
    // Arahkan ke halaman yang sesuai berdasarkan progres
    if (missionProgression.level1.narrativeDone && missionProgression.level1.userInputDone && missionProgression.level1.mission1Done && missionProgression.level1.mission2Done && missionProgression.level1.mission3Done && missionProgression.level1.mission4Done && missionProgression.level1.mission5Done) {
        showPage(gameOverScreen);
    } else if (missionProgression.level1.mission4Done) {
        showPage(mission5Screen);
        startMission5Narrative();
    } else if (missionProgression.level1.mission3Done) {
        showPage(mission4Screen);
        startMission4Narrative();
    } else if (missionProgression.level1.mission2Done) {
        showPage(mission3Screen);
        startMission3Narrative();
    } else if (missionProgression.level1.mission1Done) {
        showPage(mission2Screen);
        startMission2Narrative();
    } else if (missionProgression.level1.userInputDone) {
        showPage(mission1Screen);
    } else if (missionProgression.level1.narrativeDone) {
        showPage(userInputScreen);
    } else {
        showPage(startScreen);
    }

    // Untuk memastikan tidak bisa kembali dengan tombol back browser setelah misi dimulai
    if (missionProgression.level1.narrativeDone) {
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function () {
            window.history.pushState(null, null, window.location.href);
        });
    }
});
