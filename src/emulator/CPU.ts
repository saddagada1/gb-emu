import { Instructions } from "../lib/constants";
import {
  ADDRESSING_MODE,
  Bit,
  CONDITION_TYPE,
  Context,
  Instruction,
  INSTRUCTION_TYPE,
  INTERRUPT_TYPE,
  REGISTER,
} from "../lib/types";
import { getBit, setBit } from "../lib/utils";
import { MMU } from "./mmu";
import { Timer } from "./timer";

export class CPU {
  _r;

  _fetched_data;
  _is_memory_destination;
  _memory_destination;
  _current_opcode;
  _current_instruction;
  _interrupt_me;
  _enabling_interrupt_me;
  _halted;

  _mmu;
  _timer;

  constructor(mmu: MMU, timer: Timer) {
    this._r = {
      a: 0,
      f: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
      h: 0,
      l: 0,
      sp: 0,
      pc: 0,
      ie: 0,
      i: 0,
    };
    this._fetched_data = 0;
    this._is_memory_destination = false;
    this._memory_destination = 0;
    this._current_opcode = 0;
    this._current_instruction = {} as Instruction;
    this._interrupt_me = false;
    this._enabling_interrupt_me = false;
    this._halted = false;
    this._mmu = mmu;
    this._timer = timer;
  }

  init() {
    this._r.pc = 0x100;
    this._r.sp = 0xfffe;
    this.writeRegister(REGISTER.AF, 0x01b0);
    this.writeRegister(REGISTER.BC, 0x0013);
    this.writeRegister(REGISTER.DE, 0x00d8);
    this.writeRegister(REGISTER.HL, 0x014d);
    this._timer._r.div = 0xabcc;
  }

  stackPush(val: number) {
    this._r.sp -= 1;
    this._mmu.write(this._r.sp, val);
  }

  stackPush16(val: number) {
    this.stackPush((val >> 8) & 0xff);
    this.stackPush(val & 0xff);
  }

  stackPop() {
    const val = this._mmu.read(this._r.sp);
    this._r.sp += 1;
    return val;
  }

  stackPop16() {
    const low = this.stackPop();
    const high = this.stackPop();
    return (high << 8) | low;
  }

  readRegister(r: REGISTER) {
    switch (r) {
      case REGISTER.A:
        return this._r.a;
      case REGISTER.F:
        return this._r.f;
      case REGISTER.B:
        return this._r.b;
      case REGISTER.C:
        return this._r.c;
      case REGISTER.D:
        return this._r.d;
      case REGISTER.E:
        return this._r.e;
      case REGISTER.H:
        return this._r.h;
      case REGISTER.L:
        return this._r.l;

      case REGISTER.AF:
        return (this._r.a << 8) | this._r.f;
      case REGISTER.BC:
        return (this._r.b << 8) | this._r.c;
      case REGISTER.DE:
        return (this._r.d << 8) | this._r.e;
      case REGISTER.HL:
        return (this._r.h << 8) | this._r.l;

      case REGISTER.SP:
        return this._r.sp;
      case REGISTER.PC:
        return this._r.pc;
      case REGISTER.IE:
        return this._r.ie;
      case REGISTER.I:
        return this._r.i;

      default:
        return 0;
    }
  }

  writeRegister(r: REGISTER, value: number) {
    switch (r) {
      case REGISTER.A:
        this._r.a = value & 0xff;
        return;
      case REGISTER.F:
        this._r.f = value & 0xff;
        return;
      case REGISTER.B:
        this._r.b = value & 0xff;
        return;
      case REGISTER.C:
        this._r.c = value & 0xff;
        return;
      case REGISTER.D:
        this._r.d = value & 0xff;
        return;
      case REGISTER.E:
        this._r.e = value & 0xff;
        return;
      case REGISTER.H:
        this._r.h = value & 0xff;
        return;
      case REGISTER.L:
        this._r.l = value & 0xff;
        return;

      case REGISTER.AF:
        this._r.a = (value >> 8) & 0xff;
        this._r.f = value & 0xff;
        return;
      case REGISTER.BC:
        this._r.b = (value >> 8) & 0xff;
        this._r.c = value & 0xff;
        return;
      case REGISTER.DE:
        this._r.d = (value >> 8) & 0xff;
        this._r.e = value & 0xff;
        return;
      case REGISTER.HL:
        this._r.h = (value >> 8) & 0xff;
        this._r.l = value & 0xff;
        return;

      case REGISTER.SP:
        this._r.sp = value;
        return;
      case REGISTER.PC:
        this._r.pc = value;
        return;
      case REGISTER.IE:
        this._r.ie = value;
        return;
      case REGISTER.I:
        this._r.i = value;
        return;

      default:
        return 0;
    }
  }

