import { ADDRESSING_MODE, CONDITION_TYPE, Instruction, INSTRUCTION_TYPE, REGISTER } from "./types";

export const Bios = [
  0x31, 0xfe, 0xff, 0xaf, 0x21, 0xff, 0x9f, 0x32, 0xcb, 0x7c, 0x20, 0xfb, 0x21, 0x26, 0xff, 0x0e,
  0x11, 0x3e, 0x80, 0x32, 0xe2, 0x0c, 0x3e, 0xf3, 0xe2, 0x32, 0x3e, 0x77, 0x77, 0x3e, 0xfc, 0xe0,
  0x47, 0x11, 0x04, 0x01, 0x21, 0x10, 0x80, 0x1a, 0xcd, 0x95, 0x00, 0xcd, 0x96, 0x00, 0x13, 0x7b,
  0xfe, 0x34, 0x20, 0xf3, 0x11, 0xd8, 0x00, 0x06, 0x08, 0x1a, 0x13, 0x22, 0x23, 0x05, 0x20, 0xf9,
  0x3e, 0x19, 0xea, 0x10, 0x99, 0x21, 0x2f, 0x99, 0x0e, 0x0c, 0x3d, 0x28, 0x08, 0x32, 0x0d, 0x20,
  0xf9, 0x2e, 0x0f, 0x18, 0xf3, 0x67, 0x3e, 0x64, 0x57, 0xe0, 0x42, 0x3e, 0x91, 0xe0, 0x40, 0x04,
  0x1e, 0x02, 0x0e, 0x0c, 0xf0, 0x44, 0xfe, 0x90, 0x20, 0xfa, 0x0d, 0x20, 0xf7, 0x1d, 0x20, 0xf2,
  0x0e, 0x13, 0x24, 0x7c, 0x1e, 0x83, 0xfe, 0x62, 0x28, 0x06, 0x1e, 0xc1, 0xfe, 0x64, 0x20, 0x06,
  0x7b, 0xe2, 0x0c, 0x3e, 0x87, 0xf2, 0xf0, 0x42, 0x90, 0xe0, 0x42, 0x15, 0x20, 0xd2, 0x05, 0x20,
  0x4f, 0x16, 0x20, 0x18, 0xcb, 0x4f, 0x06, 0x04, 0xc5, 0xcb, 0x11, 0x17, 0xc1, 0xcb, 0x11, 0x17,
  0x05, 0x20, 0xf5, 0x22, 0x23, 0x22, 0x23, 0xc9, 0xce, 0xed, 0x66, 0x66, 0xcc, 0x0d, 0x00, 0x0b,
  0x03, 0x73, 0x00, 0x83, 0x00, 0x0c, 0x00, 0x0d, 0x00, 0x08, 0x11, 0x1f, 0x88, 0x89, 0x00, 0x0e,
  0xdc, 0xcc, 0x6e, 0xe6, 0xdd, 0xdd, 0xd9, 0x99, 0xbb, 0xbb, 0x67, 0x63, 0x6e, 0x0e, 0xec, 0xcc,
  0xdd, 0xdc, 0x99, 0x9f, 0xbb, 0xb9, 0x33, 0x3e, 0x3c, 0x42, 0xb9, 0xa5, 0xb9, 0xa5, 0x42, 0x4c,
  0x21, 0x04, 0x01, 0x11, 0xa8, 0x00, 0x1a, 0x13, 0xbe, 0x20, 0xfe, 0x23, 0x7d, 0xfe, 0x34, 0x20,
  0xf5, 0x06, 0x19, 0x78, 0x86, 0x23, 0x05, 0x20, 0xfb, 0x86, 0x20, 0xfe, 0x3e, 0x01, 0xe0, 0x50,
];

export const Pallette = ["#B5C18E", "#F7DCB9", "#DEAC80", "#B99470"];

export const WIDTH = 160;
export const HEIGHT = 144;
export const SCALE = 1;

export const debugScreenWidth = 16 * 8 * SCALE;
export const debugScreenHeight = 32 * 8 * SCALE;

