import { sleep } from "../lib/utils";
import { Cartridge } from "./cartridge";
import { CPU } from "./cpu";
import { MMU } from "./mmu";

export class Emulator {
  _running;
  _paused;
  _ticks;

  _cartridge;
  _mmu;
  _cpu;

  constructor() {
    this._running = false;
    this._paused = false;
    this._ticks = 0;

    this._cartridge = new Cartridge();
    this._mmu = new MMU(this._cartridge);
    this._cpu = new CPU(this._mmu);
  }

  async load(rom: File) {
    try {
      await this._cartridge.load(rom);
    } catch (error) {
      console.log(error);
      throw new Error("Failed to load rom file.");
    }
  }

  step() {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (this._paused) {
          // If paused, wait and resolve immediately
          sleep(10);
          resolve();
        } else {
          if (!this._cpu.step()) {
            reject(new Error("CPU Failure"));
          } else {
            this._ticks += 1;
            resolve();
          }
        }
      }, 0); // Adjust the delay as needed
    });
  }

  async run() {
    this._cpu.init();

    this._running = true;
    this._paused = false;
    this._ticks = 0;

    while (this._running) {
      await this.step();
    }
  }

  get() {
    return {
      running: this._running,
      paused: this._paused,
      ticks: this._ticks,
    };
  }

  cycles() {}
}
