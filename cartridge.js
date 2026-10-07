import { decode } from 'fast-png';

export function decodeCartridge(contents) {
  let image;
  try {
    image = decode(contents, { checkCrc: true });
  } catch {
    throw new Error('The file is not a valid PNG cartridge.');
  }

  if (image.width !== 160 || image.height !== 205 || image.depth !== 8 || image.channels !== 4) {
    throw new Error('A PICO-8 cartridge must be a 160 x 205 RGBA PNG.');
  }

  const cartridge = new Uint8Array(32768);
  for (let index = 0; index < cartridge.length; index++) {
    const offset = index * 4;
    cartridge[index] = ((image.data[offset + 3] & 3) << 6)
      | ((image.data[offset] & 3) << 4)
      | ((image.data[offset + 1] & 3) << 2)
      | (image.data[offset + 2] & 3);
  }
  return cartridge;
}