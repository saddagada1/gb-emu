import { LINES_PER_FRAME, Pallette, SCALE, TICKS_PER_LINE, XRES, YRES } from "../lib/constants";
import { Bit, INTERRUPT_TYPE, LinkedList, PIXEL_FETCH_STATE, PPU_MODE } from "../lib/types";
import { getBit, getColour, setBit } from "../lib/utils";
import { CPU } from "./cpu";
import { MMU } from "./mmu";
import { Timer } from "./timer";

export class PPU {
  _timer;

  _r;
  _dma;
  _pixels;

  _current_frame;
  _line_ticks;

  _oam_ram;
  _vram;
  _buffer;

  _canvas;
  _renderer;

  _mmu;
  _cpu;

  constructor(cpu: CPU, mmu: MMU, timer: Timer) {
    this._r = {
      lcdc: 0x91,
      stat: 0,
      ly: 0,
      lyc: 0,
      bgp: 0xfc,
      bgc: Pallette,
      obp0: 0xff,
      obc0: Pallette,
      obp1: 0xff,
      obc1: Pallette,
      scx: 0,
      scy: 0,
      wx: 0,
      wy: 0,
    };
    this._dma = {
      active: false,
      byte: 0,
      value: 0,
      delay: 0,
    };
    this._pixels = {
      state: PIXEL_FETCH_STATE.TILE,
      list: { size: 0 } as LinkedList,
      lineX: 0,
      pushedX: 0,
      fetchX: 0,
      bgwData: [0, 0, 0],
      entryData: [0, 0, 0, 0, 0, 0],
      mapY: 0,
      mapX: 0,
      tileY: 0,
      index: 0,
    };

    this._current_frame = 0;
    this._line_ticks = 0;

    this._oam_ram = new Uint8Array(0x160);
    this._vram = new Uint8Array(0x2000);
    this._buffer = new Uint32Array(XRES * YRES);

    this._canvas = document.querySelector(".screen")! as HTMLCanvasElement;
    this._canvas.width = window.innerWidth * window.devicePixelRatio;
    this._canvas.height = window.innerHeight * window.devicePixelRatio;
    this._renderer = this._canvas.getContext("2d")!;

    this._mmu = mmu;
    this._cpu = cpu;
    this._timer = timer;
  }

  getLCDC(bit: number) {
    switch (bit) {
      case 0:
        //BGW Enable
        return getBit({ n: this._r.lcdc, bit: 0 });
      case 1:
        //OBJ Enable
        return getBit({ n: this._r.lcdc, bit: 1 });
      case 2:
        //OBJ Height
        return getBit({ n: this._r.lcdc, bit: 2 }) ? 16 : 8;
      case 3:
        //BG Map Area
        return getBit({ n: this._r.lcdc, bit: 3 }) ? 0x9c00 : 0x9800;
      case 4:
        //BGW Data Area
        return getBit({ n: this._r.lcdc, bit: 4 }) ? 0x8000 : 0x8800;
      case 5:
        //WIN Enable
        return getBit({ n: this._r.lcdc, bit: 5 });
      case 6:
        //WIN Map Area
        return getBit({ n: this._r.lcdc, bit: 6 }) ? 0x9c00 : 0x9800;
      case 7:
        //LCD Enable
        return getBit({ n: this._r.lcdc, bit: 7 });
      default:
        return 0;
    }
  }

  getStatus(bit: number) {
    switch (bit) {
      case 0:
      case 1:
        //Mode
        return this._r.stat & 0b11;
      case 2:
        //LYC == LY
        return getBit({ n: this._r.stat, bit: 2 });
      case 3:
        //HBLANK INT
        return getBit({ n: this._r.stat, bit: 3 });
      case 4:
        //VBLANK INT
        return getBit({ n: this._r.stat, bit: 4 });
      case 5:
        //OAM INT
        return getBit({ n: this._r.stat, bit: 5 });
      case 6:
        //LYC INT
        return getBit({ n: this._r.stat, bit: 6 });
      default:
        return 0;
    }
  }

  getLYC() {
    return this.getStatus(6);
  }

