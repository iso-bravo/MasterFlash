export interface MachineData {
    name: string;
    state: string;
    employee_number: string;
    pieces_ok: number;
    pieces_rework: number;
    part_number: string;
    work_order: string;
    total_ok: number;
    molder_number: string;
    is_relay: boolean;
    previous_molder_number: string | null;
}

export interface FormMachineData {
    employeeNumber: string;
    piecesOK: number;
    piecesRework: number;
    partNumber: string;
    workOrder: string;
    molderNumber: string;
    relay: boolean;
    relayNumber?: string;
}