import { InstructionName, RegisterName } from "./constants";
import { ADDRESSING_MODE, Bit, Instruction } from "./types";

export function getBit({ n, bit }: { n: number; bit: number }): Bit {
  return n & (1 << bit) ? 1 : 0;
}

export function setBit({ n, bit, val }: { n: number; bit: number; val: Bit }) {
  switch (val) {
    case 0:
      n &= ~(1 << bit);
      return n;
    case 1:
      n |= 1 << bit;
      return n;
  }
}

export function getColour(code: number) {
  switch (code) {
    case 0xffffff:
      return "#ffffff";
    case 0xaaaaaa:
      return "#aaaaaa";
    case 0x555555:
      return "#555555";
    case 0x000000:
      return "#000000";
    default:
      return "#000000";
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function instructionToString(instruction: Instruction, data: number) {
  const base = `INSTRUCTION: ${InstructionName[instruction.type]}`;
  switch (instruction.mode) {
    case ADDRESSING_MODE.IMP:
      return base;
    case ADDRESSING_MODE.R_D16:
    case ADDRESSING_MODE.R_A16:
      return `${base} ${RegisterName[instruction.r1!]} $${data.toString(16)}`;

    case ADDRESSING_MODE.R:
      return `${base} ${RegisterName[instruction.r1!]}`;

    case ADDRESSING_MODE.R_R:
      return `${base} ${RegisterName[instruction.r1!]} ${RegisterName[instruction.r2!]}`;
    case ADDRESSING_MODE.MR_R:
      return `${base} (${RegisterName[instruction.r1!]}) ${RegisterName[instruction.r2!]}`;
    case ADDRESSING_MODE.MR:
      return `${base} (${RegisterName[instruction.r1!]})`;
    case ADDRESSING_MODE.R_MR:
      return `${base} ${RegisterName[instruction.r1!]} (${RegisterName[instruction.r2!]})`;

    case ADDRESSING_MODE.R_D8:
      return `${base} ${RegisterName[instruction.r1!]} $${(data & 0xff).toString(16)}`;
    case ADDRESSING_MODE.R_A8:
      return `${base} ${RegisterName[instruction.r1!]} ($${(data & 0xff).toString(16)})`;

    case ADDRESSING_MODE.R_HLI:
      return `${base} ${RegisterName[instruction.r1!]} (${
        RegisterName[instruction.r2!]
      }+) (${data.toString(16)})`;

    case ADDRESSING_MODE.R_HLD:
      return `${base} ${RegisterName[instruction.r1!]} (${
        RegisterName[instruction.r2!]
      }-) (${data.toString(16)})`;

    case ADDRESSING_MODE.HLI_R:
      return `${base} (${RegisterName[instruction.r1!]}+) (${data.toString(16)}) ${
        RegisterName[instruction.r2!]
      }`;

    case ADDRESSING_MODE.HLD_R:
      return `${base} (${RegisterName[instruction.r1!]}-) (${data.toString(16)}) ${
        RegisterName[instruction.r2!]
      }`;

    case ADDRESSING_MODE.A8_R:
      return `${base} ($${(data & 0xff).toString(16)}) ${RegisterName[instruction.r2!]}`;

    case ADDRESSING_MODE.HL_SPR:
      return `${base} (${RegisterName[instruction.r1!]}) SP+$${(data & 0xff).toString(16)}`;

    case ADDRESSING_MODE.D8:
      return `${base} $${(data & 0xff).toString(16)}`;

    case ADDRESSING_MODE.D16:
      return `${base} $${data.toString(16)}`;

    case ADDRESSING_MODE.MR_D8:
      return `${base} (${RegisterName[instruction.r1!]}) $${(data & 0xff).toString(16)}`;

    case ADDRESSING_MODE.A16_R:
      return `${base} ($${data.toString(16)}) ${RegisterName[instruction.r2!]}`;

    default:
      return base;
  }
}
