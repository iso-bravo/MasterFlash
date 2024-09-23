export interface InitParamsRegister {
    partnum: string;
    auditor: number;
    turn: '' | 1 | 2;
    mp: string;
    molder: number;
    icc: boolean;
}

export type SectionType = 'Superior' | 'Inferior';

export interface SecondParamsRegister {
    mold: string;
    cavities: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    metal: '' | 0.032 | 0.025 | 0.040;
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

export interface IccParamsRegister {
    batch: string;
    julian: number;
    cavities_arr: Array<number[]>;
}

export interface ThirdParamsRegister {
    batch: string;
    ts2: number;
    cavities_arr: Array<number[]>;
}
