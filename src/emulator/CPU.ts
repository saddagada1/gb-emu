import { BitIndex, GeneralPurposeRegister } from "./types";
import { MMU } from "./MMU";
import { BitIndexToHex } from "./constants";

class CPU {
  _clock;
  _r;
  _halt;
  _stop;
  _map: Function[];
  _cbmap: Function[];
  _MMU;

  constructor() {
    this._clock = { m: 0, t: 0 };
    this._r = {
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
      h: 0,
      l: 0,
      f: 0,
      i: 0,
      r: 0,
      pc: 0,
      sp: 0,
      ime: 0,
      m: 0,
      t: 0,
    };
    this._halt = 0;
    this._stop = 0;
    this._map = [];
    this._cbmap = [];
    this._MMU = new MMU();
  }

  reset() {
    this._r.b = 0;
    this._r.a = 0;
    this._r.c = 0;
    this._r.d = 0;
    this._r.e = 0;
    this._r.h = 0;
    this._r.l = 0;
    this._r.f = 0;
    this._r.sp = 0;
    this._r.pc = 0;
    this._r.i = 0;
    this._r.r = 0;
    this._r.m = 0;
    this._r.t = 0;
    this._halt = 0;
    this._stop = 0;
    this._clock.m = 0;
    this._clock.t = 0;
    this._r.ime = 1;
  }

  //Helper Functions
  zeroOpF(i: number, op?: boolean) {
    this._r.f = 0;
    if (!(i & 255)) this._r.f |= BitIndexToHex[7];
    this._r.f |= op ? BitIndexToHex[6] : 0;
  }

  addF() {
    this.zeroOpF(this._r.a);
    if (this._r.a > 255) this._r.f |= BitIndexToHex[4];
    this._r.a &= 255;
  }

  subF() {
    this.zeroOpF(this._r.a, true);
    if (this._r.a < 0) this._r.f |= BitIndexToHex[4];
    this._r.a &= 255;
  }

  cpF(i: number) {
    this.zeroOpF(i, true);
    if (i < 0) this._r.f |= BitIndexToHex[4];
    i &= 255; //don't think i need this but just in case
  }

  rd_r({
    r,
    ci,
    co,
    dir,
  }: {
    r: Exclude<GeneralPurposeRegister, "f">;
    ci: number;
    co: number;
    dir: "l" | "r";
  }) {
    this._r[r] = dir === "l" ? this._r[r] << 1 : (this._r[r] >> 1) + ci;
    this._r[r] &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
  }

  MAPcb() {
    var i = this._MMU.rb(this._r.pc);
    this._r.pc++;
    this._r.pc &= 65535;
    if (this._cbmap[i]) this._cbmap[i]();
    else alert(i);
  }

  XX() {
    /*Undefined map entry*/
    let opc = this._r.pc - 1;
    alert("No instruction found for $" + opc.toString(16) + ", stopping.");
    this._stop = 1;
  }

  //Load Ops
  LDrr(from: Exclude<GeneralPurposeRegister, "f">, dest: Exclude<GeneralPurposeRegister, "f">) {
    this._r[from] = this._r[dest];
    this._r.m = 1;
    this._r.t = 4;
  }

  LDrn(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r[register] = this._MMU.rb(this._r.pc);
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  LDrHL(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r[register] = this._MMU.rb((this._r.h << 8) + this._r.l);
    this._r.m = 2;
    this._r.t = 8;
  }

  LDHLr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._MMU.wb((this._r.h << 8) + this._r.l, this._r[register]);
    this._r.m = 2;
    this._r.t = 8;
  }

  LDHLn() {
    this._MMU.wb((this._r.h << 8) + this._r.l, this._MMU.rb(this._r.pc));
    this._r.pc += 1;
    this._r.m = 3;
    this._r.t = 12;
  }

  LDA_BC() {
    this._r.a = this._MMU.rb((this._r.b << 8) + this._r.c);
    this._r.m = 2;
    this._r.t = 8;
  }

  LDA_DE() {
    this._r.a = this._MMU.rb((this._r.d << 8) + this._r.e);
    this._r.m = 2;
    this._r.t = 8;
  }

