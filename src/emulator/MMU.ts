export class MMU {
  rb(addr: number): number {
    return 0;
  }

  rw(addr: number): number {
    return 1;
  }

  wb(addr: number, val: number): number {
    return 0;
  }

  ww(addr: number, val: number): number {
    return 1;
  }
}