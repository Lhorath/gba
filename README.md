# GBA web player (gbajs)

Browser-based Game Boy Advance emulator using **gbajs**, served behind PHP with a small JavaScript bridge. ROMs are listed from `roms.json`; the user picks a game and plays it on a canvas.

## Requirements

- A web server with PHP (for `index.php`) or static hosting if you adapt entry points.
- A **16 KB GBA BIOS** file at `bios/bios.bin` (not included; you must supply your own legally obtained dump). The app validates size and maps it at `0x00000000` as required by gbajs.
- ROM files referenced in `roms.json`.

## Setup

1. Place valid `.gba` ROMs and update `roms.json` with titles and paths.
2. Add `bios/bios.bin` (exactly 16384 bytes) next to the site root as documented in `app.js`.
3. Open the site via your web server and select a ROM.

## Repository layout

- `index.php` — entry page.
- `app.js` — emulator setup, BIOS loading, ROM loading.
- `gbajs-bridge.js` — integration helpers.
- `roms.json` — ROM manifest.

## License

See [LICENSE](LICENSE) (MIT).