  getMode() {
    const mode = this.getStatus(0);
    switch (mode) {
      case 0:
        return PPU_MODE.OAM;
      case 1:
        return PPU_MODE.VRAM;
      case 2:
        return PPU_MODE.VBLANK;
      case 3:
        return PPU_MODE.HBLANK;
      default:
        return PPU_MODE.OAM;
    }
  }

  setMode(val: PPU_MODE) {
    this._r.stat &= ~0b11;
    this._r.stat |= val;
  }

  setLYC(val: Bit) {
    setBit({ n: this._r.stat, bit: 2, val });
  }

  incrementLY() {
    this._r.ly += 1;
    if (this._r.ly === this._r.lyc) {
      this.setLYC(1);
      if (this.getLYC()) {
        this._cpu.requestInterrupt(INTERRUPT_TYPE.LCD_STAT);
      }
    } else {
      this.setLYC(0);
    }
  }

  pixelsPush(val: number) {
    const data = {
      value: val,
    };

    if (!this._pixels.list.head) {
      this._pixels.list.head = this._pixels.list.tail = data;
    } else {
      this._pixels.list.tail!.next = data;
      this._pixels.list.tail = data;
    }
    this._pixels.list.size += 1;
  }

  pixelsPop() {
    if (this._pixels.list.size <= 0) {
      throw new Error("PPU Error: No Pixels to Access");
    }

    const data = this._pixels.list.head!;
    this._pixels.list.head = data.next;
    this._pixels.list.size -= 1;

    return data.value;
  }

  pipelineAdd() {
    if (this._pixels.list.size > 8) {
      return false;
    }

    const x = this._pixels.fetchX - (8 - (this._r.scx % 8));
    for (let i = 0; i < 8; i++) {
      const bit = 7 - i;
      const high = getBit({ n: this._pixels.bgwData[2], bit }) << 1;
      const low = getBit({ n: this._pixels.bgwData[1], bit });

      const colour = this._r.bgc[high | low];

      if (x >= 0) {
        this.pixelsPush(colour);
        this._pixels.index += 1;
      }
    }
    return true;
  }

  pipelineFetch() {
    switch (this._pixels.state) {
      case PIXEL_FETCH_STATE.TILE:
        if (this.getLCDC(0)) {
          this._pixels.bgwData[0] = this._mmu.read(
            this.getLCDC(3) + this._pixels.mapX / 8 + (this._pixels.mapY / 8) * 32
          );

          if (this.getLCDC(4) === 0x8800) {
            this._pixels.bgwData[0] += 128;
          }
        }

        this._pixels.state = PIXEL_FETCH_STATE.DATA0;
        this._pixels.fetchX += 8;
        break;
      case PIXEL_FETCH_STATE.DATA0:
        this._pixels.bgwData[1] = this._mmu.read(
          this.getLCDC(4) + this._pixels.bgwData[0] * 16 + this._pixels.tileY
        );

        this._pixels.state = PIXEL_FETCH_STATE.DATA1;
        break;
      case PIXEL_FETCH_STATE.DATA1:
        this._pixels.bgwData[2] = this._mmu.read(
          this.getLCDC(4) + this._pixels.bgwData[0] * 16 + this._pixels.tileY + 1
        );

        this._pixels.state = PIXEL_FETCH_STATE.IDLE;
        break;
      case PIXEL_FETCH_STATE.IDLE:
        this._pixels.state = PIXEL_FETCH_STATE.PUSH;
        break;
      case PIXEL_FETCH_STATE.PUSH:
        if (this.pipelineAdd()) {
          this._pixels.state = PIXEL_FETCH_STATE.TILE;
        }
        break;
    }
  }

  pipelinePush() {
    if (this._pixels.list.size > 8) {
      const data = this.pixelsPop();

      if (this._pixels.lineX >= this._r.scx % 8) {
        this._buffer[this._pixels.pushedX + this._r.ly * XRES] = data;
        this._pixels.pushedX += 1;
      }

      this._pixels.lineX += 1;
    }
  }

