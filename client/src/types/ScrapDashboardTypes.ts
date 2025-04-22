export interface ScrapEntry {
	date_time: string;
	line: string;
	molder_number: number;
	part_number: string;
	caliber: number;
	total_pieces: number;
	defects: {
		[code in DefectCode]?: number | null;
	};
}

export type DefectCode =
	| "B"
	| "CC"
	| "CD"
	| "CH"
	| "CM"
	| "CMB"
	| "CR"
	| "CROP"
	| "CS"
	| "D"
	| "DI"
	| "DP"
	| "F"
	| "FC"
	| "FPM"
	| "FPO"
	| "GA"
	| "GM"
	| "H"
	| "_ID"
	| "IM"
	| "IMC"
	| "IP"
	| "IR"
	| "M"
	| "MR"
	| "O"
	| "PD"
	| "PR"
	| "Q"
	| "R"
	| "RC"
	| "RPM"
	| "SG"
	| "SI"
	| "SL"
	| "SR";

export type ScrapResponse = ScrapEntry[];
