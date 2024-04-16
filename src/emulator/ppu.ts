import { HEIGHT, WIDTH } from "../lib/constants";
import { CPU } from "./cpu";

export class PPU {
  _cpu;

  _mode;
  _timer;

  _r;
  _vram;

  _canvas;
  _screen;

  constructor(cpu: CPU) {
    this._cpu = cpu;
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
    this._vram = [] as number[];
    this._canvas = (document.getElementById("screen")! as HTMLCanvasElement).getContext("2d")!;
    this._screen = {
      width: WIDTH,
      height: HEIGHT,
      data: new Uint8ClampedArray(WIDTH * HEIGHT * 4).fill(255),
      colorSpace: "display-p3" as PredefinedColorSpace,
    };

    this._canvas.putImageData(this._screen, 0, 0);
  }

  reset() {
    this._screen.data.fill(255);
    this._canvas.putImageData(this._screen, 0, 0);
  }

  init() {}

  step() {}
}
