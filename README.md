# 𐂦 picassette 𐂦

A lightweight, local-first web loader and player for PICO-8 cartridges. Open a cartridge from your device and play it directly, with no account or upload required.

---

### Check it out at:

https://notbigmuzzy.github.io/picassette/

---

## Tech Stack

- **Vite + JavaScript** - application logic and build tooling
- **PICO-8 Web Runtime** - cartridge execution, rendering, and audio
- **fast-png** - PNG decoding and cartridge data extraction
- **Sass + Lucide** - styling and interface icons
- **vite-plugin-pwa** - installable app and offline caching

---

## Features

Load a **.p8.png cartridge** from your device and play it in the browser. Cartridge files are decoded locally, so your games stay on your device rather than being uploaded to a server.

Switch between cartridges without refreshing the page. The player reuses the running PICO-8 runtime to start the next game.

Install picassette as a **Progressive Web App** for a standalone player experience. Once the app has been cached, it can also be used offline with local cartridges.

Currently supports **.p8.png cartridges only**; text-based `.p8` files are not supported yet.

---

<img width="1422" height="796" alt="Screenshot_2026-10-08_00-14-28" src="https://github.com/user-attachments/assets/c73c7832-7b69-4b1b-bb85-464d00c9e9a1" />

---

## Disclaimer

picassette is an independent project and is not affiliated with, endorsed by, or sponsored by Lexaloffle Games or the official PICO-8 project. It is simply a convenient web loader for PICO-8 cartridges.

No games are included, hosted, or available for download here. You must provide your own cartridge files.

If you enjoy PICO-8, please consider [buying a copy](https://www.lexaloffle.com/pico-8.php) to support this incredible project and its creators.

---
