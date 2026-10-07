import { createIcons, FolderOpen } from 'lucide';
import shell from './player.html?raw';
import playerLogicUrl from './assets/logic/player.js?url';
import './assets/styles/player.scss';
import runtimeUrl from './picoplayer.js?url';
import { decodeCartridge } from './cartridge.js';
import './assets/styles/index.scss';

createIcons({ icons: { FolderOpen } });

const player = document.querySelector('#player');
const cartridgeLabel = document.querySelector('#cartridge-label');
const openButton = document.querySelector('#open-cart');
const fileInput = document.querySelector('#cart-file');
const filename = document.querySelector('#filename');
const status = document.querySelector('#status');
const runtimePath = new URL(runtimeUrl, window.location.href).href;
const playerLogicPath = new URL(playerLogicUrl, window.location.href).href;
const playerDocument = new DOMParser().parseFromString(shell, 'text/html');
player.prepend(document.importNode(playerDocument.querySelector('#body'), true));
window.p8_runtime_url = runtimePath;
openButton.disabled = true;
const playerReady = new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = playerLogicPath;
  script.onload = () => {
    document.removeEventListener('DOMContentLoaded', window.p8_initialize);
    if (!window.Module) window.p8_initialize();
    document.querySelector('#p8_start_button').style.display = 'none';
    resolve();
  };
  script.onerror = () => reject(new Error('Could not load the PICO-8 player.'));
  document.body.appendChild(script);
});
let runtimeReady;

openButton.addEventListener('click', () => fileInput.click());

async function startPlayer(cartridge, file) {
  await playerReady;
  if (runtimeReady) {
    await runtimeReady;
    window.p8_create_audio_context();
    window._cartdat = cartridge;
    window._cartname = [file.name];
    window._cdpos = 0;
    window.codo_command = 6;
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error('Could not start the new game.'));
      }, 20000);
      function checkReady() {
        if (window.codo_command === 6 || !(window.pico8_state.frame_number > 0)) {
          window.requestAnimationFrame(checkReady);
          return;
        }
        window.clearTimeout(timeout);
        resolve();
      }
      checkReady();
    });
    return;
  }

  runtimeReady = new Promise((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      finish(new Error('This web export cannot run the selected cartridge.'));
    }, 20000);

    function finish(error) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (error) reject(error);
      else resolve();
    }

    window.Module.preRun = [() => {
      window._cartdat = cartridge;
      window._cartname = [file.name];
      window._cdpos = 0;
    }];
    window.Module.postRun = [() => {
      function checkReady() {
        if (settled) return;
        if (!(window.pico8_state.frame_number > 0)) {
          window.requestAnimationFrame(checkReady);
          return;
        }
        finish();
      }
      checkReady();
    }];
    window.Module.onAbort = () => finish(new Error('Could not start the PICO-8 runtime.'));
    try {
      window.p8_run_cart();
      window.p8_script.onerror = () => finish(new Error('Could not load the PICO-8 runtime.'));
    } catch {
      finish(new Error('The PICO-8 player is not available in this browser.'));
    }
  });
  await runtimeReady;
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  fileInput.value = '';
  if (!file) return;

  status.textContent = '';
  if (!/\.p8\.png$/i.test(file.name)) {
    status.textContent = /\.p8$/i.test(file.name)
      ? 'Text-based .p8 files are not supported yet. Select a .p8.png cartridge.'
      : 'Select a .p8.png cartridge.';
    return;
  }
  if (!file.size || file.size > 1024 * 1024) {
    status.textContent = 'The cartridge must be a non-empty file smaller than 1 MB.';
    return;
  }

  openButton.disabled = true;
  status.textContent = 'Loading...';
  const labelWasHidden = cartridgeLabel.hidden;
  try {
    const cartridge = decodeCartridge(new Uint8Array(await file.arrayBuffer()));
    cartridgeLabel.hidden = true;
    await startPlayer(cartridge, file);
    window.p8_give_focus();
    const playingLabel = document.createElement('span');
    playingLabel.className = 'playing-label';
    playingLabel.textContent = 'Playing: ';
    filename.replaceChildren(playingLabel, file.name.replace(/\.p8\.png$/i, ''));
    status.textContent = '';
  } catch (error) {
    cartridgeLabel.hidden = labelWasHidden;
    status.textContent = error.message;
  } finally {
    openButton.disabled = false;
  }
});

playerReady.then(() => {
  openButton.disabled = false;
}).catch(error => {
  status.textContent = error.message;
});