import { createIcons, FolderOpen } from 'lucide';
import shell from './player.html?raw';
import playerLogicUrl from './assets/logic/player.js?url';
import playerStyles from './assets/styles/player.scss?inline';
import runtimeUrl from './picoplayer.js?url';
import { decodeCartridge } from './cartridge.js';
import './assets/styles/index.scss';

createIcons({ icons: { FolderOpen } });

const player = document.querySelector('#player');
const openButton = document.querySelector('#open-cart');
const fileInput = document.querySelector('#cart-file');
const filename = document.querySelector('#filename');
const status = document.querySelector('#status');
const runtimePath = new URL(runtimeUrl, window.location.href).href;
const playerLogicPath = new URL(playerLogicUrl, window.location.href).href;
const playerDocument = shell
  .replace('src="./assets/logic/player.js"', `src="${playerLogicPath}"`)
  .replace('<link rel="stylesheet" href="./assets/styles/player.scss">', `<style>${playerStyles}</style>`);

openButton.addEventListener('click', () => fileInput.click());

function startPlayer(cartridge, name) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      finish(new Error(cartridge ? 'Ovaj web export ne moze da pokrene izabrani cartridge.' : 'Player se nije pokrenuo.'));
      if (cartridge) startPlayer().catch(() => {});
    }, 20000);

    function finish(error) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      player.onload = null;
      if (error) reject(error);
      else resolve();
    }

    player.onload = () => {
      const frame = player.contentWindow;
      frame.p8_runtime_url = runtimePath;
      frame.Module.noInitialRun = !cartridge;
      if (cartridge) {
        frame.Module.preRun = [() => {
          frame._cartdat = cartridge;
          frame._cartname = [name];
          frame._cdpos = 0;
        }];
      }
      frame.Module.postRun = [() => {
        function checkReady() {
          if (settled) return;
          if (cartridge && !(frame.pico8_state.frame_number > 0)) {
            frame.requestAnimationFrame(checkReady);
            return;
          }
          if (cartridge) frame.focus();
          finish();
        }
        checkReady();
      }];
      frame.Module.onAbort = () => finish(new Error('PICO-8 runtime nije mogao da se pokrene.'));
      try {
        frame.p8_run_cart();
        frame.p8_script.onerror = () => finish(new Error('PICO-8 runtime nije mogao da se ucita.'));
      } catch {
        finish(new Error('PICO-8 player nije dostupan u ovom browseru.'));
      }
    };
    player.srcdoc = playerDocument;
  });
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  fileInput.value = '';
  if (!file) return;

  status.textContent = '';
  if (!/\.p8\.png$/i.test(file.name)) {
    status.textContent = /\.p8$/i.test(file.name)
      ? 'Tekstualni .p8 jos nije podrzan. Izaberi .p8.png cartridge.'
      : 'Izaberi .p8.png cartridge.';
    return;
  }
  if (!file.size || file.size > 1024 * 1024) {
    status.textContent = 'Cartridge mora biti neprazan fajl manji od 1 MB.';
    return;
  }

  openButton.disabled = true;
  status.textContent = 'Ucitavanje...';
  try {
    const cartridge = decodeCartridge(new Uint8Array(await file.arrayBuffer()));
    await startPlayer(cartridge, file.name);
    filename.textContent = file.name;
    status.textContent = '';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    openButton.disabled = false;
  }
});

startPlayer().catch(error => {
  status.textContent = error.message;
});