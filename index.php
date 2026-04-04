<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Modern GBA Emulator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

    <script src="https://endrift.github.io/gbajs/js/util.js"></script>
<script src="https://endrift.github.io/gbajs/js/core.js"></script>
<script src="https://endrift.github.io/gbajs/js/arm.js"></script>
<script src="https://endrift.github.io/gbajs/js/thumb.js"></script>
<script src="https://endrift.github.io/gbajs/js/mmu.js"></script>
<script src="https://endrift.github.io/gbajs/js/io.js"></script>
<script src="https://endrift.github.io/gbajs/js/audio.js"></script>
<script src="https://endrift.github.io/gbajs/js/video.js"></script>
<script src="https://endrift.github.io/gbajs/js/video/proxy.js"></script>
<script src="https://endrift.github.io/gbajs/js/video/software.js"></script>
<script src="https://endrift.github.io/gbajs/js/irq.js"></script>
<script src="https://endrift.github.io/gbajs/js/keypad.js"></script>
<script src="https://endrift.github.io/gbajs/js/savedata.js"></script>
<script src="https://endrift.github.io/gbajs/js/gpio.js"></script>
    <script src="https://endrift.github.io/gbajs/js/gba.js"></script>
    <script src="https://endrift.github.io/gbajs/resources/xhr.js"></script>
    <script src="gbajs-bridge.js"></script>
    <!-- Link to the external stylesheet -->
    <link rel="stylesheet" href="style.css">
</head>
<body class="flex items-center justify-center min-h-screen p-4">

    <div id="emulator-wrapper" class="w-full max-w-3xl flex flex-col gap-4">
        <!-- Screen Area with Overlay Container -->
        <div class="relative">
            <div class="bg-gray-800 p-2 sm:p-4 rounded-xl shadow-lg border border-gray-700">
                <canvas id="screen" width="240" height="160"></canvas>
            </div>

            <!-- Mobile Controls Overlay -->
            <div id="mobile-controls-overlay" class="md:hidden absolute inset-0 p-4 text-white">
                <!-- Top Buttons: L & R -->
                <div class="absolute top-4 left-4 right-4 flex justify-between">
                    <button id="btn-l-overlay" class="control-btn overlay-btn rounded-lg h-12 w-20 text-sm font-semibold">L</button>
                    <button id="btn-r-overlay" class="control-btn overlay-btn rounded-lg h-12 w-20 text-sm font-semibold">R</button>
                </div>

                <!-- Bottom Buttons: D-Pad, A, B, Start, Select -->
                <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <!-- D-Pad -->
                    <div class="grid grid-cols-3 grid-rows-3 gap-2 w-40 h-40">
                        <button id="btn-up-overlay" class="control-btn overlay-btn w-full h-full rounded-md col-start-2 row-start-1">▲</button>
                        <button id="btn-left-overlay" class="control-btn overlay-btn w-full h-full rounded-md col-start-1 row-start-2">◀</button>
                        <button id="btn-right-overlay" class="control-btn overlay-btn w-full h-full rounded-md col-start-3 row-start-2">▶</button>
                        <button id="btn-down-overlay" class="control-btn overlay-btn w-full h-full rounded-md col-start-2 row-start-3">▼</button>
                    </div>

                    <!-- Action Buttons (A & B) -->
                    <div class="flex items-center gap-4">
                        <button id="btn-b-overlay" class="control-btn overlay-btn w-20 h-20 rounded-full text-2xl font-bold">B</button>
                        <button id="btn-a-overlay" class="control-btn overlay-btn w-20 h-20 rounded-full text-2xl font-bold">A</button>
                    </div>
                </div>

                <!-- Bottom Center: Start & Select -->
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <button id="btn-select-overlay" class="control-btn overlay-btn rounded-full h-10 px-4 text-xs font-semibold">SELECT</button>
                    <button id="btn-start-overlay" class="control-btn overlay-btn rounded-full h-10 px-4 text-xs font-semibold">START</button>
                </div>
            </div>
        </div>

        <!-- ROM Selector and Save Management -->
        <div id="rom-selector-container" class="text-center flex flex-col sm:flex-row gap-4 justify-center items-center">
            <select id="rom-select" class="bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer w-full sm:w-auto appearance-none text-center">
                <option value="">-- Select a Game --</option>
                <!-- ROMs will be dynamically loaded here -->
            </select>
            <div class="flex gap-2">
                <button id="export-save-btn" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg cursor-pointer">Export Save</button>
                <label for="import-save-file" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg cursor-pointer">Import Save</label>
                <input type="file" id="import-save-file" class="hidden" accept=".sav">
            </div>
        </div>
        <p id="loading-message" class="text-gray-400 mt-2 text-sm text-center">Select a game to begin.</p>


        <!-- Desktop Controls Area -->
        <div class="hidden md:block bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 text-white">
            <!-- Top row: L, R, Select, Start -->
            <div class="flex justify-center gap-2 mb-4">
                <button id="btn-l" class="control-btn rounded-lg h-10 w-16 text-sm font-semibold">L</button>
                <button id="btn-r" class="control-btn rounded-lg h-10 w-16 text-sm font-semibold">R</button>
                <div class="flex-grow"></div>
                <button id="btn-select" class="control-btn rounded-full h-10 px-4 text-xs font-semibold">SELECT</button>
                <button id="btn-start" class="control-btn rounded-full h-10 px-4 text-xs font-semibold">START</button>
            </div>

            <!-- Bottom row: D-Pad and Action Buttons -->
            <div class="flex justify-between items-center">
                <!-- D-Pad -->
                <div class="grid grid-cols-3 grid-rows-3 gap-1 w-36 h-36">
                    <button id="btn-up" class="control-btn w-full h-full rounded-md col-start-2 row-start-1">▲</button>
                    <button id="btn-left" class="control-btn w-full h-full rounded-md col-start-1 row-start-2">◀</button>
                    <button id="btn-right" class="control-btn w-full h-full rounded-md col-start-3 row-start-2">▶</button>
                    <button id="btn-down" class="control-btn w-full h-full rounded-md col-start-2 row-start-3">▼</button>
                </div>

                <!-- Action Buttons (A & B) -->
                <div class="flex items-center gap-4">
                    <button id="btn-b" class="control-btn w-20 h-20 rounded-full text-2xl font-bold">B</button>
                    <button id="btn-a" class="control-btn w-20 h-20 rounded-full text-2xl font-bold">A</button>
                </div>
            </div>
        </div>
    </div>

    <script src="app.js" defer></script>
</body>
</html>
