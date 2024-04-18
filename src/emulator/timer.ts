import { INTERRUPT_TYPE, REGISTER } from "../lib/types";
import { CPU } from "./cpu";

export class Timer {
  _r;
  _ticks;

  _cpu: CPU | null;

  constructor() {
    this._r = {
      div: 0xac00,
      tima: 0,
      tma: 0,
      tac: 0,
    };
    this._ticks = 0;
    this._cpu = null;
  }

  init(cpu: CPU) {
    this._cpu = cpu;
  }

  reset() {
    this._r.div = 0xac00;
  }

  handleInterrupt() {
    if (!this._cpu) {
      throw new Error("CPU Error: Timer is not connected to the CPU.");
    }

    this._cpu.writeRegister(REGISTER.I, this._cpu.readRegister(REGISTER.I) | INTERRUPT_TYPE.TIMER);
  }

  cycle(val: number) {
    const n = val * 4;

    for (let i = 0; i < n; i++) {
      this._ticks += 1;
      this.tick();
    }
  }

  tick() {
    const prev = this._r.div;
    this._r.div += 1;
    let update = false;

    switch (this._r.tac & 0x03) {
      case 0x00:
        update = !!(prev & (1 << 9) && !(this._r.div & (1 << 9)));
        break;

      case 0x01:
        update = !!(prev & (1 << 3) && !(this._r.div & (1 << 3)));
        break;

      case 0x02:
        update = !!(prev & (1 << 5) && !(this._r.div & (1 << 5)));
        break;

      case 0x03:
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
