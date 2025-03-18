import api from "../config/axiosConfig";
import type React from "react";
import { useEffect, useState } from "react";
import { IoIosArrowRoundBack, IoMdAdd, IoMdCloseCircle } from "react-icons/io";
import "../App.css";
import MachineProduction from "../components/machineProduction";
import "../index.css";
import "../output.css";
import { useNavigate } from "react-router-dom";
import MonthlyGoalModal from "../components/MonthlyGoalModal";
import { toast, ToastContainer } from "react-toastify";
import type { MachineData } from "../types/PressProductionTypes";

const PressesProduction: React.FC = () => {
	const [machines, setMachines] = useState<MachineData[]>([]);
	const [totalPiecesProduced, setTotalPiecesProduced] = useState<number>(0);
	const [goalModalOpen, setGoalModalOpen] = useState(false);
	const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null);
	const [productionTotal, setProductionTotal] = useState<number | null>(null);
	const navigate = useNavigate();

	//TODO Check this function/socket,No caliber is being sent
	useEffect(() => {
		const socket = new WebSocket(
			`${import.meta.env.VITE_WEBSOCKET_BASE_URL}/ws/load_machine_data_production/`,
		);

		socket.onopen = () => {
			console.log("WebSocket Connection opened");
			socket.send(JSON.stringify({ type: "request_update" }));
		};

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				console.log("Data received:", data);

				if (data.machines_data) {
					const updatedMachines = data.machines_data.map(
						(machine: MachineData) => ({
							...machine,
							molder_number:
								machine.previous_molder_number !== "----"
									? machine.previous_molder_number
									: machine.molder_number,
						}),
					);
					setMachines(updatedMachines);
					setTotalPiecesProduced(data.total_piecesProduced);
					setProductionTotal(data.actual_produced);
				}
			} catch (error) {
				console.error(
					"Error parsing JSON:",
					error,
					"Data received:",
					event.data,
				);
			}
		};

		socket.onerror = (error) => {
			console.error("WebSocket error: ", error);
		};

		socket.onclose = (event) => {
			if (event.wasClean) {
				console.log("WebSocket connection closed cleanly");
			} else {
				console.error("WebSocket connection closed with error");
			}
			console.log("WebSocket closed: ", event);
		};

		return () => {
			console.log("Closing WebSocket");
			socket.close();
		};
	}, []);

	useEffect(() => {
		const fetchMonthlyGoalAndPercentage = async () => {
			const currentDate = new Date();
			const year = currentDate.getFullYear();
			const month = currentDate.getMonth() + 1;

			try {
				const goalResponse = await api.get(`/monthly-goal/${year}/${month}/`);
				setMonthlyGoal(goalResponse.data.target_amount);
			} catch (error) {
				console.error(
					"Error fetching monthly goal or production percentage:",
					error,
				);
			}
		};

		fetchMonthlyGoalAndPercentage();
	}, []);

	const handleMachineClick = (machineData: MachineData) => {
		navigate(`/presses_production/machine/${machineData.name}`, {
			state: { machineData },
		});
	};

	const handleCloseAllWorkedHours = async () => {
		try {
			const response = await api.get("/close_worked_hours/");
			console.log(response.data);
			toast.success("Horas trabajadas cerradas correctamente");
		} catch (error) {
			console.error("Error cerrando horas trabajadas:", error);
			toast.error("Error cerrando horas trabajadas");
		}
	};

	const handleSaveGoal = async (
		target_amount: number,
		month: number,
		year: number,
	) => {
		try {
			await api.post(
				"/monthly-goal/",
				{ year, month, target_amount },
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				},
			);
			setMonthlyGoal(target_amount);
			console.log("Monthly goal saved successfully!");
		} catch (error) {
			console.error("Error saving monthly goal: ", error);
		}
	};

	return (
		<div className="lg:p-2">
			<ToastContainer />
			<header className="flex flex-wrap items-center justify-between mt-3 mb-10 bg-orange-500 text-white p-4 w-full border-b border-white/50">
				<section>
					<IoIosArrowRoundBack
						size={65}
						className="cursor-pointer text-black"
						onClick={() => navigate("/")}
					/>
					<div className="flex flex-col md:flex-row md:items-center gap-5">
						<h1 className="font-semibold text-2xl lg:text-3xl">
							Producido hoy:
						</h1>
						<h1 className="font-semibold text-3xl lg:text-4xl">
							{totalPiecesProduced}
						</h1>
					</div>
				</section>
				<section className="flex flex-col md:items-end">
					<div className="flex flex-row gap-5">
						<h1 className="font-semibold text-2xl lg:text-3xl">Actual:</h1>
						<h1 className="font-semibold text-3xl lg:text-4xl">
							{productionTotal}
						</h1>
					</div>
					<div className="flex flex-row gap-5">
						<h1 className="font-semibold text-2xl lg:text-3xl">Meta:</h1>
						<h1 className="font-semibold text-3xl lg:text-4xl">
							{monthlyGoal}
						</h1>
					</div>
					<div className="flex flex-col md:flex-row md:items-center gap-5 p-2">
						<div className="flex gap-3">
							<button
								type="button"
								className="text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2"
								onClick={() => setGoalModalOpen(true)}
							>
								<IoMdAdd size={20} />
								Agregar meta
							</button>
							<button
								type="button"
								className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-2"
								onClick={handleCloseAllWorkedHours}
							>
								<IoMdCloseCircle size={20} />
								Cerrar todas las horas
							</button>
						</div>
					</div>
				</section>
			</header>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-2 gap-y-4 justify-items-center">
				{machines?.map((machine, index) => (
					<MachineProduction
						key={`${index}-${machine.name}`}
						machineData={machine}
						onClick={() => handleMachineClick(machine)}
					/>
				))}
			</div>

			<MonthlyGoalModal
				isOpen={goalModalOpen}
				onClose={() => setGoalModalOpen(false)}
				onSave={handleSaveGoal}
			/>
		</div>
	);
};

export default PressesProduction;
