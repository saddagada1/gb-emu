import { sleep } from "../lib/utils";
import { Cartridge } from "./cartridge";
import { CPU } from "./cpu";
import { MMU } from "./mmu";
import { PPU } from "./ppu";
import { Timer } from "./timer";

export class Emulator {
  _running;
  _paused;

  _timer;
  _cartridge;
  _mmu;
  _cpu;
  _ppu;

  constructor() {
    this._running = false;
    this._paused = false;

    this._timer = new Timer();
    this._cartridge = new Cartridge();
    this._mmu = new MMU(this._timer, this._cartridge);
    this._cpu = new CPU(this._mmu, this._timer);
    this._ppu = new PPU(this._mmu);

    this._mmu.init(this._cpu, this._ppu);
    this._timer.init(this._cpu);
    this._cpu.init();
  }

  async load(rom: File) {
    try {
      await this._cartridge.load(rom);
    } catch (error) {
      console.log(error);
      throw new Error("Failed to load rom file.");
    }
  }

  // step(single: boolean) {
  //   return new Promise<void>((resolve, reject) => {
  //     setTimeout(() => {
  //       if (this._paused && !single) {
  //         sleep(10);
  //         resolve();
  //       } else {
  //         if (!this._cpu.step()) {
  //           reject(new Error("CPU Failure"));
  //         } else {
  //           resolve();
  //         }
  //       }
  //     }, 0);
  //   });
  // }

  frame() {
    this._ppu.drawDebug();
    for (let i = 0; i < 1000; i++) {
      if (!this._running) break;

      if (this._paused) {
        sleep(10);
        continue;
      }

      this._cpu.step();
    }
    requestAnimationFrame(this.frame.bind(this));
  }

  run() {
    this._cpu.reset();

    this._running = true;
    this._paused = false;
    this._timer._ticks = 0;

    this.frame();
  }
}