//Cartridge
export const CartridgeType: Record<number, string> = {
  0x00: "ROM ONLY",
  0x01: "MBC1",
  0x02: "MBC1+RAM",
  0x03: "MBC1+RAM+BATTERY",
  0x05: "MBC2",
  0x06: "MBC2+BATTERY",
  0x08: "ROM+RAM 1",
  0x09: "ROM+RAM+BATTERY 1",
  0x0b: "MMM01",
  0x0c: "MMM01+RAM",
  0x0d: "MMM01+RAM+BATTERY",
  0x0f: "MBC3+TIMER+BATTERY",
  0x10: "MBC3+TIMER+RAM+BATTERY 2",
  0x11: "MBC3",
  0x12: "MBC3+RAM 2",
  0x13: "MBC3+RAM+BATTERY 2",
  0x19: "MBC5",
  0x1a: "MBC5+RAM",
  0x1b: "MBC5+RAM+BATTERY",
  0x1c: "MBC5+RUMBLE",
  0x1d: "MBC5+RUMBLE+RAM",
  0x1e: "MBC5+RUMBLE+RAM+BATTERY",
  0x20: "MBC6",
  0x22: "MBC7+SENSOR+RUMBLE+RAM+BATTERY",
  0xfc: "POCKET CAMERA",
  0xfd: "BANDAI TAMA5",
  0xfe: "HuC3",
  0xff: "HuC1+RAM+BATTERY",
};

export const LicenseCode: Record<number, string> = {
  0x00: "None",
  0x01: "Nintendo R&D1",
  0x08: "Capcom",
  0x13: "Electronic Arts",
  0x18: "Hudson Soft",
  0x19: "b-ai",
  0x20: "kss",
  0x22: "pow",
  0x24: "PCM Complete",
  0x25: "san-x",
  0x28: "Kemco Japan",
  0x29: "seta",
  0x30: "Viacom",
  0x31: "Nintendo",
  0x32: "Bandai",
  0x33: "Ocean/Acclaim",
  0x34: "Konami",
  0x35: "Hector",
  0x37: "Taito",
  0x38: "Hudson",
  0x39: "Banpresto",
  0x41: "Ubi Soft",
  0x42: "Atlus",
  0x44: "Malibu",
  0x46: "angel",
  0x47: "Bullet-Proof",
  0x49: "irem",
  0x50: "Absolute",
  0x51: "Acclaim",
  0x52: "Activision",
  0x53: "American sammy",
  0x54: "Konami",
  0x55: "Hi tech entertainment",
  0x56: "LJN",
  0x57: "Matchbox",
  0x58: "Mattel",
  0x59: "Milton Bradley",
  0x60: "Titus",
  0x61: "Virgin",
  0x64: "LucasArts",
  0x67: "Ocean",
  0x69: "Electronic Arts",
  0x70: "Infogrames",
  0x71: "Interplay",
  0x72: "Broderbund",
  0x73: "sculptured",
  0x75: "sci",
  0x78: "THQ",
  0x79: "Accolade",
  0x80: "misawa",
  0x83: "lozc",
  0x86: "Tokuma Shoten Intermedia",
  0x87: "Tsukuda Original",
  0x91: "Chunsoft",
  0x92: "Video system",
  0x93: "Ocean/Acclaim",
  0x95: "Varie",
  0x96: "Yonezawa/s’pal",
  0x97: "Kaneko",
  0x99: "Pack in soft",
  0xa4: "Konami (Yu-Gi-Oh!)",
};