  readInstruction(i: INSTRUCTION_TYPE) {
    switch (i) {
      case INSTRUCTION_TYPE.NOP:
        return this.NOP.bind(this);
      case INSTRUCTION_TYPE.LD:
        return this.LD.bind(this);
      case INSTRUCTION_TYPE.LDH:
        return this.LDH.bind(this);
      case INSTRUCTION_TYPE.PUSH:
        return this.PUSH.bind(this);
      case INSTRUCTION_TYPE.POP:
        return this.POP.bind(this);
      case INSTRUCTION_TYPE.JP:
        return this.JP.bind(this);
      case INSTRUCTION_TYPE.JR:
        return this.JR.bind(this);
      case INSTRUCTION_TYPE.CALL:
        return this.CALL.bind(this);
      case INSTRUCTION_TYPE.RET:
        return this.RET.bind(this);
      case INSTRUCTION_TYPE.RETI:
        return this.RETI.bind(this);
      case INSTRUCTION_TYPE.RST:
        return this.RST.bind(this);
      case INSTRUCTION_TYPE.INC:
        return this.INC.bind(this);
      case INSTRUCTION_TYPE.DEC:
        return this.DEC.bind(this);
      case INSTRUCTION_TYPE.ADD:
        return this.ADD.bind(this);
      case INSTRUCTION_TYPE.ADC:
        return this.ADC.bind(this);
      case INSTRUCTION_TYPE.SUB:
        return this.SUB.bind(this);
      case INSTRUCTION_TYPE.SBC:
        return this.SBC.bind(this);
      case INSTRUCTION_TYPE.AND:
        return this.AND.bind(this);
      case INSTRUCTION_TYPE.OR:
        return this.OR.bind(this);
      case INSTRUCTION_TYPE.XOR:
        return this.XOR.bind(this);
      case INSTRUCTION_TYPE.CP:
        return this.CP.bind(this);
      case INSTRUCTION_TYPE.CB:
        return this.CB.bind(this);
      case INSTRUCTION_TYPE.RLCA:
        return this.RLCA.bind(this);
      case INSTRUCTION_TYPE.RRCA:
        return this.RRCA.bind(this);
      case INSTRUCTION_TYPE.RLA:
        return this.RLA.bind(this);
      case INSTRUCTION_TYPE.RRA:
        return this.RRA.bind(this);
      case INSTRUCTION_TYPE.DAA:
        return this.DAA.bind(this);
      case INSTRUCTION_TYPE.CPL:
        return this.CPL.bind(this);
      case INSTRUCTION_TYPE.SCF:
        return this.SCF.bind(this);
      case INSTRUCTION_TYPE.CCF:
        return this.CCF.bind(this);
      case INSTRUCTION_TYPE.EI:
        return this.EI.bind(this);
      case INSTRUCTION_TYPE.DI:
        return this.DI.bind(this);
      case INSTRUCTION_TYPE.HALT:
        return this.HALT.bind(this);
      case INSTRUCTION_TYPE.STOP:
        return this.STOP.bind(this);
      default:
        return this.NOP.bind(this);
    }
  }

  getCFlag() {
    return getBit({ n: this._r.f, bit: 4 });
  }

  getHFlag() {
    return getBit({ n: this._r.f, bit: 5 });
  }

  getNFlag() {
    return getBit({ n: this._r.f, bit: 6 });
  }

  getZFlag() {
    return getBit({ n: this._r.f, bit: 7 });
  }

