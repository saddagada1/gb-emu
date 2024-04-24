import { FRAME_RATE } from "../lib/constants";
import { INTERRUPT_TYPE } from "../lib/types";
import { sleep } from "../lib/utils";
import { CPU } from "./cpu";
import { PPU } from "./ppu";

export class Timer {
  _r;
  _ticks;
  _start_time;
  _frame_start;
  _frame_time;
  _frame_count;
  _fps;

  _cpu: CPU | null;
  _ppu: PPU | null;

  constructor() {
    this._r = {
      div: 0xac00,
      tima: 0,
      tma: 0,
      tac: 0,
    };
    this._start_time = new Date();
    this._frame_start = new Date();
    this._frame_time = new Date();
    this._frame_count = 0;
    this._fps = 0;
    this._ticks = 0;
    this._cpu = null;
    this._ppu = null;
  }

  init(cpu: CPU, ppu: PPU) {
    this._cpu = cpu;
    this._ppu = ppu;
  }

  handleInterrupt() {
    if (!this._cpu) {
      throw new Error("CPU Error: Timer is not connected to the CPU.");
    }

    this._cpu.requestInterrupt(INTERRUPT_TYPE.TIMER);
  }

  async calcFPS() {
    const frameDelta = this._start_time.getMilliseconds() - this._frame_time.getMilliseconds();
    if (frameDelta < FRAME_RATE) {
      await sleep(FRAME_RATE - frameDelta);
    }

    if (this._start_time.getMilliseconds() - this._frame_start.getMilliseconds() >= 1000) {
      this._fps = this._frame_count;
      this._frame_start = new Date();
      this._frame_count = 0;
    }

    this._frame_count += 1;
    this._frame_time = new Date();
  }

  cycle(val: number) {
    if (!this._ppu) {
      throw new Error("PPU Error: Timer is not connected to the PPU.");
    }

    for (let i = 0; i < val; i++) {
      for (let n = 0; n < 4; n++) {
        this._ticks += 1;
        this.tick();
        this._ppu.step();
      }
      this._ppu.dmaStep();
    }
  }

  tick() {
    const prev = this._r.div;
    this._r.div += 1;
    let update = false;

    switch (this._r.tac & 0b11) {
      case 0b00:
        update = !!(prev & (1 << 9) && !(this._r.div & (1 << 9)));
        break;

      case 0b01:
        update = !!(prev & (1 << 3) && !(this._r.div & (1 << 3)));
        break;

      case 0b10:
        update = !!(prev & (1 << 5) && !(this._r.div & (1 << 5)));
        break;

      case 0b11:
        update = !!(prev & (1 << 7) && !(this._r.div & (1 << 7)));
        break;
    }

    if (update && this._r.tac & (1 << 2)) {
      this._r.tima += 1;

      if (this._r.tima == 0xff) {
        this._r.tima = this._r.tma;
        this.handleInterrupt();
      }
    }
  }

  read(addr: number) {
    switch (addr) {
      case 0xff04:
        return this._r.div >> 8;
      case 0xff05:
        return this._r.tima;
      case 0xff06:
        return this._r.tma;
      case 0xff07:
        return this._r.tac;
      default:
        return 0;
    }
  }

  write(addr: number, val: number) {
    switch (addr) {
      case 0xff04:
        this._r.div = 0;
        return;
      case 0xff05:
        this._r.tima = val;
        return;
      case 0xff06:
        this._r.tma = val;
        return;
      case 0xff07:
        this._r.tac = val;
        return;
    }
  }
}
