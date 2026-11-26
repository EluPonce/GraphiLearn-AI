<!DOCTYPE html>
<html lang="es" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="GraphiLearn AI">
    <meta name="theme-color" content="#0f766e">
    <title>GraphiLearn AI</title>

    {{-- PWA Manifest --}}
    <link rel="manifest" href="/manifest.json">

    {{-- Íconos Apple (iOS add to homescreen) --}}
    <link rel="apple-touch-icon" href="/icons/icon-192.png">
    <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png">
    <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png">

    {{-- Favicon --}}
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="h-full bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
    <div id="root" class="h-full"></div>

    {{-- Registrar Service Worker para PWA --}}
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('[GraphiLearn PWA] SW registrado:', reg.scope))
                    .catch(err => console.warn('[GraphiLearn PWA] SW error:', err));
            });
        }
    </script>
</body>
</html>
