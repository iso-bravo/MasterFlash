import Header from "../components/Header";
import { useState } from "react";
import { type ScrapResponse } from "../types/ScrapDashboardTypes";
import { toast, ToastContainer } from "react-toastify";
import api from "../config/axiosConfig";

const ScrapDashboard = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState<ScrapResponse>([]);

	const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.name === "start_date") {
			setStartDate(e.target.value);
		}
		if (e.target.name === "end_date") {
			setEndDate(e.target.value);
		}
	};

	const fetchScrapTableData = async () => {
		if (!startDate || !endDate) {
			toast.error("Selecciona un rango de fechas");
			return;
		}
		try {
			setLoading(true);
			const response = await api.post("/scrap_dashboard", {
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
			<section className="">
				<h2>Selecciona un rango de fechas</h2>
				<div>
					<label
						htmlFor="start_date"
						className="block mb-2 text-sm font-medium text-gray-900"
					>
						Fecha Inicio
					</label>
					<input
						name="start_date"
						type="date"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						onChange={handleDatePick}
						value={startDate}
					/>
				</div>
				<div>
					<label
						htmlFor="end_date"
						className="block mb-2 text-sm font-medium text-gray-900"
					>
						Fecha Fin
					</label>
					<input
						name="end_date"
						type="date"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						onChange={handleDatePick}
						value={endDate}
					/>
				</div>
				<button
					className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
					onClick={fetchScrapTableData}
					disabled={!startDate || !endDate || loading}
				>
					{loading ? "Cargando..." : "Aplicar filtros"}
				</button>
			</section>
		</div>
	);
};

export default ScrapDashboard;