  LDAnn() {
    this._r.a = this._MMU.rb(this._MMU.rw(this._r.pc));
    this._r.pc += 2;
    this._r.m = 4;
    this._r.t = 16;
  }

  LDBC_A() {
    this._MMU.wb((this._r.b << 8) + this._r.c, this._r.a);
    this._r.m = 2;
    this._r.t = 8;
  }

  LDDE_A() {
    this._MMU.wb((this._r.d << 8) + this._r.e, this._r.a);
    this._r.m = 2;
    this._r.t = 8;
  }

  LDnnA() {
    this._MMU.wb(this._MMU.rw(this._r.pc), this._r.a);
    this._r.pc += 2;
    this._r.m = 4;
    this._r.t = 16;
  }

  LDA_FFn() {
    this._r.a = this._MMU.rb(0xff00 + this._MMU.rb(this._r.pc));
    this._r.pc += 1;
    this._r.m = 3;
    this._r.t = 12;
  }

  LDFFn_A() {
    this._MMU.wb(0xff00 + this._MMU.rb(this._r.pc), this._r.a);
    this._r.pc += 1;
    this._r.m = 3;
    this._r.t = 12;
  }

  LDA_FFC() {
    this._r.a = this._MMU.rb(0xff00 + this._r.c);
    this._r.m = 2;
    this._r.t = 8;
  }

  LDFFC_A() {
    this._MMU.wb(0xff00 + this._r.c, this._r.a);
    this._r.m = 2;
    this._r.t = 8;
  }

  LDHLI_A() {
    this._MMU.wb((this._r.h << 8) + this._r.l, this._r.a);
    this._r.l = (this._r.l + 1) & 255;
    if (!this._r.l) {
      this._r.h = (this._r.h + 1) & 255;
    }
    this._r.m = 2;
    this._r.t = 8;
  }

  LDA_HLI() {
    this._r.a = this._MMU.rb((this._r.h << 8) + this._r.l);
    this._r.l = (this._r.l + 1) & 255;
    if (!this._r.l) {
      this._r.h = (this._r.h + 1) & 255;
    }
    this._r.m = 2;
    this._r.t = 8;
  }

  LDHLD_A() {
    this._MMU.wb((this._r.h << 8) + this._r.l, this._r.a);
    this._r.l = (this._r.l - 1) & 255;
    if (this._r.l == 255) {
      this._r.h = (this._r.h - 1) & 255;
    }
    this._r.m = 2;
    this._r.t = 8;
  }

  LDA_HLD() {
    this._r.a = this._MMU.rb((this._r.h << 8) + this._r.l);
    this._r.l = (this._r.l - 1) & 255;
    if (this._r.l == 255) {
      this._r.h = (this._r.h - 1) & 255;
    }
    this._r.m = 2;
    this._r.t = 8;
  }

  //16 bit
  LDrr_nn(
    r1: Exclude<GeneralPurposeRegister, "a" & "f">,
    r2: Exclude<GeneralPurposeRegister, "a" & "f">
  ) {
    this._r[r2] = this._MMU.rb(this._r.pc);
    this._r[r1] = this._MMU.rb(this._r.pc + 1);
    this._r.pc += 2;
    this._r.m = 3;
    this._r.t = 12;
  }

  LDSP_nn() {
    this._r.sp = this._MMU.rw(this._r.pc);
    this._r.pc += 2;
    this._r.m = 3;
    this._r.t = 12;
  }

  LDSP_HL() {
    this._r.sp = (this._r.h << 8) + this._r.l;
    this._r.m = 2;
    this._r.t = 8;
  }

  PUSHrr(r1: GeneralPurposeRegister, r2: GeneralPurposeRegister) {
    this._r.sp--;
    this._MMU.wb(this._r.sp, this._r[r1]);
    this._r.sp--;
    this._MMU.wb(this._r.sp, this._r[r2]);
    this._r.m = 3;
    this._r.t = 12;
  }

  POPrr(r1: GeneralPurposeRegister, r2: GeneralPurposeRegister) {
    this._r[r2] = this._MMU.rb(this._r.sp);
    this._r.sp++;
    this._r[r1] = this._MMU.rb(this._r.sp);
    this._r.sp++;
    this._r.m = 3;
    this._r.t = 12;
  }

