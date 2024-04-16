import { CartridgeType, LicenseCode } from "../lib/constants";

export class Cartridge {
  _filename;
  _size;
  _data;
  _header;

  constructor() {
    this._filename = "";
    this._size = 0;
    this._data = new Uint8Array();
    this._header = {
      entry: new Uint8Array(),
      logo: new Uint8Array(),
      title: "",
      new_lic_code: 0,
      sgb_flag: 0,
      type: 0,
      rom_size: 0,
      ram_size: 0,
      dest_code: 0,
      lic_code: 0,
      version: 0,
      checksum: 0,
      global_checksum: 0,
    };
  }

  getLicenseName() {
    if (this._header.new_lic_code <= 0xa4) {
      return LicenseCode[this._header.lic_code];
    }

    return "UNKNOWN";
  }

  getType() {
    if (this._header.type <= 0x22) {
      return CartridgeType[this._header.type];
    }

    return "UNKNOWN";
  }

  load(rom: File) {
    return new Promise<void>((resolve, reject) => {
      this._size = rom.size;

      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as ArrayBuffer;

        this._data = new Uint8Array(result);

        const decoder = new TextDecoder("utf-8");
        this._header = {
          entry: this._data.slice(0x100, 0x104),
          logo: this._data.slice(0x104, 0x134),
          title: decoder.decode(this._data.slice(0x134, 0x144)),
          new_lic_code: (this._data[0x145] << 8) | this._data[0x144],
          sgb_flag: this._data[0x146],
          type: this._data[0x147],
          rom_size: this._data[0x148],
          ram_size: this._data[0x149],
          dest_code: this._data[0x14a],
          lic_code: this._data[0x14b],
          version: this._data[0x14c],
          checksum: this._data[0x14d],
          global_checksum: (this._data[0x14f] << 8) | this._data[0x14e],
        };

        console.log("Cartridge Loaded");
        console.log("Title: ", this._header.title);
        console.log("Type: ", this.getType());
        console.log("ROM Size: ", 32 << this._header.rom_size, "KB");
        console.log("RAM Size: ", this._header.ram_size);
        console.log("LIC Code: ", this.getLicenseName());
        console.log("Version: ", this._header.version);

        let x = 0;
        for (let i = 0x0134; i <= 0x014c; i++) {
          x -= this._data[i] - 1;
        }

        console.log("Checksum: ", this._header.checksum, x & 0xff ? "PASSED" : "FAILED");

        resolve();
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(rom);
    });
  }

  read(addr: number): number {
    return this._data[addr];
  }

  write(addr: number, val: number) {
    return;
  }
}
