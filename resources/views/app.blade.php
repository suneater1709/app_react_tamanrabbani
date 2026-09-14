<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>KB-TK IT Taman Robbani Sidoarjo - PPDB Online</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        
        <!-- Google Fonts (Inter & Space Grotesk) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body class="antialiased bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
        <div id="app"></div>
    </body>
</html>