  setFlags({ c, h, n, z }: { c?: Bit; h?: Bit; n?: Bit; z?: Bit }) {
    if (c !== undefined) this._r.f = setBit({ n: this._r.f, bit: 4, val: c });

    if (h !== undefined) this._r.f = setBit({ n: this._r.f, bit: 5, val: h });

    if (n !== undefined) this._r.f = setBit({ n: this._r.f, bit: 6, val: n });

    if (z !== undefined) this._r.f = setBit({ n: this._r.f, bit: 7, val: z });
  }

  checkRegister(id: number) {
    switch (id) {
      case 1:
        if (this._current_instruction.r1 === undefined) {
          throw Error("Fetch Error: Register 1 not supplied.");
        }
        return;
      case 2:
        if (this._current_instruction.r2 === undefined) {
          throw Error("Fetch Error: Register 2 not supplied.");
        }
        return;
      case 3:
        if (
          this._current_instruction.r1 === undefined ||
          this._current_instruction.r2 === undefined
        ) {
          throw Error("Fetch Error: No registers supplied.");
        }
        return;
      default:
        return;
    }
  }

  checkCondition() {
    const c = this.getCFlag();
    const z = this.getZFlag();

    switch (this._current_instruction.condition) {
      case CONDITION_TYPE.NONE:
        return true;
      case CONDITION_TYPE.C:
        return c === 1;
      case CONDITION_TYPE.Z:
        return z === 1;
      case CONDITION_TYPE.NC:
        return c === 0;
      case CONDITION_TYPE.NZ:
        return z === 0;
      default:
        return false;
    }
  }

  fetchInstruction() {
    this._current_opcode = this._mmu.read(this._r.pc);
    this._current_instruction = Instructions[this._current_opcode];
    this._r.pc += 1;
  }

