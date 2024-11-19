export interface InitParamsRegister {
    partnum: string;
    auditor: number;
    shift: '' | 1 | 2;
    mp: string;
    molder: number;
    icc: boolean;
}

export type SectionType = 'superior' | 'inferior';

export interface SecondParamsRegister {
    mold: string;
    cavities: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    metal: '' | 0.032 | 0.025 | 0.04;
    body: number;
    strips: number;
    full_cycle: number;
    cycle_time: number;
    screen: Record<SectionType, number>;
    mold2: Record<SectionType, number>;
    platen: Record<SectionType, number>;
    pressure: number;
    waste_pct: number;
}

export interface ThirdParamsRegister {
    batch: string;
    julian?: number;
    ts2?: number;
    cavities_arr: Array<number[]>;
}
