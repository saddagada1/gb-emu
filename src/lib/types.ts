//Instructions
export enum ADDRESSING_MODE {
  IMP,
  R_D16,
  R_R,
  MR_R,
  R,
  R_D8,
  R_MR,
  R_HLI,
  R_HLD,
  HLI_R,
  HLD_R,
  R_A8,
  A8_R,
  HL_SPR,
  D16,
  D8,
  D16_R,
  MR_D8,
  MR,
  A16_R,
  R_A16,
}

export enum REGISTER {
  A,
  F,
  B,
  C,
  D,
  E,
  H,
  L,
  AF,
  BC,
  DE,
  HL,
  SP,
  PC,
  IE,
  I,
}

export enum INSTRUCTION_TYPE {
  NONE,
  NOP,
  LD,
  INC,
  DEC,
  RLCA,
  ADD,
  RRCA,
  STOP,
  RLA,
  JR,
  RRA,
  DAA,
  CPL,
  SCF,
  CCF,
  HALT,
  ADC,
  SUB,
  SBC,
  AND,
  XOR,
  OR,
  CP,
  POP,
  JP,
  PUSH,
  RET,
  CB,
  CALL,
  RETI,
  LDH,
  JPHL,
  DI,
  EI,
  RST,
  ERR,
  //CB instructions...
  RLC,
  RRC,
  RL,
  RR,
  SLA,
  SRA,
  SWAP,
  SRL,
  BIT,
  RES,
  SET,
}

export enum CONDITION_TYPE {
  NONE,
  NZ,
  Z,
  NC,
  C,
}

export interface Instruction {
  type: INSTRUCTION_TYPE;
  mode?: ADDRESSING_MODE;
  r1?: REGISTER;
  r2?: REGISTER;
  condition?: CONDITION_TYPE;
  param?: number;
}

//CPU
export enum INTERRUPT_TYPE {
  VBLANK = 1,
  LCD_STAT = 2,
  TIMER = 4,
  SERIAL = 8,
  JOYPAD = 16,
}

//PPU
export enum PPU_MODE {
  OAM,
  VRAM,
  HBLANK,
  VBLANK,
}

export enum PIXEL_FETCH_STATE {
  TILE,
  DATA0,
  DATA1,
  IDLE,
  PUSH,
}

export interface LinkedData {
  value: number;
  next?: LinkedData;
}

export interface LinkedList {
  head?: LinkedData;
  tail?: LinkedData;
  size: number;
}

//General
export type Bit = 0 | 1;

export interface Context {
  a: string;
  f: string;
  b: string;
  c: string;
  d: string;
  e: string;
  h: string;
  l: string;
  af: string;
  bc: string;
  de: string;
  hl: string;
  sp: string;
  flags: { c: number; h: number; n: number; z: number };
}
