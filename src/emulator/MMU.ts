import { REGISTER } from "../lib/types";
import { Cartridge } from "./cartridge";
import { CPU } from "./cpu";
import { PPU } from "./ppu";
import { Timer } from "./timer";

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
  _io;
  _debug;
  _debug_index;

  _timer;
  _cartridge;
  _cpu: CPU | null;
  _ppu: PPU | null;

  constructor(timer: Timer, cartridge: Cartridge) {
    this._wram = new Uint8Array(0x2000);
    this._hram = new Uint8Array(0x80);
    this._io = new Uint8Array(0x02);
    this._debug = new Uint8Array(0x400);
    this._debug_index = 0;
    this._timer = timer;
    this._cartridge = cartridge;
    this._cpu = null;
    this._ppu = null;
  }

  init(cpu: CPU, ppu: PPU) {
    this._cpu = cpu;
    this._ppu = ppu;
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

  ioRead(addr: number) {
    switch (addr) {
      case 0xff01:
        return this._io[0];
      case 0xff02:
        return this._io[1];
      case 0xff04:
      case 0xff05:
      case 0xff06:
      case 0xff07:
        return this._timer.read(addr);
      case 0xff0f:
        return this.cpuRead(REGISTER.I);
      default:
        return 0;
    }
  }

  ioWrite(addr: number, val: number) {
    switch (addr) {
      case 0xff01:
        this._io[0] = val;
        return;
      case 0xff02:
        this._io[1] = val;
        return;
      case 0xff04:
      case 0xff05:
      case 0xff06:
      case 0xff07:
        this._timer.write(addr, val);
        return;
      case 0xff0f:
        this.cpuWrite(REGISTER.I, val);
        return;
    }
  }

  cpuRead(r: REGISTER) {
    if (!this._cpu) {
      throw new Error("CPU Error: MMU is not connected to the CPU.");
    }

    switch (r) {
      case REGISTER.IE:
        return this._cpu._r.ie;
      case REGISTER.I:
        return this._cpu._r.i;
      default:
        return 0;
    }
  }

  cpuWrite(r: REGISTER, val: number) {
    if (!this._cpu) {
      throw new Error("CPU Error: MMU is not connected to the CPU.");
    }

    switch (r) {
      case REGISTER.IE:
        this._cpu._r.ie = val;
        return;
      case REGISTER.I:
        this._cpu._r.i = val;
        return;
    }
  }

  ppuRead(ram: "vram" | "oam", addr: number) {
    if (!this._ppu) {
      throw new Error("PPU Error: MMU is not connected to the PPU.");
    }

    switch (ram) {
      case "oam":
        return this._ppu.oamRead(addr);
      case "vram":
        return this._ppu.vramRead(addr);
      default:
        return 0;
    }
  }

  ppuWrite(ram: "vram" | "oam", addr: number, val: number) {
    if (!this._ppu) {
      throw new Error("PPU Error: MMU is not connected to the PPU.");
    }

    switch (ram) {
      case "oam":
        this._ppu.oamWrite(addr, val);
        return;
      case "vram":
        this._ppu.vramWrite(addr, val);
        return;
    }
  }

  debugUpdate() {
    if (this.read(0xff02) === 0x81) {
      const c = this.read(0xff01);
      this._debug_index += 1;
      this._debug[this._debug_index] = c;
      this.write(0xff02, 0);
    }
  }

  debugPrint() {
    const decoder = new TextDecoder("utf-8");
    console.log("DBG:", decoder.decode(this._debug));
  }

  read(addr: number): number {
    if (addr < 0x8000) {
      //ROM Data
      return this._cartridge.read(addr);
    } else if (addr < 0xa000) {
      //Map Data
      return this.ppuRead("vram", addr);
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
      return this.ppuRead("oam", addr);
    } else if (addr < 0xff00) {
      //Reserved Unusable
      return 0;
    } else if (addr < 0xff80) {
      //IO Registers
      return this.ioRead(addr);
    } else if (addr < 0xffff) {
      //CPU Enable Registers
      return this.cpuRead(REGISTER.IE);
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
      this.ppuWrite("vram", addr, val);
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
      this.ppuWrite("oam", addr, val);
    } else if (addr < 0xff00) {
      //Reserved Unusable
    } else if (addr < 0xff80) {
      //IO Registers
      this.ioWrite(addr, val);
    } else if (addr < 0xffff) {
      //CPU Enable Registers
      this.cpuWrite(REGISTER.IE, val);
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
