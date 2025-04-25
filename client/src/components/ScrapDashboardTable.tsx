import type { ScrapResponse, DefectCode } from "../types/ScrapDashboardTypes";

interface ScrapDashboardTableProps {
	data: ScrapResponse;
	isLoading?: boolean;
	className?: string;
}

const ScrapDashboardTable: React.FC<ScrapDashboardTableProps> = ({
	data,
	isLoading,
	className,
}) => {
	const defectCodes: DefectCode[] = [
		"B",
		"CC",
		"CD",
		"CH",
		"CM",
		"CMB",
		"CR",
		"CROP",
		"CS",
		"D",
		"DI",
		"DP",
		"F",
		"FC",
		"FPM",
		"FPO",
		"GA",
		"GM",
		"H",
		"_ID",
		"IM",
		"IMC",
		"IP",
		"IR",
		"M",
		"MR",
		"O",
		"PD",
		"PR",
		"Q",
		"R",
		"RC",
		"RPM",
		"SG",
		"SI",
		"SL",
		"SR",
	];

	return (
		<div
			className={`relative overflow-x-auto shadow-md sm:rounded-lg ${className}`}
		>
			<table className="w-full text-sm text-left text-gray-500">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50">
					<tr>
						<th scope="col" className="px-6 py-3">
							Fecha/Hora
						</th>
						<th scope="col" className="px-6 py-3">
							Línea
						</th>
						<th scope="col" className="px-6 py-3">
							Molde
						</th>
						<th scope="col" className="px-6 py-3">
							Número Parte
						</th>
						<th scope="col" className="px-6 py-3">
							Calibre
						</th>
						<th scope="col" className="px-6 py-3">
							Total Piezas
						</th>
						{defectCodes.map((code) => (
							<th key={code} scope="col" className="px-6 py-3">
								{code}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{isLoading ? (
						<tr>
							<td colSpan={defectCodes.length + 6} className="px-6 py-4">
								<div className="animate-pulse flex space-x-4">
									<div className="flex-1 space-y-3 py-1">
										{[...Array(6 + defectCodes.length)].map((_, i) => (
											<div
												key={i}
												className="h-4 bg-gray-200 rounded w-full"
											></div>
										))}
									</div>
								</div>
							</td>
						</tr>
					) : (
						data.map((entry, index) => (
							<tr
								key={index}
								className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
							>
								<td className="px-6 py-4 whitespace-nowrap">
									{entry.date_time}
								</td>
								<td className="px-6 py-4">{entry.line}</td>
								<td className="px-6 py-4">{entry.molder_number}</td>
								<td className="px-6 py-4">{entry.part_number}</td>
								<td className="px-6 py-4">{entry.caliber}</td>
								<td className="px-6 py-4">{entry.total_pieces}</td>
								{defectCodes.map((code) => (
									<td key={code} className="px-6 py-4">
										{entry.defects[code] || "-"}
									</td>
								))}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
};

export default ScrapDashboardTable;
