import { REGISTER } from "../lib/types";
import { instructionToString, sleep } from "../lib/utils";
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

  break = false;

  constructor() {
    this._running = false;
    this._paused = false;

    this._timer = new Timer();
    this._cartridge = new Cartridge();
    this._mmu = new MMU(this._timer, this._cartridge);
    this._cpu = new CPU(this._mmu, this._timer);
    this._ppu = new PPU(this._cpu, this._mmu, this._timer);

    this._mmu.init(this._cpu, this._ppu);
    this._timer.init(this._cpu, this._ppu);
    this._cpu.init();
  }

  getStatus() {
    return `PC: ${this._cpu._r.pc.toString(16)}, OPCODE: ${this._cpu._current_opcode.toString(
      16
    )}, ${instructionToString(this._cpu._current_instruction, this._cpu._fetched_data)}`;
  }

  getContext() {
    const context = {
      a: this._cpu._r.a.toString(16),
      f: this._cpu._r.f.toString(16),
      b: this._cpu._r.b.toString(16),
      c: this._cpu._r.c.toString(16),
      d: this._cpu._r.d.toString(16),
      e: this._cpu._r.e.toString(16),
      h: this._cpu._r.h.toString(16),
      l: this._cpu._r.l.toString(16),
      af: this._cpu.readRegister(REGISTER.AF).toString(16),
      bc: this._cpu.readRegister(REGISTER.BC).toString(16),
      de: this._cpu.readRegister(REGISTER.DE).toString(16),
      hl: this._cpu.readRegister(REGISTER.HL).toString(16),
      sp: this._cpu._r.sp.toString(16),
      flags: {
        c: this._cpu.getCFlag(),
        h: this._cpu.getHFlag(),
        n: this._cpu.getNFlag(),
        z: this._cpu.getZFlag(),
      },
    };
    return `A: ${context.a} F: ${context.f} B: ${context.b} C: ${context.c} D: ${context.d} E: ${context.e} H: ${context.h} L: ${context.l} AF: ${context.af} BC: ${context.bc} DE: ${context.de} HL: ${context.hl} SP: ${context.sp} FLAGS: [C: ${context.flags.c}, H: ${context.flags.h}, N: ${context.flags.n}, Z: ${context.flags.z}]`;
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
    this._cpu.step();
    this._ppu.draw(this.getStatus(), this.getContext());
  }

  stepOver() {
    this.break = false;
    this._ppu.draw(this.getStatus(), this.getContext());
    for (let i = 0; i < 1000; i++) {
      if (!this._cpu.stepOver()) {
        this.break = true;
        break;
      }
    }
    if (!this.break) {
      requestAnimationFrame(this.stepOver.bind(this));
    }
  }

  frame() {
    this._ppu.draw(this.getStatus(), this.getContext());
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
    this._running = true;
    this._paused = false;
    this._timer._ticks = 0;

    this.frame();
  }
}
