
export interface scrapData {
  molder_number: string;
  CS?: number;
  CROP?: number;
  DP?: number;
  DI?: number;
  F?: number;
  FC?: number;
  FPO?: number;
  GA?: number;
  GM?: number;
  H?: number;
  IM?: number;
  IMC?: number;
  IR: number;
  M?: number;
  MR?: number;
  R?: number;
  SG?: number;
  SI?: number;
}

export interface WeekProduction {
  day: string;
  pieces_ok: number;
}

export interface AnualProduction {
month: string;
goal: number;
pieces_ok: number;
}