  fetchData() {
    this._memory_destination = 0;
    this._is_memory_destination = false;

    switch (this._current_instruction.mode) {
      case ADDRESSING_MODE.IMP:
        return;

      case ADDRESSING_MODE.R:
        this.checkRegister(1);
        this._fetched_data = this.readRegister(this._current_instruction.r1!);
        return;

      case ADDRESSING_MODE.HL_SPR:
      case ADDRESSING_MODE.R_A8:
      case ADDRESSING_MODE.R_D8:
      case ADDRESSING_MODE.D8:
        this._fetched_data = this._mmu.read(this._r.pc);
        this._timer.cycle(1);
        this._r.pc += 1;
        return;

      case ADDRESSING_MODE.R_D16:
      case ADDRESSING_MODE.D16: {
        const low = this._mmu.read(this._r.pc);
        this._timer.cycle(1);
        const high = this._mmu.read(this._r.pc + 1);
        this._timer.cycle(1);
        this._fetched_data = (high << 8) | low;
        this._r.pc += 2;
        return;
      }

      case ADDRESSING_MODE.A16_R:
      case ADDRESSING_MODE.D16_R: {
        this.checkRegister(2);
        this._fetched_data = this.readRegister(this._current_instruction.r2!);
        const low = this._mmu.read(this._r.pc);
        this._timer.cycle(1);
        const high = this._mmu.read(this._r.pc + 1);
        this._timer.cycle(1);
        this._memory_destination = (high << 8) | low;
        this._is_memory_destination = true;
        this._r.pc += 2;
        return;
      }

      case ADDRESSING_MODE.R_HLI:
        this.checkRegister(2);
        this._fetched_data = this._mmu.read(this.readRegister(this._current_instruction.r2!));
        this._timer.cycle(1);
        this.writeRegister(
          this._current_instruction.r2!,
          this.readRegister(this._current_instruction.r2!) + 1
        );
        return;

      case ADDRESSING_MODE.R_HLD:
        this.checkRegister(2);
        this._fetched_data = this._mmu.read(this.readRegister(this._current_instruction.r2!));
        this._timer.cycle(1);
        this.writeRegister(
          this._current_instruction.r2!,
          this.readRegister(this._current_instruction.r2!) - 1
        );
        return;

      case ADDRESSING_MODE.HLI_R:
        this.checkRegister(3);
        this._fetched_data = this.readRegister(this._current_instruction.r2!);
        this._memory_destination = this._mmu.read(this.readRegister(this._current_instruction.r1!));
        this._is_memory_destination = true;
        this.writeRegister(
          this._current_instruction.r1!,
          this.readRegister(this._current_instruction.r1!) + 1
        );
        return;

      case ADDRESSING_MODE.HLD_R:
        this.checkRegister(3);
        this._fetched_data = this.readRegister(this._current_instruction.r2!);
        this._memory_destination = this._mmu.read(this.readRegister(this._current_instruction.r1!));
        this._is_memory_destination = true;
        this.writeRegister(
          this._current_instruction.r1!,
          this.readRegister(this._current_instruction.r1!) - 1
        );
        return;

      case ADDRESSING_MODE.R_R:
        this.checkRegister(2);
        this._fetched_data = this.readRegister(this._current_instruction.r2!);
        return;

      case ADDRESSING_MODE.R_A16: {
        const low = this._mmu.read(this._r.pc);
        this._timer.cycle(1);
        const high = this._mmu.read(this._r.pc + 1);
        this._timer.cycle(1);
        const address = (high << 8) | low;
        this._fetched_data = this._mmu.read(address);
        this._r.pc += 2;
        this._timer.cycle(1);
        return;
      }

      case ADDRESSING_MODE.A8_R: {
        this.checkRegister(2);
        this._fetched_data = this.readRegister(this._current_instruction.r2!);
        this._memory_destination = this._mmu.read(this._r.pc) | 0xff00;
        this._is_memory_destination = true;
        this._r.pc += 1;
        this._timer.cycle(1);
        return;
      }

      case ADDRESSING_MODE.MR:
        this.checkRegister(1);
        this._memory_destination = this.readRegister(this._current_instruction.r1!);
        this._is_memory_destination = true;
        this._timer.cycle(1);
        return;

      case ADDRESSING_MODE.MR_R:
        this.checkRegister(3);
        this._fetched_data = this.readRegister(this._current_instruction.r2!);
        this._memory_destination = this.readRegister(this._current_instruction.r1!);
        if (this._current_instruction.r1 === REGISTER.C) {
          this._memory_destination |= 0xff00;
        }
        this._is_memory_destination = true;
        return;

      case ADDRESSING_MODE.MR_D8:
        this.checkRegister(1);
        this._fetched_data = this._mmu.read(this._r.pc);
        this._timer.cycle(1);
        this._r.pc += 1;
        this._memory_destination = this.readRegister(this._current_instruction.r1!);
        this._is_memory_destination = true;
        return;

      case ADDRESSING_MODE.R_MR: {
        this.checkRegister(2);
        let address = this.readRegister(this._current_instruction.r2!);
        if (this._current_instruction.r2 === REGISTER.C) {
          address |= 0xff00;
        }
        this._fetched_data = this._mmu.read(address);
        this._timer.cycle(1);
        return;
      }

      default:
        return;
    }
  }

  execute() {
    const op = this.readInstruction(this._current_instruction.type);
    op();
  }

