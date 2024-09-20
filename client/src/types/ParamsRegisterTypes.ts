export interface InitParamsRegister {
    partnum: string;
    auditor: string;
    turn: '' | 1 | 2;
    mp: string;
    molder: string;
    icc: boolean;
}

export type SectionType = 'Superior' | 'Inferior';

export interface SecondParamsRegister {
    mold: string;
    cavities: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    metal: string;
    body: string;
    strips: string;
    full_cycle: string;
    cycle_time: string;
    screen: Record<SectionType, string>;
    mold2: Record<SectionType, string>;
    platen: Record<SectionType, string>;
    pressure: number;
    waste_pct: number;
}

export interface IccParamsRegister {
    batch: string;
    julian: string;
    cavities_arr: Array<number[]>;
}

export interface ThirdParamsRegister {
    batch: string;
    ts2: string;
    cavities_arr: Array<number[]>;
}
