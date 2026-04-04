// Use window.onload to ensure all scripts are loaded before running
window.onload = () => {
    // --- Emulator Setup ---
    const gba = new GBA();
    const canvas = document.getElementById('screen');
    const loadingMessage = document.getElementById('loading-message');
    const romSelect = document.getElementById('rom-select');
    let currentGameName = 'game'; // Default name for save files

    gba.setCanvas(canvas);

    // gbajs needs a real GBA BIOS mapped at 0x0000000 (see official demo: resources/bios.bin).
    let biosPromise = null;
    function ensureBios() {
        if (biosPromise) {
            return biosPromise;
        }
        biosPromise = (async () => {
            const res = await fetch('bios/bios.bin');
            if (!res.ok) {
                throw new Error(
                    'Missing GBA BIOS. Add a 16 KB dump as bios/bios.bin next to index.php (same folder as roms.json), then reload.'
                );
            }
            const bios = await res.arrayBuffer();
            if (bios.byteLength !== 16384) {
                throw new Error(`bios/bios.bin must be exactly 16384 bytes (got ${bios.byteLength}).`);
            }
            gba.setBios(bios, false);
        })();
        return biosPromise;
    }

    // --- Helper Functions ---
    function showMessage(message, isError = false) {
        loadingMessage.textContent = message;
        loadingMessage.style.color = isError ? '#f87171' : '#9ca3af'; // red-400 or gray-400
    }

    // --- Dynamically Load ROM List ---
    async function populateRomSelector() {
        try {
            // Fetch the list of ROMs from a JSON file
            const response = await fetch('roms.json');
            if (!response.ok) {
                throw new Error('Could not find roms.json. Please create it.');
            }
            const roms = await response.json();

            // Clear any existing options
            romSelect.innerHTML = '<option value="">-- Select a Game --</option>';

            // Add each ROM from the JSON file to the dropdown
            roms.forEach(rom => {
                const option = document.createElement('option');
                option.value = rom.path;
                option.textContent = rom.name;
                romSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading ROM list:', error);
            showMessage(error.message, true);
        }
    }

    // --- ROM Loading ---
    romSelect.addEventListener('change', async (event) => {
        const romPath = event.target.value;
        if (!romPath) return;

        const pathParts = romPath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        currentGameName = fileName.split('.').slice(0, -1).join('.') || 'untitled';

        showMessage(`Loading ${currentGameName}...`);
        try {
            await ensureBios();
            gba.pause();
            const response = await fetch(romPath);
            if (!response.ok) {
                throw new Error(`404 Not Found: Could not find the ROM file at '${romPath}'. Check your roms.json file and folder structure.`);
            }
            const romData = await response.arrayBuffer();

            if (gba.loadRom(romData)) {
                gba.runStable();
                showMessage(`${currentGameName} loaded. Enjoy!`);
            } else {
                throw new Error('The selected file is not a valid GBA ROM.');
            }
        } catch (error) {
            console.error('Error loading ROM:', error);
            showMessage(error.message, true);
        }
    });

    // --- Save Management ---
    const exportSaveBtn = document.getElementById('export-save-btn');
    const importSaveInput = document.getElementById('import-save-file');

    exportSaveBtn.addEventListener('click', () => {
        if (!gba.rom) {
            showMessage('Please load a game before exporting a save.', true);
            return;
        }
        const saveData = gba.exportSave();
        if (saveData) {
            const blob = new Blob([saveData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentGameName}.sav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('Save file exported.');
        } else {
            showMessage('No save data found to export.', true);
        }
    });

    importSaveInput.addEventListener('change', (event) => {
        if (!gba.rom) {
            showMessage('Please load a game before importing a save.', true);
            return;
        }
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const saveData = e.target.result;
                if (gba.importSave(saveData)) {
                    showMessage(`Save file '${file.name}' imported successfully.`, false);
                } else {
                    showMessage('Failed to import save. It may be for a different game.', true);
                }
                importSaveInput.value = '';
            };
            reader.readAsArrayBuffer(file);
        } else {
            importSaveInput.value = '';
        }
    });

    // --- Controls Mapping ---
    const keyMap = {
        'ArrowUp': 'UP', 'ArrowDown': 'DOWN', 'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT',
        'KeyX': 'A', 'KeyZ': 'B', 'KeyA': 'L', 'KeyS': 'R',
        'Enter': 'START', 'Backspace': 'SELECT'
    };

    const buttonMap = {
        'btn-up': 'UP', 'btn-down': 'DOWN', 'btn-left': 'LEFT', 'btn-right': 'RIGHT',
        'btn-a': 'A', 'btn-b': 'B', 'btn-l': 'L', 'btn-r': 'R',
        'btn-start': 'START', 'btn-select': 'SELECT',
        'btn-up-overlay': 'UP', 'btn-down-overlay': 'DOWN', 'btn-left-overlay': 'LEFT', 'btn-right-overlay': 'RIGHT',
        'btn-a-overlay': 'A', 'btn-b-overlay': 'B', 'btn-l-overlay': 'L', 'btn-r-overlay': 'R',
        'btn-start-overlay': 'START', 'btn-select-overlay': 'SELECT'
    };

    // --- Event Listeners ---
    window.addEventListener('keydown', (e) => {
        if (keyMap[e.code]) { e.preventDefault(); gba.keypad.press(GBA.KEY[keyMap[e.code]]); }
    });
    window.addEventListener('keyup', (e) => {
        if (keyMap[e.code]) { e.preventDefault(); gba.keypad.release(GBA.KEY[keyMap[e.code]]); }
    });

    Object.keys(buttonMap).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            const gbaKey = buttonMap[buttonId];
            button.addEventListener('mousedown', () => gba.keypad.press(GBA.KEY[gbaKey]));
            button.addEventListener('mouseup', () => gba.keypad.release(GBA.KEY[gbaKey]));
            button.addEventListener('mouseleave', () => gba.keypad.release(GBA.KEY[gbaKey]));
            button.addEventListener('touchstart', (e) => { e.preventDefault(); gba.keypad.press(GBA.KEY[gbaKey]); }, { passive: false });
            button.addEventListener('touchend', (e) => { e.preventDefault(); gba.keypad.release(GBA.KEY[gbaKey]); }, { passive: false });
            button.addEventListener('touchcancel', () => { gba.keypad.release(GBA.KEY[gbaKey]); });
        }
    });

    // --- Initialisation ---
    populateRomSelector();
    showMessage('Checking BIOS…');
    ensureBios()
        .then(() => {
            showMessage('Select a game to begin.');
        })
        .catch((e) => {
            showMessage(e.message, true);
        });
};
