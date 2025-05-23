export interface MachineData {
	name: string;
	state: string;
	employee_number: string;
	pieces_ok: number;
	pieces_rework: number;
	caliber: number;
	part_number: string;
	work_order: string;
	pieces_order: number;
	total_ok: number;
	molder_number: string;
	piecesOrder: number;
	start_time: string;
	end_time: string | null;
	worked_hours_id: number | null;
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
	piecesOrder: number;
	molderNumber: string;
	start_time: string;
	end_time: string | null;
	worked_hours_id: number | null;
	relay: boolean;
	relayNumber?: string;
}

export interface WorkedHours {
	duration?: number;
	start_time?: string;
}

export interface ProductionPerDay {
	part_number: string;
	total_pieces_ok: number;
}
