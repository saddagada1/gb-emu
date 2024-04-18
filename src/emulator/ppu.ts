import {
  debugScreenHeight,
  debugScreenWidth,
  HEIGHT,
  Pallette,
  SCALE,
  WIDTH,
} from "../lib/constants";
import { getBit } from "../lib/utils";
import { MMU } from "./mmu";

export class PPU {
  _mode;
  _timer;

  _r;
  _oam_ram;
  _vram;

  _canvas;
  // _debug_screen;
  // _screen;

  _mmu;

  constructor(mmu: MMU) {
    this._mode = 0;
    this._timer = 0;
    this._r = {
      lcdc: 0,
      dma: 0,
      stat: 0,
      ly: 0,
      lyc: 0,
      bgp: 0,
      obp0: 0,
      obp1: 0,
      scx: 0,
      scy: 0,
      wx: 0,
      wy: 0,
    };
    this._oam_ram = new Uint8Array(0x160);
    this._vram = new Uint8Array(0x2000);

    const canvas = document.querySelector(".screen")! as HTMLCanvasElement;
    this._canvas = (document.querySelector(".screen")! as HTMLCanvasElement).getContext("2d")!;

    // this._canvas.fillRect(0, 0, canvas.width, canvas.height);
    // this._canvas.fillStyle = "#c6c6c6";
    // this._debug_screen = {
    //   width: debugScreenWidth,
    //   height: debugScreenHeight,
    //   data: new Uint8ClampedArray(debugScreenWidth * debugScreenHeight * 4).fill(0),
    //   colorSpace: "display-p3" as PredefinedColorSpace,
    // };
    // this._screen = {
    //   width: WIDTH,
    //   height: HEIGHT,
    //   data: new Uint8ClampedArray(WIDTH * HEIGHT * 4).fill(255),
    //   colorSpace: "display-p3" as PredefinedColorSpace,
    // };

    this._mmu = mmu;

    // this._canvas.putImageData(this._debug_screen, 0, 0);
  }

  reset() {
    // this._screen.data.fill(255);
    // this._canvas.putImageData(this._screen, 0, 0);
  }

  oamRead(addr: number) {
    if (addr >= 0xfe00) {
      addr -= 0xfe00;
    }
    return this._oam_ram[addr];
  }

  oamWrite(addr: number, val: number) {
    if (addr >= 0xfe00) {
      addr -= 0xfe00;
    }

    this._oam_ram[addr] = val;
  }

  vramRead(addr: number) {
    return this._vram[addr - 0x8000];
  }

  vramWrite(addr: number, val: number) {
    this._vram[addr - 0x8000] = val;
  }

  drawTile(index: number, xPos: number, yPos: number) {
    for (let pxY = 0; pxY < 16; pxY += 2) {
      const byte1 = this._mmu.read(0x8000 + index * 16 + pxY);
      const byte2 = this._mmu.read(0x8000 + index * 16 + pxY + 1);

      for (let bit = 7; bit >= 0; bit--) {
        const high = getBit({ n: byte1, bit }) << 1;
        const low = getBit({ n: byte2, bit });

        const colour = Pallette[high];

        const x = xPos + (7 - bit) * SCALE;
        const y = yPos + (pxY / 2) * SCALE;

        this._canvas.fillStyle = colour;

        this._canvas.fillRect(x, y, SCALE, SCALE);
        this._canvas.strokeRect(x, y, 0.0001, 0.0001);
      }
    }
  }

  drawDebug() {
    let xPos = 0;
    let yPos = 0;
    let tileIndex = 0;

    //384 Tiles, 16 x 24
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 16; x++) {
        this.drawTile(tileIndex, xPos + x * SCALE, yPos + y * SCALE);
        xPos += 8 * SCALE;
        tileIndex += 1;
      }
      yPos += 8 * SCALE;
      xPos = 0;
    }
  }

  init() {}

  step() {}
}
