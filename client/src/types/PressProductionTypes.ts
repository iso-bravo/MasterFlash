export interface MachineData {
    name: string;
    state: string;
    employee_number: string;
    pieces_ok: number;
    pieces_rework: number;
    caliber: number;
    part_number: string;
    work_order: string;
    total_ok: number;
    molder_number: string;
    start_time: string;
    end_time: string | null;
    is_relay: boolean;
    previous_molder_number: string | null;
}

export interface FormMachineData {
    employeeNumber: string;
    caliber: number;
    piecesOK: number;
    piecesRework: number;
    partNumber: string;
    workOrder: string;
    molderNumber: string;
    start_time: string;
    end_time: string | null;
    relay: boolean;
    relayNumber?: string;
}

export interface ProductionPerDay{
    part_number: string;
    total_pieces_ok: number
}