  step() {
    if (!this._halted) {
      try {
        this.fetchInstruction();
        this._timer.cycle(1);
        this.fetchData();
        this.execute();
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      this._timer.cycle(1);
      if (this._r.i) {
        this._halted = false;
      }
    }

    if (this._interrupt_me) {
      try {
        this.handleInterrupt();
      } catch (error) {
        console.log(error);
        return false;
      }
      this._enabling_interrupt_me = false;
    }

    if (this._enabling_interrupt_me) {
      this._interrupt_me = true;
    }

    return true;
  }

  stepOver(pc: number) {
    if (!this._halted) {
      try {
        if (this._r.pc === pc) {
          return false;
        }
        this.fetchInstruction();
        this._timer.cycle(1);
        this.fetchData();
        this.execute();
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      this._timer.cycle(1);
      if (this._r.i) {
        this._halted = false;
      }
    }

    if (this._interrupt_me) {
      try {
        this.handleInterrupt();
      } catch (error) {
        console.log(error);
        return false;
      }
      this._enabling_interrupt_me = false;
    }

    if (this._enabling_interrupt_me) {
      this._interrupt_me = true;
    }

    return true;
  }

  callInterrupt(addr: number, interrupt: INTERRUPT_TYPE) {
    this.stackPush16(this._r.pc);
    this.writeRegister(this._r.pc, addr);
    this.writeRegister(this._r.i, this._r.i & ~interrupt);
    this._halted = false;
    this._interrupt_me = false;
  }

  checkInterrupt(interrupt: INTERRUPT_TYPE) {
    if (this._r.i & interrupt && this._r.ie & interrupt) {
      return true;
    }
    return false;
  }

  handleInterrupt() {
    if (this.checkInterrupt(INTERRUPT_TYPE.VBLANK)) {
      this.callInterrupt(0x40, INTERRUPT_TYPE.VBLANK);
    } else if (this.checkInterrupt(INTERRUPT_TYPE.LCD_STAT)) {
      this.callInterrupt(0x48, INTERRUPT_TYPE.LCD_STAT);
    } else if (this.checkInterrupt(INTERRUPT_TYPE.TIMER)) {
      this.callInterrupt(0x50, INTERRUPT_TYPE.TIMER);
    } else if (this.checkInterrupt(INTERRUPT_TYPE.SERIAL)) {
      this.callInterrupt(0x58, INTERRUPT_TYPE.SERIAL);
    } else if (this.checkInterrupt(INTERRUPT_TYPE.JOYPAD)) {
      this.callInterrupt(0x60, INTERRUPT_TYPE.JOYPAD);
    }
  }

  requestInterrupt(type: INTERRUPT_TYPE) {
    this.writeRegister(REGISTER.I, this.readRegister(REGISTER.I) | type);
  }

  NOP() {
    return;
  }

  LD() {
    if (this._is_memory_destination) {
      if (this._current_instruction.r2! >= REGISTER.AF) {
        this._timer.cycle(1);
        this._mmu.write16(this._memory_destination, this._fetched_data);
      } else {
        this._mmu.write(this._memory_destination, this._fetched_data);
      }
      this._timer.cycle(1);
      return;
    }

    if (this._current_instruction.mode === ADDRESSING_MODE.HL_SPR) {
      const h =
        (this.readRegister(this._current_instruction.r2!) & 0xf) + (this._fetched_data & 0xf) >=
        0x10;

      const c =
        (this.readRegister(this._current_instruction.r2!) & 0xff) + (this._fetched_data & 0xff) >=
        0x100;

      this.setFlags({ c: c ? 1 : 0, h: h ? 1 : 0, n: 0, z: 0 });

      this.writeRegister(
        this._current_instruction.r1!,
        this.readRegister(this._current_instruction.r2!) + this._fetched_data
      );

      return;
    }

    this.writeRegister(this._current_instruction.r1!, this._fetched_data);
  }

  LDH() {
    if (this._current_instruction.r1 === REGISTER.A) {
      this.writeRegister(this._current_instruction.r1, this._mmu.read(0xff00 | this._fetched_data));
    } else {
      this._mmu.write(this._memory_destination, this._r.a);
    }
    this._timer.cycle(1);
  }

  PUSH() {
    const high = (this.readRegister(this._current_instruction.r1!) >> 8) & 0xff;
    this._timer.cycle(1);
    this.stackPush(high);
    const low = this.readRegister(this._current_instruction.r1!) & 0xff;
    this._timer.cycle(1);
    this.stackPush(low);
    this._timer.cycle(1);
  }

  POP() {
    const low = this.stackPop();
    this._timer.cycle(1);
    const high = this.stackPop();
    this._timer.cycle(1);
    const val = (high << 8) | low;
    if (this._current_instruction.r1 === REGISTER.AF) {
      this.writeRegister(this._current_instruction.r1, val & 0xfff0);
    } else {
      this.writeRegister(this._current_instruction.r1!, val);
    }
  }

  JP() {
    if (this.checkCondition()) {
      this._r.pc = this._fetched_data;
      this._timer.cycle(1);
    }
  }

  JR() {
    if (this.checkCondition()) {
      let rel = this._fetched_data & 0xff;
      rel -= (rel & 0x80) << 1;
      this._r.pc += rel;
      this._timer.cycle(1);
    }
  }

  CALL() {
    if (this.checkCondition()) {
      this.stackPush16(this._r.pc);
      this._timer.cycle(2);
      this._r.pc = this._fetched_data;
      this._timer.cycle(1);
    }
  }

  RET() {
    if (this._current_instruction.condition !== CONDITION_TYPE.NONE) {
      this._timer.cycle(1);
    }

    if (this.checkCondition()) {
      const low = this.stackPop();
      this._timer.cycle(1);
      const high = this.stackPop();
      this._timer.cycle(1);
      const val = (high << 8) | low;
      this._r.pc = val;
      this._timer.cycle(1);
    }
  }

  RETI() {
    this._interrupt_me = true;
    this.RET();
  }

  RST() {
    if (this._current_instruction.param === undefined) {
      throw Error("Execution Error: No parameter supplied.");
    }
    if (this.checkCondition()) {
      this.stackPush16(this._r.pc);
      this._timer.cycle(2);
      this._r.pc = this._current_instruction.param;
      this._timer.cycle(1);
    }
  }

  INC() {
    let val = this.readRegister(this._current_instruction.r1!) + 1;

    if (this._current_instruction.r1! >= REGISTER.AF) {
      this._timer.cycle(1);
    }

    if (
      this._current_instruction.r1 === REGISTER.HL &&
      this._current_instruction.mode === ADDRESSING_MODE.MR
    ) {
      val = this._mmu.read(this.readRegister(REGISTER.HL)) + 1;
      val &= 0xff;
      this._mmu.write(this.readRegister(REGISTER.HL), val);
    } else {
      this.writeRegister(this._current_instruction.r1!, val);
      val = this.readRegister(this._current_instruction.r1!);
    }

    if ((this._current_opcode & 0x03) === 0x03) return;

    this.setFlags({ h: (val & 0x0f) === 0 ? 1 : 0, n: 0, z: val === 0 ? 1 : 0 });
  }

  DEC() {
    let val = this.readRegister(this._current_instruction.r1!) - 1;

    if (this._current_instruction.r1! >= REGISTER.AF) {
      this._timer.cycle(1);
    }

    if (
      this._current_instruction.r1 === REGISTER.HL &&
      this._current_instruction.mode === ADDRESSING_MODE.MR
    ) {
      val = this._mmu.read(this.readRegister(REGISTER.HL)) - 1;
      this._mmu.write(this.readRegister(REGISTER.HL), val);
    } else {
      this.writeRegister(this._current_instruction.r1!, val);
      val = this.readRegister(this._current_instruction.r1!);
    }

    if ((this._current_opcode & 0x0b) === 0x0b) return;

    this.setFlags({ h: (val & 0x0f) === 0x0f ? 1 : 0, n: 1, z: val === 0 ? 1 : 0 });
  }

  ADD() {
    const r1 = this.readRegister(this._current_instruction.r1!);
    const i = this._fetched_data;
    const val = r1 + i;

    let z: null | boolean = (val & 0xff) === 0;
    let h = (r1 & 0xf) + (i & 0xf) >= 0x10;
    let c = (r1 & 0xff) + (i & 0xff) >= 0x100;

    const is16bit = this._current_instruction.r1! >= REGISTER.AF;

    if (this._current_instruction.r1 === REGISTER.SP) {
      this._timer.cycle(1);
      z = false;
    } else if (is16bit) {
      this._timer.cycle(1);
      z = null;
      h = (r1 & 0xfff) + (i & 0xfff) >= 0x1000;
      c = r1 + i >= 0x10000;
    }

    this.writeRegister(this._current_instruction.r1!, val & 0xffff);
    this.setFlags({ c: c ? 1 : 0, h: h ? 1 : 0, n: 0, z: z === null ? undefined : !!z ? 1 : 0 });
  }

  ADC() {
    const r1 = this.readRegister(this._current_instruction.r1!);
    const i = this._fetched_data;
    const c = this.getCFlag();
    const val = r1 + i + c;
    this.writeRegister(this._current_instruction.r1!, val & 0xff);
    this.setFlags({
      c: val > 0xff ? 1 : 0,
      h: (r1 & 0xf) + (i & 0xf) + c > 0xf ? 1 : 0,
      n: 0,
      z: (val & 0xff) === 0 ? 1 : 0,
    });
  }

  SUB() {
    const r1 = this.readRegister(this._current_instruction.r1!);
    const i = this._fetched_data;
    const val = r1 - i;
    this.setFlags({
      c: val < 0 ? 1 : 0,
      h: (r1 & 0xf) + (i & 0xf) < 0 ? 1 : 0,
      n: 1,
      z: val === 0 ? 1 : 0,
    });
    this.writeRegister(this._current_instruction.r1!, val);
  }

  SBC() {
    const r1 = this.readRegister(this._current_instruction.r1!);
    const i = this._fetched_data;
    const c = this.getCFlag();
    const val = r1 - i + c;
    this.setFlags({
      c: val < 0 ? 1 : 0,
      h: (r1 & 0xf) - (i & 0xf) - c < 0 ? 1 : 0,
      n: 1,
      z: val === 0 ? 1 : 0,
    });
    this.writeRegister(this._current_instruction.r1!, val);
  }

  AND() {
    const val = this.readRegister(this._current_instruction.r1!) & this._fetched_data;
    this.writeRegister(this._current_instruction.r1!, val);
    this.setFlags({
      c: 0,
      h: 1,
      n: 0,
      z: val === 0 ? 1 : 0,
    });
  }

  OR() {
    const val = this.readRegister(this._current_instruction.r1!) | (this._fetched_data & 0xff);
    this.writeRegister(this._current_instruction.r1!, val);
    this.setFlags({
      c: 0,
      h: 0,
      n: 0,
      z: val === 0 ? 1 : 0,
    });
  }

  XOR() {
    const val = this.readRegister(this._current_instruction.r1!) ^ (this._fetched_data & 0xff);
    this.writeRegister(this._current_instruction.r1!, val);
    this.setFlags({
      c: 0,
      h: 0,
      n: 0,
      z: val === 0 ? 1 : 0,
    });
  }

  CP() {
    const r1 = this.readRegister(this._current_instruction.r1!);
    const i = this._fetched_data;
    const val = r1 - i;
    this.setFlags({
      c: val < 0 ? 1 : 0,
      h: (r1 & 0x0f) - (i & 0x0f) < 0 ? 1 : 0,
      n: 1,
      z: val === 0 ? 1 : 0,
    });
  }

  CB() {
    const registers = [
      REGISTER.B,
      REGISTER.C,
      REGISTER.D,
      REGISTER.E,
      REGISTER.H,
      REGISTER.L,
      REGISTER.HL,
      REGISTER.A,
    ];
    const opcode = this._fetched_data;
    const reg = registers[opcode & 0b111];
    const bit = (opcode >> 3) & 0b111;
    const op = (opcode >> 6) & 0b11;

    let val = this.readRegister(reg);

    this._timer.cycle(1);

    if (reg === REGISTER.HL) {
      this._timer.cycle(2);
      val = this._mmu.read(val);
    }

    switch (op) {
      case 1:
        //BIT
        this.setFlags({
          h: 1,
          n: 0,
          z: !(val & (1 << bit)) ? 1 : 0,
        });
        return;
      case 2:
        //RES
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), setBit({ n: val, bit, val: 0 }));
        } else {
          this.writeRegister(reg, setBit({ n: val, bit, val: 0 }));
        }
        return;
      case 3:
        //SET
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), setBit({ n: val, bit, val: 1 }));
        } else {
          this.writeRegister(reg, setBit({ n: val, bit, val: 1 }));
        }
        return;
    }

    switch (bit) {
      case 0: {
        //RLC
        let c: Bit = 0;
        let result = (val << 1) & 0xff;
        if (!!getBit({ n: val, bit: 7 })) {
          result |= 1;
          c = 1;
        }
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), result);
        } else {
          this.writeRegister(reg, result);
        }
        this.setFlags({ c, h: 0, n: 0, z: result === 0 ? 1 : 0 });
        return;
      }
      case 1: {
        //RRC
        let result = val >> 1;
        result |= val << 7;
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), result);
        } else {
          this.writeRegister(reg, result);
        }
        this.setFlags({ c: val & 1 ? 1 : 0, h: 0, n: 0, z: result === 0 ? 1 : 0 });
        return;
      }
      case 2: {
        //RL
        let result = val << 1;
        result |= this.getCFlag();
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), result);
        } else {
          this.writeRegister(reg, result);
        }
        this.setFlags({ c: !!(val & 0x80) ? 1 : 0, h: 0, n: 0, z: result === 0 ? 1 : 0 });
        return;
      }
      case 3: {
        //RR
        let result = val >> 1;
        result |= this.getCFlag() << 7;
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), result);
        } else {
          this.writeRegister(reg, result);
        }
        this.setFlags({ c: val & 1 ? 1 : 0, h: 0, n: 0, z: result === 0 ? 1 : 0 });
        return;
      }
      case 4: {
        //SLA
        let result = val << 1;
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), result);
        } else {
          this.writeRegister(reg, result);
        }
        this.setFlags({ c: !!(val & 0x80) ? 1 : 0, h: 0, n: 0, z: result === 0 ? 1 : 0 });
        return;
      }
      case 5: {
        //SRA
        let result = val >> 1;
        result = (result & 0x80) << 1;
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), result);
        } else {
          this.writeRegister(reg, result);
        }
        this.setFlags({ c: val & 1 ? 1 : 0, h: 0, n: 0, z: result === 0 ? 1 : 0 });
        return;
      }
      case 6: {
        //SWAP
        let result = ((val & 0xf0) >> 4) | ((val & 0xf) << 4);
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), result);
        } else {
          this.writeRegister(reg, result);
        }
        this.setFlags({ c: 0, h: 0, n: 0, z: result === 0 ? 1 : 0 });
        return;
      }
      case 7: {
        //SRL
        let result = val >> 1;
        if (reg === REGISTER.HL) {
          this._mmu.write(this.readRegister(reg), result);
        } else {
          this.writeRegister(reg, result);
        }
        this.setFlags({ c: val & 1 ? 1 : 0, h: 0, n: 0, z: result === 0 ? 1 : 0 });
        return;
      }
      default:
        //No Implementation
        return;
    }
  }

  RLCA() {
    const c = (this._r.a >> 7) & 1;
    const result = (this._r.a << 1) | c;
    this.writeRegister(this._r.a, result);
    this.setFlags({ c: c ? 1 : 0, h: 0, n: 0, z: 0 });
  }

  RRCA() {
    const c = this._r.a & 1;
    let result = this._r.a >> 1;
    result |= c << 7;
    this.writeRegister(this._r.a, result);
    this.setFlags({ c: c ? 1 : 0, h: 0, n: 0, z: 0 });
  }

  RLA() {
    const c = (this._r.a >> 7) & 1;
    const result = (this._r.a << 1) | this.getCFlag();
    this.writeRegister(this._r.a, result);
    this.setFlags({ c: c ? 1 : 0, h: 0, n: 0, z: 0 });
  }

  RRA() {
    const c = this._r.a & 1;
    let result = this._r.a >> 1;
    result |= this.getCFlag() << 7;
    this.writeRegister(this._r.a, result);
    this.setFlags({ c: c ? 1 : 0, h: 0, n: 0, z: 0 });
  }

  DAA() {
    let result = 0;
    let c: Bit = 0;
    if (this.getHFlag() || (!this.getNFlag && (this._r.a & 0xf) > 0x09)) {
      result = 0x06;
    }
    if (this.getCFlag() || (!this.getNFlag && this._r.a > 0x99)) {
      result |= 0x60;
      c = 1;
    }
    result = this._r.a + (this.getNFlag() ? -result : result);
    this.writeRegister(REGISTER.A, result);
    this.setFlags({ c, h: 0, z: result === 0 ? 1 : 0 });
  }

  CPL() {
    this.writeRegister(REGISTER.A, ~this._r.a);
    this.setFlags({ h: 1, n: 1 });
  }

  SCF() {
    this.setFlags({ c: 1, h: 0, n: 0 });
  }

  CCF() {
    this.setFlags({ c: this.getCFlag() ^ 1 ? 1 : 0, h: 0, n: 0 });
  }

  EI() {
    this._enabling_interrupt_me = true;
  }

  DI() {
    this._interrupt_me = false;
  }

  HALT() {
    this._halted = true;
  }

  STOP() {}
}
