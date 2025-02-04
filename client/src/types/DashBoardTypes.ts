export interface ScrapData {
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
    total: number;
}

export interface TotalScrapData {
  data: ScrapData[];
  general_total: number;
}

export interface WeekProduction {
    day: string;
    production: number;
}

export interface AnualProduction {
    month: number;
    Goal: number;
    Producción: number;
}