//CPU
export const InstructionName: Record<INSTRUCTION_TYPE, string> = {
  0: "NONE",
  1: "NOP",
  2: "LD",
  3: "INC",
  4: "DEC",
  5: "RLCA",
  6: "ADD",
  7: "RRCA",
  8: "STOP",
  9: "RLA",
  10: "JR",
  11: "RRA",
  12: "DAA",
  13: "CPL",
  14: "SCF",
  15: "CCF",
  16: "HALT",
  17: "ADC",
  18: "SUB",
  19: "SBC",
  20: "AND",
  21: "XOR",
  22: "OR",
  23: "CP",
  24: "POP",
  25: "JP",
  26: "PUSH",
  27: "RET",
  28: "CB",
  29: "CALL",
  30: "RETI",
  31: "LDH",
  32: "JPHL",
  33: "DI",
  34: "EI",
  35: "RST",
  36: "ERR",
  //CB instructions...
  37: "RLC",
  38: "RRC",
  39: "RL",
  40: "RR",
  41: "SLA",
  42: "SRA",
  43: "SWAP",
  44: "SRL",
  45: "BIT",
  46: "RES",
  47: "SET",
};

export const RegisterName: Record<REGISTER, string> = {
  0: "A",
  1: "F",
  2: "B",
  3: "C",
  4: "D",
  5: "E",
  6: "H",
  7: "L",
  8: "AF",
  9: "BC",
  10: "DE",
  11: "HL",
  12: "SP",
  13: "PC",
  14: "IE",
  15: "I",
};

