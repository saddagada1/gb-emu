import { Bit } from "./types";

export function getBit({ n, bit }: { n: number; bit: number }): Bit {
  return n & (1 << bit) ? 1 : 0;
}

export function setBit({ n, bit, val }: { n: number; bit: number; val: Bit }) {
  switch (val) {
    case 0:
      n |= ~(1 << bit);
      return n;
    case 1:
      n |= 1 << bit;
      return n;
    default:
      return n;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
