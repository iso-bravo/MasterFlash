import { useCallback, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import DashboardCard from "../components/DashboardCard";
import Header from "../components/Header";
import MachineDefectsChart from "../components/MachineDefectsChart";
import api from "../config/axiosConfig";
import type {
	ScrapResponse,
	TopDefectsByMPResponse,
	TopDefectsByMolderNumberResponse,
	TopDefectsByPartNumberResponse,
} from "../types/ScrapDashboardTypes";
import PartNumDefectsChart from "../components/PartNumDefectsChart";
import MolderNumberDefectChart from "../components/MolderNumberDefectChart";
import ScrapDashboardTable from "../components/ScrapDashboardTable";

const ScrapDashboard = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [chartsLoading, setChartsLoading] = useState(false);
	const [tableData, setTableData] = useState<ScrapResponse>([]);
	const [scrapByMpData, setScrapByMpData] = useState<TopDefectsByMPResponse>(
		[],
	);
	const [scrapByPartNumData, setScrapByPartNumData] =
		useState<TopDefectsByPartNumberResponse>([]);
	const [scrapByMolderNumber, setScrapByMolderNumber] =
		useState<TopDefectsByMolderNumberResponse>([]);

	const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.name === "start_date") {
			console.log(e.target.value);
			setStartDate(e.target.value);
		}
		if (e.target.name === "end_date") {
			console.log(e.target.value);
			setEndDate(e.target.value);
		}
	};

	const fetchScrapByMachine = useCallback(async () => {
		try {
			const response = await api.post("scrap-dashboard/top-def-by-mp/", {
				start_date: startDate,
				end_date: endDate,
			});

			setScrapByMpData(response.data);
		} catch (error) {
			console.error("Error fetching scrap by machines:", error);
			toast.error("Error fetching scrap by machines");
		}
	}, [startDate, endDate]);

	const fetchScrapByPartNum = useCallback(async () => {
		try {
			const response = await api.post("scrap-dashboard/top-def-by-part-num/", {
				start_date: startDate,
				end_date: endDate,
			});
			setScrapByPartNumData(response.data);
		} catch (error) {
			console.error("Error fetching scrap by part number:", error);
			toast.error("Error fetching scrap by part number");
		}
	}, [startDate, endDate]);

	const fetchScrapByMolderNum = useCallback(async () => {
		try {
			const response = await api.post("scrap-dashboard/top-def-by-mold-num/", {
				start_date: startDate,
				end_date: endDate,
			});
			setScrapByMolderNumber(response.data);
		} catch (error) {
			console.error("Error fetching scrap by part number:", error);
			toast.error("Error fetching scrap by molder number");
		}
	}, [startDate, endDate]);

	const fetchScrapTableData = async () => {
		if (!startDate || !endDate) {
			toast.error("Selecciona un rango de fechas");
			return;
		}
		try {
			setLoading(true);
			const response = await api.post("scrap-dashboard/", {
				start_date: startDate,
				end_date: endDate,
			});
			console.log(response.data);
			setTableData(response.data);
		} catch (error) {
			console.error("Error fetching machines:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleFetchData = async () => {
		if (!startDate || !endDate) {
			toast.error("Selecciona un rango de fechas válido");
			return;
		}

		try {
			setLoading(true);
			setChartsLoading(true);

			// Ejecutar todas las peticiones en paralelo
			await Promise.all([
				fetchScrapTableData(),
				fetchScrapByMachine(),
				fetchScrapByPartNum(),
				fetchScrapByMolderNum(),
			]);
		} catch (error) {
			console.error("Error fetching data: ", error);
			toast.error("Error cargando datos");
		} finally {
			setLoading(false);
			setChartsLoading(false);
		}
	};

	return (
		<div className="flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-screen overflow-y-auto overflow-x-hidden">
			<ToastContainer
				position="top-center"
				autoClose={false}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				theme="colored"
			/>
			<Header title="Scrap Analysis" goto="/reports_menu" />
			<h2 className="">Selecciona un rango de fechas</h2>
			<section className="bg-white p-6 rounded-lg shadow-sm mb-6">
				<h2 className="text-lg font-semibold text-gray-700 mb-4">
					Selecciona un rango de fechas
				</h2>

				<div className="flex flex-col md:flex-row gap-4 items-end">
					<div className="flex gap-4 w-full md:w-auto">
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fecha Inicio
							</label>
							<input
								name="start_date"
								type="date"
								className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								onChange={handleDatePick}
								value={startDate}
							/>
						</div>

						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fecha Fin
							</label>
							<input
								name="end_date"
								type="date"
								className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								onChange={handleDatePick}
								value={endDate}
							/>
						</div>
					</div>

					<button
						onClick={handleFetchData}
						disabled={!startDate || !endDate || loading}
						className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
					>
						{loading ? (
							<svg
								className="animate-spin h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						) : (
							"Aplicar filtros"
						)}
					</button>
				</div>
			</section>
			<section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{chartsLoading ? (
					Array(3)
						.fill(0)
						.map((_, i) => (
							<div
								key={i}
								className="bg-white p-4 rounded-lg shadow-sm h-80 animate-pulse"
							>
								<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
								<div className="h-full bg-gray-100 rounded"></div>
							</div>
						))
				) : (
					<>
						<DashboardCard title="Defectos por MP" color="bg-orange-500">
							<MachineDefectsChart data={scrapByMpData} />
						</DashboardCard>
						<DashboardCard title="Defectos por Part Number" color="bg-teal-500">
							<PartNumDefectsChart data={scrapByPartNumData} />
						</DashboardCard>
						<DashboardCard
							title="Defectos por Molder Number"
							color="bg-amber-500"
						>
							<MolderNumberDefectChart data={scrapByMolderNumber} />
						</DashboardCard>
					</>
				)}
			</section>
			<section className="bg-white rounded-lg shadow-sm overflow-hidden">
				<ScrapDashboardTable
					data={tableData}
					isLoading={loading}
					className="rounded-lg"
				/>
			</section>
		</div>
	);
};

export default ScrapDashboard;