  //Arithmetic Ops
  ADDr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r.a += this._r[register];
    this.addF();
    this._r.m = 1;
    this._r.t = 4;
  }

  ADDn() {
    this._r.a += this._MMU.rb(this._r.pc);
    this.addF();
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  ADD_HL() {
    this._r.a += this._MMU.rb((this._r.h << 8) + this._r.l);
    this.addF();
    this._r.m = 2;
    this._r.t = 8;
  }

  ADCr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r.a += this._r[register];
    this._r.a += this._r.f & BitIndexToHex[4] ? 1 : 0;
    this.addF();
    this._r.m = 1;
    this._r.t = 4;
  }

  ADCn() {
    this._r.a += this._MMU.rb(this._r.pc);
    this._r.a += this._r.f & BitIndexToHex[4] ? 1 : 0;
    this.addF();
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  ADC_HL() {
    this._r.a += this._MMU.rb((this._r.h << 8) + this._r.l);
    this._r.a += this._r.f & BitIndexToHex[4] ? 1 : 0;
    this.addF();
    this._r.m = 2;
    this._r.t = 8;
  }

  SUBr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r.a -= this._r[register];
    this.subF();
    this._r.m = 1;
    this._r.t = 4;
  }

  SUBn() {
    this._r.a -= this._MMU.rb(this._r.pc);
    this.subF();
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  SUB_HL() {
    this._r.a -= this._MMU.rb((this._r.h << 8) + this._r.l);
    this.subF();
    this._r.m = 2;
    this._r.t = 8;
  }

  SBCr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r.a -= this._r[register];
    this._r.a -= this._r.f & BitIndexToHex[4] ? 1 : 0;
    this.subF();
    this._r.m = 1;
    this._r.t = 4;
  }

  SBCn() {
    this._r.a -= this._MMU.rb(this._r.pc);
    this._r.a -= this._r.f & BitIndexToHex[4] ? 1 : 0;
    this.subF();
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  SBC_HL() {
    this._r.a -= this._MMU.rb((this._r.h << 8) + this._r.l);
    this._r.a -= this._r.f & BitIndexToHex[4] ? 1 : 0;
    this.subF();
    this._r.m = 2;
    this._r.t = 8;
  }

  ANDr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r.a &= this._r[register];
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.m = 1;
    this._r.t = 4;
  }

  ANDn() {
    this._r.a &= this._MMU.rb(this._r.pc);
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  AND_HL() {
    this._r.a &= this._MMU.rb((this._r.h << 8) + this._r.l);
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.m = 2;
    this._r.t = 8;
  }

  XORr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r.a ^= this._r[register];
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.m = 1;
    this._r.t = 4;
  }

  XORn() {
    this._r.a ^= this._MMU.rb(this._r.pc);
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  XOR_HL() {
    this._r.a ^= this._MMU.rb((this._r.h << 8) + this._r.l);
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.m = 2;
    this._r.t = 8;
  }

  ORr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r.a |= this._r[register];
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.m = 1;
    this._r.t = 4;
  }

  ORn() {
    this._r.a |= this._MMU.rb(this._r.pc);
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  OR_HL() {
    this._r.a |= this._MMU.rb((this._r.h << 8) + this._r.l);
    this.zeroOpF(this._r.a);
    this._r.a &= 255;
    this._r.m = 2;
    this._r.t = 8;
  }

  CPr(register: Exclude<GeneralPurposeRegister, "f">) {
    let i = this._r.a - this._r[register];
    this.cpF(i);
    this._r.m = 1;
    this._r.t = 4;
  }

  CPn() {
    let i = this._r.a - this._MMU.rb(this._r.pc);
    this.cpF(i);
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
  }

  CP_HL() {
    let i = this._r.a - this._MMU.rb((this._r.h << 8) + this._r.l);
    this.cpF(i);
    this._r.m = 2;
    this._r.t = 8;
  }

  INCr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r[register] += 1;
    this.zeroOpF(this._r[register]);
    this._r[register] &= 255;
    this._r.m = 1;
    this._r.t = 4;
  }

  INC_HL() {
    let i = this._MMU.rb((this._r.h << 8) + this._r.l) + 1;
    this._MMU.wb((this._r.h << 8) + this._r.l, i);
    this.zeroOpF(i);
    i &= 255;
    this._r.m = 3;
    this._r.t = 12;
  }

  DECr(register: Exclude<GeneralPurposeRegister, "f">) {
    this._r[register] -= 1;
    this.zeroOpF(this._r[register]);
    this._r[register] &= 255;
    this._r.m = 1;
    this._r.t = 4;
  }

  DEC_HL() {
    let i = this._MMU.rb((this._r.h << 8) + this._r.l) - 1;
    this._MMU.wb((this._r.h << 8) + this._r.l, i);
    this.zeroOpF(i);
    i &= 255;
    this._r.m = 3;
    this._r.t = 12;
  }

  DAA() {
    if (this._r.f & BitIndexToHex[6]) {
      if (this._r.f & BitIndexToHex[4]) {
        this._r.a -= 0x60;
      }
      if (this._r.f & BitIndexToHex[5]) {
        this._r.a -= 0x06;
      }
    } else {
      if (this._r.f & BitIndexToHex[4] || (this._r.a & 0xff) > 0x99) {
        this._r.a += 0x60;
        this._r.f |= BitIndexToHex[4];
      }
      if (this._r.f & BitIndexToHex[5] || (this._r.a & 0x0f) > 0x09) {
        this._r.a += 0x06;
      }
    }

    this._r.f |= this._r.a == 0 ? BitIndexToHex[7] : 0;
    this._r.f = this._r.f & ~BitIndexToHex[5];
  }

  CPL() {
    this._r.a = ~this._r.a & 255;
    this.zeroOpF(this._r.a, true);
    this._r.m = 1;
    this._r.t = 4;
  }

  //16 bit
  ADD_HLrr(
    r1: Exclude<GeneralPurposeRegister, "a" & "f">,
    r2: Exclude<GeneralPurposeRegister, "a" & "f">
  ) {
    let hl = (this._r.h << 8) + this._r.l;
    hl += (this._r[r1] << 8) + this._r[r2];
    if (hl > 65535) this._r.f |= BitIndexToHex[4];
    else this._r.f &= ~BitIndexToHex[4];
    this._r.h = (hl >> 8) & 255;
    this._r.l = hl & 255;
    this._r.m = 3;
    this._r.t = 12;
  }

  ADDHL_SP() {
    let hl = (this._r.h << 8) + this._r.l;
    hl += this._r.sp;
    if (hl > 65535) this._r.f |= BitIndexToHex[4];
    else this._r.f &= ~BitIndexToHex[4];
    this._r.h = (hl >> 8) & 255;
    this._r.l = hl & 255;
    this._r.m = 3;
    this._r.t = 12;
  }

  INCrr(r1: Exclude<GeneralPurposeRegister, "f">, r2: Exclude<GeneralPurposeRegister, "f">) {
    this._r[r2] = (this._r[r2] + 1) & 255;
    if (!this._r[r2]) this._r[r1] = (this._r[r1] + 1) & 255;
    this._r.m = 1;
    this._r.t = 4;
  }

  INC_SP() {
    this._r.sp = (this._r.sp + 1) & 65535;
    this._r.m = 1;
    this._r.t = 4;
  }

  DECrr(r1: Exclude<GeneralPurposeRegister, "f">, r2: Exclude<GeneralPurposeRegister, "f">) {
    this._r[r2] = (this._r[r2] - 1) & 255;
    if (this._r[r2] == 255) this._r[r1] = (this._r[r1] - 1) & 255;
    this._r.m = 1;
    this._r.t = 4;
  }

  DEC_SP() {
    this._r.sp = (this._r.sp - 1) & 65535;
    this._r.m = 1;
    this._r.t = 4;
  }

  ADDSP_e() {
    let i = this._MMU.rb(this._r.pc);
    if (i > 127) i = -((~i + 1) & 255);
    this._r.pc += 1;
    this._r.sp += i;
    this._r.m = 4;
    this._r.t = 16;
  }

  LDHL_SPe() {
    let i = this._MMU.rb(this._r.pc);
    if (i > 127) i = -((~i + 1) & 255);
    this._r.pc += 1;
    i += this._r.sp;
    this._r.h = (i >> 8) & 255;
    this._r.l = i & 255;
    this._r.m = 3;
    this._r.t = 12;
  }

  //Rotate and Shift Ops
  RLCA() {
    let ci = this._r.a & BitIndexToHex[7] ? 1 : 0;
    let co = this._r.a & BitIndexToHex[7] ? BitIndexToHex[4] : 0;
    this.rd_r({ r: "a", ci, co, dir: "l" });
    this._r.m = 1;
    this._r.t = 4;
  }

  RLA() {
    let ci = this._r.f & BitIndexToHex[4] ? 1 : 0;
    let co = this._r.a & BitIndexToHex[7] ? BitIndexToHex[4] : 0;
    this.rd_r({ r: "a", ci, co, dir: "l" });
    this._r.m = 1;
    this._r.t = 4;
  }

  RRCA() {
    let ci = this._r.a & 1 ? BitIndexToHex[7] : 0;
    let co = this._r.a & 1 ? BitIndexToHex[4] : 0;
    this.rd_r({ r: "a", ci, co, dir: "r" });
    this._r.m = 1;
    this._r.t = 4;
  }

  RRA() {
    let ci = this._r.f & BitIndexToHex[4] ? BitIndexToHex[7] : 0;
    let co = this._r.a & 1 ? BitIndexToHex[4] : 0;
    this.rd_r({ r: "a", ci, co, dir: "r" });
    this._r.m = 1;
    this._r.t = 4;
  }

  RLCr(register: Exclude<GeneralPurposeRegister, "f">) {
    let ci = this._r[register] & BitIndexToHex[7] ? 1 : 0;
    let co = this._r[register] & BitIndexToHex[7] ? BitIndexToHex[4] : 0;
    this.rd_r({ r: register, ci, co, dir: "l" });
    this._r.m = 2;
    this._r.t = 8;
  }

  RLC_HL() {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    let ci = hl & BitIndexToHex[7] ? 1 : 0;
    let co = hl & BitIndexToHex[7] ? BitIndexToHex[4] : 0;
    hl = (hl << 1) + ci;
    hl &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  RLr(register: Exclude<GeneralPurposeRegister, "f">) {
    let ci = this._r.f & BitIndexToHex[4] ? 1 : 0;
    let co = this._r[register] & BitIndexToHex[7] ? BitIndexToHex[4] : 0;
    this.rd_r({ r: register, ci, co, dir: "l" });
    this._r.m = 2;
    this._r.t = 8;
  }

  RL_HL() {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    let ci = this._r.f & BitIndexToHex[4] ? 1 : 0;
    let co = hl & BitIndexToHex[7] ? BitIndexToHex[4] : 0;
    hl = (hl << 1) + ci;
    hl &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  RRCr(register: Exclude<GeneralPurposeRegister, "f">) {
    let ci = this._r[register] & 1 ? BitIndexToHex[7] : 0;
    let co = this._r[register] & 1 ? BitIndexToHex[4] : 0;
    this.rd_r({ r: register, ci, co, dir: "r" });
    this._r.m = 2;
    this._r.t = 8;
  }

  RRC_HL() {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    let ci = hl & 1 ? BitIndexToHex[7] : 0;
    let co = hl & 1 ? BitIndexToHex[4] : 0;
    hl = (hl >> 1) + ci;
    hl &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  RRr(register: Exclude<GeneralPurposeRegister, "f">) {
    let ci = this._r.f & BitIndexToHex[4] ? BitIndexToHex[7] : 0;
    let co = this._r[register] & 1 ? BitIndexToHex[4] : 0;
    this.rd_r({ r: register, ci, co, dir: "r" });
    this._r.m = 2;
    this._r.t = 8;
  }

  RR_HL() {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    let ci = this._r.f & BitIndexToHex[4] ? BitIndexToHex[7] : 0;
    let co = hl & 1 ? BitIndexToHex[4] : 0;
    hl = (hl >> 1) + ci;
    hl &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  SLAr(register: Exclude<GeneralPurposeRegister, "f">) {
    let co = this._r[register] & BitIndexToHex[7] ? BitIndexToHex[4] : 0;
    this._r[register] = this._r[register] << 1;
    this._r[register] &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._r.m = 2;
    this._r.t = 8;
  }

  SLA_HL() {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    let co = hl & BitIndexToHex[7] ? BitIndexToHex[4] : 0;
    hl = hl << 1;
    hl &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  SWAPr(register: Exclude<GeneralPurposeRegister, "f">) {
    let i = this._r[register];
    let ln = i & 0x0f;
    let hn = (i & 0xf0) >> 4;
    this._r[register] = (ln << 4) | hn;
    this._r.m = 4;
    this._r.t = 16;
  }

  SWAP_HL() {
    let i = this._MMU.rb((this._r.h << 8) + this._r.l);
    let ln = i & 0x0f;
    let hn = (i & 0xf0) >> 4;
    this._MMU.wb((this._r.h << 8) + this._r.l, (ln << 4) | hn);
    this._r.m = 4;
    this._r.t = 16;
  }

  SRAr(register: Exclude<GeneralPurposeRegister, "f">) {
    let ci = this._r[register] & BitIndexToHex[7];
    let co = this._r[register] & 1 ? BitIndexToHex[4] : 0;
    this._r[register] = this._r[register] >> 1;
    this._r[register] += ci;
    this._r[register] &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._r.m = 2;
    this._r.t = 8;
  }

  SRA_HL() {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    let ci = hl & BitIndexToHex[7];
    let co = hl & 1 ? BitIndexToHex[4] : 0;
    hl = hl >> 1;
    hl += ci;
    hl &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  SRLr(register: Exclude<GeneralPurposeRegister, "f">) {
    let co = this._r[register] & 1 ? BitIndexToHex[4] : 0;
    this._r[register] = this._r[register] >> 1;
    this._r[register] = this._r[register] & ~(1 << BitIndexToHex[7]);
    this._r[register] &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._r.m = 2;
    this._r.t = 8;
  }

  SRL_HL() {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    let co = hl & 1 ? BitIndexToHex[4] : 0;
    hl = hl >> 1;
    hl = hl & ~(1 << BitIndexToHex[7]);
    hl &= 255;
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + co;
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  //Bit Ops
  BITbr(i: BitIndex, register: Exclude<GeneralPurposeRegister, "f">) {
    this.zeroOpF(this._r[register] & BitIndexToHex[i]);
    this._r.m = 2;
    this._r.t = 8;
  }

  BITb_HL(i: BitIndex) {
    this.zeroOpF(this._MMU.rb((this._r.h << 8) + this._r.l) & BitIndexToHex[i]);
    this._r.m = 3;
    this._r.t = 12;
  }

  SETbr(i: BitIndex, register: Exclude<GeneralPurposeRegister, "f">) {
    this._r[register] |= 1 << BitIndexToHex[i];
    this.zeroOpF(this._r[register]);
    this._r.m = 2;
    this._r.t = 8;
  }

  SETb_HL(i: BitIndex) {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    hl |= 1 << BitIndexToHex[i];
    this.zeroOpF(hl);
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  RESbr(i: BitIndex, register: Exclude<GeneralPurposeRegister, "f">) {
    this._r[register] = this._r[register] & ~(1 << BitIndexToHex[i]);
    this.zeroOpF(this._r[register]);
    this._r.m = 4;
    this._r.t = 16;
  }

  RESb_HL(i: BitIndex) {
    let hl = this._MMU.rb((this._r.h << 8) + this._r.l);
    hl = hl & ~(1 << BitIndexToHex[i]);
    this.zeroOpF(hl);
    this._MMU.wb((this._r.h << 8) + this._r.l, hl);
    this._r.m = 4;
    this._r.t = 16;
  }

  //Control Ops
  // NEG() {
  //   this._r.a = 0 - this._r.a;
  //   this.zeroOpF(this._r.a, true);
  //   if (this._r.a < 0) this._r.f |= BitIndexToHex[4];
  //   this._r.a &= 255;
  //   this._r.m = 2;
  //   this._r.t = 8;
  // }

  CCF() {
    let ci = this._r.f & BitIndexToHex[4] ? 0 : BitIndexToHex[4];
    this._r.f = (this._r.f & ~BitIndexToHex[4]) + ci;
    this._r.m = 1;
    this._r.t = 4;
  }

  SCF() {
    this._r.f |= 0x10;
    this._r.m = 1;
    this._r.t = 4;
  }

  NOP() {
    this._r.m = 1;
    this._r.t = 4;
  }

  HALT() {
    this._halt = 1;
    this._r.m = 1;
    this._r.t = 4;
  }

  STOP() {
    this._stop = 1;
    this._r.m = 1;
    this._r.t = 4;
  }

  DI() {
    this._r.ime = 0;
    this._r.m = 1;
    this._r.t = 4;
  }

  EI() {
    this._r.ime = 1;
    this._r.m = 1;
    this._r.t = 4;
  }

  //Jump, Call and Return
  JPnn() {
    this._r.pc = this._MMU.rw(this._r.pc);
    this._r.m = 3;
    this._r.t = 12;
  }

  JP_HL() {
    this._r.pc = this._MMU.rb((this._r.h << 8) + this._r.l);
    this._r.m = 1;
    this._r.t = 4;
  }

  JPNZ_nn() {
    this._r.m = 3;
    this._r.t = 12;
    if ((this._r.f & BitIndexToHex[7]) == 0) {
      this._r.pc = this._MMU.rw(this._r.pc);
      this._r.m += 1;
      this._r.t += 4;
    } else {
      this._r.pc += 2;
    }
  }

  JPZ_nn() {
    this._r.m = 3;
    this._r.t = 12;
    if ((this._r.f & BitIndexToHex[7]) == BitIndexToHex[7]) {
      this._r.pc = this._MMU.rw(this._r.pc);
      this._r.m += 1;
      this._r.t += 4;
    } else {
      this._r.pc += 2;
    }
  }

  JPNC_nn() {
    this._r.m = 3;
    this._r.t = 12;
    if ((this._r.f & BitIndexToHex[4]) == 0) {
      this._r.pc = this._MMU.rw(this._r.pc);
      this._r.m += 1;
      this._r.t += 4;
    } else {
      this._r.pc += 2;
    }
  }

  JPC_nn() {
    this._r.m = 3;
    this._r.t = 12;
    if ((this._r.f & BitIndexToHex[4]) == BitIndexToHex[4]) {
      this._r.pc = this._MMU.rw(this._r.pc);
      this._r.m += 1;
      this._r.t += 4;
    } else {
      this._r.pc += 2;
    }
  }

  JRe() {
    let i = this._MMU.rb(this._r.pc);
    if (i > 127) i = -((~i + 1) & 255);
    this._r.pc += 1;
    this._r.pc += i;
    this._r.m = 3;
    this._r.t = 12;
  }

  JRNZ_e() {
    let i = this._MMU.rb(this._r.pc);
    if (i > 127) i = -((~i + 1) & 255);
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
    if ((this._r.f & BitIndexToHex[7]) == 0) {
      this._r.pc += i;
      this._r.m += 1;
      this._r.t += 4;
    } else {
      this._r.pc += 2;
    }
  }

  JRZ_e() {
    let i = this._MMU.rb(this._r.pc);
    if (i > 127) i = -((~i + 1) & 255);
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
    if ((this._r.f & BitIndexToHex[7]) == BitIndexToHex[7]) {
      this._r.pc += i;
      this._r.m += 1;
      this._r.t += 4;
    }
  }

  JRNC_e() {
    let i = this._MMU.rb(this._r.pc);
    if (i > 127) i = -((~i + 1) & 255);
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
    if ((this._r.f & BitIndexToHex[4]) == 0) {
      this._r.pc += i;
      this._r.m += 1;
      this._r.t += 4;
    } else {
      this._r.pc += 2;
    }
  }

  JRC_e() {
    let i = this._MMU.rb(this._r.pc);
    if (i > 127) i = -((~i + 1) & 255);
    this._r.pc += 1;
    this._r.m = 2;
    this._r.t = 8;
    if ((this._r.f & BitIndexToHex[4]) == BitIndexToHex[4]) {
      this._r.pc += i;
      this._r.m += 1;
      this._r.t += 4;
    }
  }

  // DJNZe() {
  //   let i = this._MMU.rb(this._r.pc);
  //   if (i > 127) i = -((~i + 1) & 255);
  //   this._r.pc += 1;
  //   this._r.m = 2;
  //   this._r.t = 8;
  //   this._r.b -= 1;
  //   if (this._r.b) {
  //     this._r.pc += i;
  //     this._r.m += 1;
  //     this._r.t += 4;
  //   }
  // }

  CALLnn() {
    this._r.sp -= 2;
    this._MMU.ww(this._r.sp, this._r.pc + 2);
    this._r.pc = this._MMU.rw(this._r.pc);
    this._r.m = 5;
    this._r.t = 20;
  }

  CALLNZ_nn() {
    this._r.m = 3;
    this._r.t = 12;
    if ((this._r.f & BitIndexToHex[7]) == 0) {
      this._r.sp -= 2;
      this._MMU.ww(this._r.sp, this._r.pc + 2);
      this._r.pc = this._MMU.rw(this._r.pc);
      this._r.m += 2;
      this._r.t += 8;
    } else {
      this._r.pc += 2;
    }
  }

  CALLZ_nn() {
    this._r.m = 3;
    this._r.t = 12;
    if ((this._r.f & BitIndexToHex[7]) == BitIndexToHex[7]) {
      this._r.sp -= 2;
      this._MMU.ww(this._r.sp, this._r.pc + 2);
      this._r.pc = this._MMU.rw(this._r.pc);
      this._r.m += 2;
      this._r.t += 8;
    } else {
      this._r.pc += 2;
    }
  }

  CALLNC_nn() {
    this._r.m = 3;
    this._r.t = 12;
    if ((this._r.f & BitIndexToHex[4]) == 0) {
      this._r.sp -= 2;
      this._MMU.ww(this._r.sp, this._r.pc + 2);
      this._r.pc = this._MMU.rw(this._r.pc);
      this._r.m += 2;
      this._r.t += 8;
    } else {
      this._r.pc += 2;
    }
  }

  CALLC_nn() {
    this._r.m = 3;
    this._r.t = 12;
    if ((this._r.f & BitIndexToHex[4]) == BitIndexToHex[4]) {
      this._r.sp -= 2;
      this._MMU.ww(this._r.sp, this._r.pc + 2);
      this._r.pc = this._MMU.rw(this._r.pc);
      this._r.m += 2;
      this._r.t += 8;
    } else {
      this._r.pc += 2;
    }
  }

  RET() {
    this._r.pc = this._MMU.rw(this._r.sp);
    this._r.sp += 2;
    this._r.m = 3;
    this._r.t = 12;
  }

  RETNZ() {
    this._r.m = 1;
    this._r.t = 4;
    if ((this._r.f & BitIndexToHex[7]) == 0) {
      this._r.pc = this._MMU.rw(this._r.sp);
      this._r.sp += 2;
      this._r.m += 2;
      this._r.t += 8;
    }
  }

  RETZ() {
    this._r.m = 1;
    this._r.t = 4;
    if ((this._r.f & BitIndexToHex[7]) == BitIndexToHex[7]) {
      this._r.pc = this._MMU.rw(this._r.sp);
      this._r.sp += 2;
      this._r.m += 2;
      this._r.t += 8;
    }
  }

  RETNC() {
    this._r.m = 1;
    this._r.t = 4;
    if ((this._r.f & BitIndexToHex[4]) == 0) {
      this._r.pc = this._MMU.rw(this._r.sp);
      this._r.sp += 2;
      this._r.m += 2;
      this._r.t += 8;
    }
  }

  RETC() {
    this._r.m = 1;
    this._r.t = 4;
    if ((this._r.f & BitIndexToHex[4]) == BitIndexToHex[4]) {
      this._r.pc = this._MMU.rw(this._r.sp);
      this._r.sp += 2;
      this._r.m += 2;
      this._r.t += 8;
    }
  }

  RETI() {
    this._r.ime = 1;
    this._r.pc = this._MMU.rw(this._r.sp);
    this._r.sp += 2;
    this._r.m = 3;
    this._r.t = 12;
  }

  RST_N(n: number) {
    this._r.sp -= 2;
    this._MMU.ww(this._r.sp, this._r.pc);
    this._r.pc = n;
    this._r.m = 3;
    this._r.t = 12;
  }
}