  pipelineProcess() {
    this._pixels.mapY = this._r.ly + this._r.scy;
    this._pixels.mapX = this._pixels.fetchX + this._r.scx;
    this._pixels.tileY = ((this._r.ly + this._r.scy) % 8) * 2;

    if (!(this._line_ticks & 1)) {
      this.pipelineFetch();
    }

    this.pipelinePush();
  }

  pipelineReset() {
    while (this._pixels.list.size > 0) {
      this.pixelsPop();
    }
  }

  step() {
    this._line_ticks += 1;
    switch (this.getMode()) {
      case PPU_MODE.OAM:
        if (this._line_ticks >= 80) {
          this.setMode(PPU_MODE.VRAM);
          this._pixels = {
            ...this._pixels,
            state: PIXEL_FETCH_STATE.TILE,
            lineX: 0,
            fetchX: 0,
            pushedX: 0,
            index: 0,
          };
        }
        break;
      case PPU_MODE.VRAM:
        this.pipelineProcess();
        if (this._pixels.pushedX >= XRES) {
          this.pipelineReset();
          this.setMode(PPU_MODE.HBLANK);
          if (this.getStatus(3)) {
            this._cpu.requestInterrupt(INTERRUPT_TYPE.LCD_STAT);
          }
        }
        break;
      case PPU_MODE.VBLANK:
        if (this._line_ticks >= TICKS_PER_LINE) {
          this.incrementLY();

          if (this._r.ly >= LINES_PER_FRAME) {
            this.setMode(PPU_MODE.OAM);
            this._r.ly = 0;
          }

          this._line_ticks = 0;
        }
        break;
      case PPU_MODE.HBLANK:
        if (this._line_ticks >= TICKS_PER_LINE) {
          this.incrementLY();

          if (this._r.ly >= YRES) {
            this.setMode(PPU_MODE.VBLANK);
            this._cpu.requestInterrupt(INTERRUPT_TYPE.VBLANK);
            if (this.getStatus(4)) {
              this._cpu.requestInterrupt(INTERRUPT_TYPE.LCD_STAT);
            }
            this._current_frame += 1;

            this._timer.calcFPS();
          } else {
            this.setMode(PPU_MODE.OAM);
          }

          this._line_ticks = 0;
        }
        break;
    }
  }

  dmaStart(val: number) {
    this._dma = {
      active: true,
      byte: 0,
      delay: 2,
      value: val,
    };
  }

  dmaStep() {
    if (!this._dma.active) return;

    if (this._dma.delay > 0) {
      this._dma.delay -= 1;
      return;
    }

    this.oamWrite(this._dma.byte, this._mmu.read(this._dma.value * 0x100 + this._dma.byte));

    this._dma.byte += 1;

    this._dma.active = this._dma.byte < 0xa0;
  }

  updatePalette(val: number, palette: number) {
    switch (palette) {
      case 0:
        this._r.bgc[0] = Pallette[val & 0b11];
        this._r.bgc[1] = Pallette[(val >> 2) & 0b11];
        this._r.bgc[2] = Pallette[(val >> 4) & 0b11];
        this._r.bgc[3] = Pallette[(val >> 6) & 0b11];
        return;
      case 1:
        this._r.obc0[0] = Pallette[val & 0b11];
        this._r.obc0[1] = Pallette[(val >> 2) & 0b11];
        this._r.obc0[2] = Pallette[(val >> 4) & 0b11];
        this._r.obc0[3] = Pallette[(val >> 6) & 0b11];
        return;
      case 2:
        this._r.obc1[0] = Pallette[val & 0b11];
        this._r.obc1[1] = Pallette[(val >> 2) & 0b11];
        this._r.obc1[2] = Pallette[(val >> 4) & 0b11];
        this._r.obc1[3] = Pallette[(val >> 6) & 0b11];
        return;
    }
  }

  lcdRead(addr: number) {
    switch (addr) {
      case 0xff40:
        return this._r.lcdc;
      case 0xff41:
        return this._r.stat;
      case 0xff42:
        return this._r.scy;
      case 0xff43:
        return this._r.scx;
      case 0xff44:
        return this._r.ly;
      case 0xff45:
        return this._r.lyc;
      case 0xff47:
        return this._r.bgp;
      case 0xff48:
        return this._r.obp0;
      case 0xff49:
        return this._r.obp1;
      default:
        return 0;
    }
  }

