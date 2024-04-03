export type GeneralPurposeRegister = "a" | "b" | "c" | "d" | "e" | "f" | "h" | "l";

export type SpecialPurposeRegister = "i" | "r" | "pc" | "sp" | "ime";

export type Clock = "m" | "t";

export type FunctionArray = Array<() => void>;

export type Ops = {
  [key: number]: FunctionArray;
};

export type BitIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
