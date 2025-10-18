self.addEventListener('push', function(event) {
    const data = event.data.json();
    console.log('Push received:', data);

    const title = data.title || 'Peringatan HAPPY DAY Season 2';
    const options = {
        body: data.body || 'Ada aktivitas aneh terdeteksi di dekatmu!',
        icon: data.icon || '/icon-192.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        badge: data.badge || '/icon-192.png',
        data: {
            url: data.url || '/'
        },
        requireInteraction: true // Notifikasi akan tetap terlihat sampai diklik
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// Event listener 'fetch' untuk PWA offline, jika diperlukan
self.addEventListener('fetch', function(event) {
    // Anda bisa menambahkan caching aset di sini agar website bisa berjalan offline
});