  lcdWrite(addr: number, val: number) {
    switch (addr) {
      case 0xff40:
        this._r.lcdc = val;
        return;
      case 0xff41:
        this._r.stat = val;
        return;
      case 0xff42:
        this._r.scy = val;
        return;
      case 0xff43:
        this._r.scx = val;
        return;
      case 0xff44:
        this._r.ly = val;
        return;
      case 0xff45:
        this._r.lyc = val;
        return;
      case 0xff46:
        this.dmaStart(val);
        return;
      case 0xff47:
        this.updatePalette(val, 0);
        return;
      case 0xff48:
        this.updatePalette(val & 0b11111100, 1);
        return;
      case 0xff49:
        this.updatePalette(val & 0b11111100, 2);
        return;
    }
  }

  oamRead(addr: number) {
    if (addr >= 0xfe00) {
      addr -= 0xfe00;
    }
    return this._oam_ram[addr];
  }

  oamWrite(addr: number, val: number) {
    if (addr >= 0xfe00) {
      addr -= 0xfe00;
    }

    this._oam_ram[addr] = val;
  }

  vramRead(addr: number) {
    return this._vram[addr];
  }

  vramWrite(addr: number, val: number) {
    this._vram[addr] = val;
  }

  drawTile(index: number, xPos: number, yPos: number) {
    for (let lineY = 0; lineY < 16; lineY += 2) {
      const byte1 = this.vramRead(index * 16 + lineY);
      const byte2 = this.vramRead(index * 16 + lineY + 1);

      for (let bit = 7; bit >= 0; bit--) {
        const high = getBit({ n: byte1, bit }) << 1;
        const low = getBit({ n: byte2, bit });

        const code = Pallette[high | low];

        const x = xPos + (7 - bit) * SCALE;
        const y = yPos + (lineY / 2) * SCALE;

        this._renderer.fillStyle = getColour(code);

        this._renderer.fillRect(x + 700, y, SCALE, SCALE);
      }
    }
  }

  drawScreen() {
    for (let y = 0; y < YRES; y++) {
      for (let x = 0; x < XRES; x++) {
        const xPos = x * SCALE;
        const yPos = y * SCALE;
        const code = this._buffer[x + y * XRES];
        const colour = getColour(code);

        this._renderer.fillStyle = colour;

        this._renderer.fillRect(xPos, yPos, SCALE, SCALE);
      }
    }
  }

  drawDebug() {
    let xPos = 0;
    let yPos = 0;
    let tileIndex = 0;

    //384 Tiles, 16 x 24
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 16; x++) {
        this.drawTile(tileIndex, xPos + x * SCALE, yPos + y * SCALE);
        xPos += 8 * SCALE;
        tileIndex += 1;
      }
      yPos += 8 * SCALE;
      xPos = 0;
    }
  }

  drawConsole(status: string, context: string) {
    this._renderer.fillStyle = "#000000";
    this._renderer.font = "25px Arial";
    this._renderer.fillText(status, 0, 700);

    this._renderer.font = "25px Arial";
    this._renderer.fillText(context, 0, 800);

    this._renderer.font = "20px Arial";
    this._renderer.fillText(this._buffer.toString().substring(0, 250), 0, 900);
    this._renderer.fillText(this._buffer.toString().substring(250, 500), 0, 1000);
    this._renderer.fillText(this._buffer.toString().substring(500, 750), 0, 1100);
    this._renderer.fillText(this._buffer.toString().substring(750, 1000), 0, 1200);
    this._renderer.fillText(this._buffer.toString().substring(1000, 1250), 0, 1300);
    this._renderer.fillText(this._buffer.toString().substring(1250, 1500), 0, 1400);
  }

  draw(status: string, context: string) {
    this._renderer.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this.drawScreen();
    this.drawDebug();
    this.drawConsole(status, context);
  }
}
