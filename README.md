# GBA Web Player

> Browser-based Game Boy Advance emulator using **gbajs**, served behind PHP with a JavaScript bridge. Select a game from a ROM manifest and play it on a canvas.

## Requirements

- A web server with PHP (for `index.php`), or static hosting if you adapt the entry point.
- A **16 KB GBA BIOS** file at `bios/bios.bin` (not included — you must supply your own legally obtained dump). The app validates the size and maps it at `0x00000000` as required by gbajs.
- ROM files referenced in `roms.json`.

## Setup

1. Place valid `.gba` ROM files in the project and update `roms.json` with titles and paths.
2. Add `bios/bios.bin` (exactly 16,384 bytes) next to the site root as documented in `app.js`.
3. Open the site via your web server and select a ROM to play.

## Project Layout

| File | Role |
|------|------|
| `index.php` | Entry page |
| `app.js` | Emulator setup, BIOS loading, ROM loading |
| `gbajs-bridge.js` | Integration helpers |
| `roms.json` | ROM manifest (titles and paths) |

## License

MIT — see [LICENSE](LICENSE).  
Copyright © 2026 [MacWeb Canada](https://macweb.ca) | Professional Online Solutions.
