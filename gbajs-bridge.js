/**
 * Bridges stock endrift gbajs (GameBoyAdvance) to the API expected by app.js:
 * GBA constructor alias, GBA.KEY, loadRom, keypad press/release, exportSave/importSave.
 * Also disables gbajs's built-in window keyboard handlers so only app.js drives input.
 */
(function () {
    if (typeof GameBoyAdvance === 'undefined' || typeof GameBoyAdvanceKeypad === 'undefined') {
        console.error('gbajs-bridge: load gbajs (GameBoyAdvance / GameBoyAdvanceKeypad) before this file.');
        return;
    }

    var KP = GameBoyAdvanceKeypad.prototype;

    KP.registerHandlers = function () {};

    KP.press = function (key) {
        var toggle = 1 << key;
        this.currentDown &= ~toggle;
    };

    KP.release = function (key) {
        var toggle = 1 << key;
        this.currentDown |= toggle;
    };

    GameBoyAdvance.prototype.loadRom = GameBoyAdvance.prototype.setRom;

    GameBoyAdvance.prototype.exportSave = function () {
        var save = this.mmu.save;
        if (!save || !save.buffer) {
            return null;
        }
        return save.buffer.slice(0);
    };

    GameBoyAdvance.prototype.importSave = function (data) {
        if (!data || !this.rom) {
            return false;
        }
        if (!(data instanceof ArrayBuffer)) {
            return false;
        }
        try {
            this.setSavedata(data);
            return true;
        } catch (err) {
            return false;
        }
    };

    window.GBA = GameBoyAdvance;

    GBA.KEY = {
        A: 0,
        B: 1,
        SELECT: 2,
        START: 3,
        RIGHT: 4,
        LEFT: 5,
        UP: 6,
        DOWN: 7,
        R: 8,
        L: 9
    };
})();