export const Instructions: Record<number, Instruction> = {
  //0x0X
  0x00: {
    type: INSTRUCTION_TYPE.NOP,
  },
  0x01: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D16,
    r1: REGISTER.BC,
  },
  0x02: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.BC,
    r2: REGISTER.A,
  },
  0x03: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.BC,
  },
  0x04: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.B,
  },
  0x05: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.B,
  },
  0x06: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.B,
  },
  0x07: {
    type: INSTRUCTION_TYPE.RLCA,
  },
  0x08: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.A16_R,
    r2: REGISTER.SP,
  },
  0x09: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.HL,
    r2: REGISTER.BC,
  },
  0x0a: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.BC,
  },
  0x0b: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.BC,
  },
  0x0c: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.C,
  },
  0x0d: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.C,
  },
  0x0e: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.C,
  },
  0x0f: {
    type: INSTRUCTION_TYPE.RRCA,
  },

  //0x1X
  0x10: {
    type: INSTRUCTION_TYPE.STOP,
  },
  0x11: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D16,
    r1: REGISTER.DE,
  },
  0x12: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.DE,
    r2: REGISTER.A,
  },
  0x13: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.DE,
  },
  0x14: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.D,
  },
  0x15: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.D,
  },
  0x16: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.D,
  },
  0x17: {
    type: INSTRUCTION_TYPE.RLA,
  },
  0x18: {
    type: INSTRUCTION_TYPE.JR,
    mode: ADDRESSING_MODE.D8,
    condition: CONDITION_TYPE.NONE,
  },
  0x19: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.HL,
    r2: REGISTER.DE,
  },
  0x1a: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.DE,
  },
  0x1b: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.DE,
  },
  0x1c: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.E,
  },
  0x1d: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.E,
  },
  0x1e: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.E,
  },
  0x1f: {
    type: INSTRUCTION_TYPE.RRA,
  },

  //0x2X
  0x20: {
    type: INSTRUCTION_TYPE.JR,
    mode: ADDRESSING_MODE.D8,
    condition: CONDITION_TYPE.NZ,
  },
  0x21: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D16,
    r1: REGISTER.HL,
  },
  0x22: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.HLI_R,
    r1: REGISTER.HL,
    r2: REGISTER.A,
  },
  0x23: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.HL,
  },
  0x24: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.H,
  },
  0x25: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.H,
  },
  0x26: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.H,
  },
  0x27: {
    type: INSTRUCTION_TYPE.DAA,
  },
  0x28: {
    type: INSTRUCTION_TYPE.JR,
    mode: ADDRESSING_MODE.D8,
    condition: CONDITION_TYPE.Z,
  },
  0x29: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.HL,
    r2: REGISTER.HL,
  },
  0x2a: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_HLI,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0x2b: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.HL,
  },
  0x2c: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.L,
  },
  0x2d: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.L,
  },
  0x2e: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.L,
  },
  0x2f: {
    type: INSTRUCTION_TYPE.CPL,
  },

  //0x3X
  0x30: {
    type: INSTRUCTION_TYPE.JR,
    mode: ADDRESSING_MODE.D8,
    condition: CONDITION_TYPE.NC,
  },
  0x31: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D16,
    r1: REGISTER.SP,
  },
  0x32: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.HLD_R,
    r1: REGISTER.HL,
    r2: REGISTER.A,
  },
  0x33: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.SP,
  },
  0x34: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.MR,
    r1: REGISTER.HL,
  },
  0x35: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.MR,
    r1: REGISTER.HL,
  },
  0x36: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_D8,
    r1: REGISTER.HL,
  },
  0x37: {
    type: INSTRUCTION_TYPE.SCF,
  },
  0x38: {
    type: INSTRUCTION_TYPE.JR,
    mode: ADDRESSING_MODE.D8,
    condition: CONDITION_TYPE.C,
  },
  0x39: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.HL,
    r2: REGISTER.SP,
  },
  0x3a: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_HLD,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0x3b: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.SP,
  },
  0x3c: {
    type: INSTRUCTION_TYPE.INC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.A,
  },
  0x3d: {
    type: INSTRUCTION_TYPE.DEC,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.A,
  },
  0x3e: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0x3f: {
    type: INSTRUCTION_TYPE.CCF,
  },

  //0x4X
  0x40: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.B,
    r2: REGISTER.B,
  },
  0x41: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.B,
    r2: REGISTER.C,
  },
  0x42: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.B,
    r2: REGISTER.D,
  },
  0x43: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.B,
    r2: REGISTER.E,
  },
  0x44: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.B,
    r2: REGISTER.H,
  },
  0x45: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.B,
    r2: REGISTER.L,
  },
  0x46: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.B,
    r2: REGISTER.HL,
  },
  0x47: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.B,
    r2: REGISTER.A,
  },
  0x48: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.C,
    r2: REGISTER.B,
  },
  0x49: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.C,
    r2: REGISTER.C,
  },
  0x4a: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.C,
    r2: REGISTER.D,
  },
  0x4b: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.C,
    r2: REGISTER.E,
  },
  0x4c: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.C,
    r2: REGISTER.H,
  },
  0x4d: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.C,
    r2: REGISTER.L,
  },
  0x4e: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.C,
    r2: REGISTER.HL,
  },
  0x4f: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.C,
    r2: REGISTER.A,
  },

  //0x5X
  0x50: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.D,
    r2: REGISTER.B,
  },
  0x51: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.D,
    r2: REGISTER.C,
  },
  0x52: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.D,
    r2: REGISTER.D,
  },
  0x53: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.D,
    r2: REGISTER.E,
  },
  0x54: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.D,
    r2: REGISTER.H,
  },
  0x55: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.D,
    r2: REGISTER.L,
  },
  0x56: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.D,
    r2: REGISTER.HL,
  },
  0x57: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.D,
    r2: REGISTER.A,
  },
  0x58: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.E,
    r2: REGISTER.B,
  },
  0x59: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.E,
    r2: REGISTER.C,
  },
  0x5a: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.E,
    r2: REGISTER.D,
  },
  0x5b: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.E,
    r2: REGISTER.E,
  },
  0x5c: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.E,
    r2: REGISTER.H,
  },
  0x5d: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.E,
    r2: REGISTER.L,
  },
  0x5e: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.E,
    r2: REGISTER.HL,
  },
  0x5f: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.E,
    r2: REGISTER.A,
  },

  //0x6X
  0x60: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.H,
    r2: REGISTER.B,
  },
  0x61: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.H,
    r2: REGISTER.C,
  },
  0x62: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.H,
    r2: REGISTER.D,
  },
  0x63: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.H,
    r2: REGISTER.E,
  },
  0x64: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.H,
    r2: REGISTER.H,
  },
  0x65: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.H,
    r2: REGISTER.L,
  },
  0x66: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.H,
    r2: REGISTER.HL,
  },
  0x67: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.H,
    r2: REGISTER.A,
  },
  0x68: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.L,
    r2: REGISTER.B,
  },
  0x69: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.L,
    r2: REGISTER.C,
  },
  0x6a: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.L,
    r2: REGISTER.D,
  },
  0x6b: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.L,
    r2: REGISTER.E,
  },
  0x6c: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.L,
    r2: REGISTER.H,
  },
  0x6d: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.L,
    r2: REGISTER.L,
  },
  0x6e: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.L,
    r2: REGISTER.HL,
  },
  0x6f: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.L,
    r2: REGISTER.A,
  },

  //0x7X
  0x70: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.HL,
    r2: REGISTER.B,
  },
  0x71: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.HL,
    r2: REGISTER.C,
  },
  0x72: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.HL,
    r2: REGISTER.D,
  },
  0x73: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.HL,
    r2: REGISTER.E,
  },
  0x74: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.HL,
    r2: REGISTER.H,
  },
  0x75: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.HL,
    r2: REGISTER.L,
  },
  0x76: {
    type: INSTRUCTION_TYPE.HALT,
  },
  0x77: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.HL,
    r2: REGISTER.A,
  },
  0x78: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0x79: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0x7a: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0x7b: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0x7c: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0x7d: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0x7e: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0x7f: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },

  //0x8X
  0x80: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0x81: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0x82: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0x83: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0x84: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0x85: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0x86: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0x87: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },
  0x88: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0x89: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0x8a: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0x8b: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0x8c: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0x8d: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0x8e: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0x8f: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },

  //0x9X
  0x90: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0x91: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0x92: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0x93: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0x94: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0x95: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0x96: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0x97: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },
  0x98: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0x99: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0x9a: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0x9b: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0x9c: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0x9d: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0x9e: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0x9f: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },

  //0xAX
  0xa0: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0xa1: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0xa2: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0xa3: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0xa4: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0xa5: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0xa6: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0xa7: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },
  0xa8: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0xa9: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0xaa: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0xab: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0xac: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0xad: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0xae: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0xaf: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },

  //0xBX
  0xb0: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0xb1: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0xb2: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0xb3: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0xb4: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0xb5: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0xb6: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0xb7: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },
  0xb8: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.B,
  },
  0xb9: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0xba: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.D,
  },
  0xbb: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.E,
  },
  0xbc: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.H,
  },
  0xbd: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.L,
  },
  0xbe: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.HL,
  },
  0xbf: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.A,
    r2: REGISTER.A,
  },

  //0xCX
  0xc0: {
    type: INSTRUCTION_TYPE.RET,
    condition: CONDITION_TYPE.NZ,
  },
  0xc1: {
    type: INSTRUCTION_TYPE.POP,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.BC,
  },
  0xc2: {
    type: INSTRUCTION_TYPE.JP,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.NZ,
  },
  0xc3: {
    type: INSTRUCTION_TYPE.JP,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.NONE,
  },
  0xc4: {
    type: INSTRUCTION_TYPE.CALL,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.NZ,
  },
  0xc5: {
    type: INSTRUCTION_TYPE.PUSH,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.BC,
  },
  0xc6: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0xc7: {
    type: INSTRUCTION_TYPE.RST,
    param: 0x00,
  },
  0xc8: {
    type: INSTRUCTION_TYPE.RET,
    condition: CONDITION_TYPE.Z,
  },
  0xc9: {
    type: INSTRUCTION_TYPE.RET,
    condition: CONDITION_TYPE.NONE,
  },
  0xca: {
    type: INSTRUCTION_TYPE.JP,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.Z,
  },
  0xcb: {
    type: INSTRUCTION_TYPE.CB,
    mode: ADDRESSING_MODE.D8,
  },
  0xcc: {
    type: INSTRUCTION_TYPE.CALL,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.Z,
  },
  0xcd: {
    type: INSTRUCTION_TYPE.CALL,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.NONE,
  },
  0xce: {
    type: INSTRUCTION_TYPE.ADC,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0xcf: {
    type: INSTRUCTION_TYPE.RST,
    param: 0x08,
  },

  //0xDX
  0xd0: {
    type: INSTRUCTION_TYPE.RET,
    condition: CONDITION_TYPE.NC,
  },
  0xd1: {
    type: INSTRUCTION_TYPE.POP,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.DE,
  },
  0xd2: {
    type: INSTRUCTION_TYPE.JP,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.NC,
  },
  0xd3: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xd4: {
    type: INSTRUCTION_TYPE.CALL,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.NC,
  },
  0xd5: {
    type: INSTRUCTION_TYPE.PUSH,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.DE,
  },
  0xd6: {
    type: INSTRUCTION_TYPE.SUB,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0xd7: {
    type: INSTRUCTION_TYPE.RST,
    param: 0x10,
  },
  0xd8: {
    type: INSTRUCTION_TYPE.RET,
    condition: CONDITION_TYPE.C,
  },
  0xd9: {
    type: INSTRUCTION_TYPE.RETI,
  },
  0xda: {
    type: INSTRUCTION_TYPE.JP,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.C,
  },
  0xdb: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xdc: {
    type: INSTRUCTION_TYPE.CALL,
    mode: ADDRESSING_MODE.D16,
    condition: CONDITION_TYPE.C,
  },
  0xdd: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xde: {
    type: INSTRUCTION_TYPE.SBC,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0xdf: {
    type: INSTRUCTION_TYPE.RST,
    param: 0x18,
  },

  //0xEX
  0xe0: {
    type: INSTRUCTION_TYPE.LDH,
    mode: ADDRESSING_MODE.A8_R,
    r2: REGISTER.A,
  },
  0xe1: {
    type: INSTRUCTION_TYPE.POP,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.HL,
  },
  0xe2: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.MR_R,
    r1: REGISTER.C,
    r2: REGISTER.A,
  },
  0xe3: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xe4: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xe5: {
    type: INSTRUCTION_TYPE.PUSH,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.HL,
  },
  0xe6: {
    type: INSTRUCTION_TYPE.AND,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0xe7: {
    type: INSTRUCTION_TYPE.RST,
    param: 0x20,
  },
  0xe8: {
    type: INSTRUCTION_TYPE.ADD,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.SP,
  },
  0xe9: {
    type: INSTRUCTION_TYPE.JP,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.HL,
    condition: CONDITION_TYPE.NONE,
  },
  0xea: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.A16_R,
    r2: REGISTER.A,
  },
  0xeb: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xec: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xed: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xee: {
    type: INSTRUCTION_TYPE.XOR,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0xef: {
    type: INSTRUCTION_TYPE.RST,
    param: 0x28,
  },

  //0xFX
  0xf0: {
    type: INSTRUCTION_TYPE.LDH,
    mode: ADDRESSING_MODE.R_A8,
    r1: REGISTER.A,
  },
  0xf1: {
    type: INSTRUCTION_TYPE.POP,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.AF,
  },
  0xf2: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_MR,
    r1: REGISTER.A,
    r2: REGISTER.C,
  },
  0xf3: {
    type: INSTRUCTION_TYPE.DI,
  },
  0xf4: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xf5: {
    type: INSTRUCTION_TYPE.PUSH,
    mode: ADDRESSING_MODE.R,
    r1: REGISTER.AF,
  },
  0xf6: {
    type: INSTRUCTION_TYPE.OR,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0xf7: {
    type: INSTRUCTION_TYPE.RST,
    param: 0x30,
  },
  0xf8: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.HL_SPR,
    r1: REGISTER.HL,
    r2: REGISTER.SP,
  },
  0xf9: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_R,
    r1: REGISTER.SP,
    r2: REGISTER.HL,
  },
  0xfa: {
    type: INSTRUCTION_TYPE.LD,
    mode: ADDRESSING_MODE.R_A16,
    r1: REGISTER.A,
  },
  0xfb: {
    type: INSTRUCTION_TYPE.EI,
  },
  0xfc: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xfd: {
    type: INSTRUCTION_TYPE.NONE,
  },
  0xfe: {
    type: INSTRUCTION_TYPE.CP,
    mode: ADDRESSING_MODE.R_D8,
    r1: REGISTER.A,
  },
  0xff: {
    type: INSTRUCTION_TYPE.RST,
    param: 0x38,
  },
};
