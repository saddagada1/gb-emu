import { Cartridge } from "./cartridge";

// 0x0000 - 0x3FFF : ROM Bank 0
// 0x4000 - 0x7FFF : ROM Bank 1 - Switchable
// 0x8000 - 0x97FF : CHR RAM
// 0x9800 - 0x9BFF : BG Map 1
// 0x9C00 - 0x9FFF : BG Map 2
// 0xA000 - 0xBFFF : Cartridge RAM
// 0xC000 - 0xCFFF : RAM Bank 0
// 0xD000 - 0xDFFF : RAM Bank 1-7 - switchable - Color only
// 0xE000 - 0xFDFF : Reserved - Echo RAM
// 0xFE00 - 0xFE9F : Object Attribute Memory
// 0xFEA0 - 0xFEFF : Reserved - Unusable
// 0xFF00 - 0xFF7F : I/O Registers
// 0xFF80 - 0xFFFE : Zero Page

export class MMU {
  _wram;
  _hram;
  _cartridge;

  constructor(cartridge: Cartridge) {
    this._wram = new Uint8Array(0x2000);
    this._hram = new Uint8Array(0x80);
    this._cartridge = cartridge;
  }

  wramRead(addr: number) {
    addr -= 0xc000;

    if (addr >= 0x2000) {
      console.log("Invalid WRAM Address:", addr);
      throw new Error("Invalid WRAM Address");
    }

    return this._wram[addr];
  }

  wramWrite(addr: number, val: number) {
    addr -= 0xc000;
    this._wram[addr] = val;
  }

  hramRead(addr: number) {
    addr -= 0xff80;

    if (addr >= 0x80) {
      console.log("Invalid HRAM Address:", addr);
      throw new Error("Invalid HRAM Address");
    }

    return this._hram[addr];
  }

  hramWrite(addr: number, val: number) {
    addr -= 0xff80;
    this._hram[addr] = val;
  }

  read(addr: number): number {
    if (addr < 0x8000) {
      //ROM Data
      return this._cartridge.read(addr);
    } else if (addr < 0xa000) {
      //Map Data
    } else if (addr < 0xc000) {
      //Cartridge RAM
      return this._cartridge.read(addr);
    } else if (addr < 0xe000) {
      //WRAM (Working RAM)
      return this.wramRead(addr);
    } else if (addr < 0xfe00) {
      //Reserved Echo RAM
      return 0;
    } else if (addr < 0xfea0) {
      //Object Attribute Memory
    } else if (addr < 0xff00) {
      //Reserved Unusable
      return 0;
    } else if (addr < 0xff80) {
      //IO Registers
    } else if (addr < 0xffff) {
      //CPU Enable Registers
    }

    //No Implementation
    return this.hramRead(addr);
  }

  write(addr: number, val: number) {
    if (addr < 0x8000) {
      //ROM Data
      this._cartridge.write(addr, val);
    } else if (addr < 0xa000) {
      //Map Data
    } else if (addr < 0xc000) {
      //Cartridge RAM
      this._cartridge.write(addr, val);
    } else if (addr < 0xe000) {
      //WRAM (Working RAM)
      this.wramWrite(addr, val);
    } else if (addr < 0xfe00) {
      //Reserved Echo RAM
    } else if (addr < 0xfea0) {
      //Object Attribute Memory
    } else if (addr < 0xff00) {
      //Reserved Unusable
    } else if (addr < 0xff80) {
      //IO Registers
    } else if (addr < 0xffff) {
      //CPU Enable Registers
    } else {
      //No Implementation
      this.hramWrite(addr, val);
    }
  }

  read16(addr: number): number {
    return this.read(addr) | (this.read(addr + 1) << 8);
  }

  write16(addr: number, val: number) {
    this.write(addr + 1, (val >> 8) & 0xff);
    this.write(addr, val & 0xff);
  }
}
