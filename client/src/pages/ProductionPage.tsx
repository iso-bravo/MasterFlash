import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import type {
	FormMachineData,
	MachineData,
	ProductionPerDay,
} from "../types/PressProductionTypes";
import PiecesPerOrderModal from "../components/PiecesPerOrderModal";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import api from "../config/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import ProductionPerDayTable from "../components/ProductionPerDayTable";
import axios from "axios";

const ProductionPage = () => {
	const navigate = useNavigate();
	const { machineName } = useParams();
	const location = useLocation();
	const machineData: MachineData | undefined =
		location.state?.machineData || undefined;

	const { register, handleSubmit, setValue, reset, watch } =
		useForm<FormMachineData>({
			defaultValues: {
				employeeNumber: "",
				partNumber: "",
				caliber: 0,
				piecesOK: 0,
				piecesRework: 0,
				piecesOrder: 0,
				workOrder: "",
				molderNumber: "",
				start_time: "",
				end_time: null,
				relay: false,
				relayNumber: "",
			},
		});

	const relay = watch("relay");

	const [isEndTime, setIsEndTime] = useState(false);
	const [production_per_day, setProduction_per_day] = useState<
		ProductionPerDay[]
	>([]);
	const [isFormLocked, setIsFormLocked] = useState(false);
	const [isStock, setIsStock] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [pendingData, setPendingData] = useState<FormMachineData | null>(null);

	useEffect(() => {
		const fetchShifts = async () => {
			try {
				const now = new Date();
				const hours = now.getHours().toString().padStart(2, "0");
				const minutes = now.getMinutes().toString().padStart(2, "0");
				const currentTime = `${hours}:${minutes}`;

				const shiftResponse = await api.get(
					`/get_actual_shift/?time=${currentTime}`,
				);
				const shift = shiftResponse.data.shift;

				const response = await api.get(
					`/get_todays_machine_production/?mp=${machineData?.name}&shift=${shift}`,
				);
				console.log(response.data);
				setProduction_per_day(response.data);
			} catch (error) {
				console.error("Error fetching shift schedule:", error);
			}
		};
		fetchShifts();
	}, [machineData?.name]);

	useEffect(() => {
		// Reiniciar el  formulario completamente si no hay worked_hours_id
		console.log("machineData", machineData);
		if (!machineData?.worked_hours_id) {
			reset({
				employeeNumber: "",
				partNumber: "",
				caliber: 0,
				piecesOK: 0,
				piecesRework: 0,
				workOrder: "",
				molderNumber: "",
				start_time: "",
				end_time: null,
				relay: false,
				relayNumber: "",
			});
		} else {
			// Mantener lógica original si hay worked_hours activo
			reset({
				employeeNumber: machineData?.employee_number,
				partNumber: machineData?.part_number,
				caliber: machineData?.caliber,
				workOrder: machineData?.work_order,
				molderNumber: machineData?.molder_number,
				piecesOrder: machineData?.pieces_order,
				start_time: machineData?.start_time
					? machineData.start_time.split("+")[0]
					: "",
				relay: false,
				relayNumber: "",
			});
		}
		setIsFormLocked(!!machineData?.worked_hours_id);
	}, [machineData, reset]);

	useEffect(() => {
		if (relay) {
			setValue("piecesOK", 0);
			setValue("start_time", "");
		}
	}, [relay, setValue]);

	useEffect(() => {
		if (!relay) setValue("relayNumber", "");
	}, [relay, setValue]);

	const submitData = async (data: FormMachineData) => {
		if (!machineData) return;

		const isRelay = !!data.relayNumber;
		const previousMolderNumber = isRelay ? data.molderNumber : null;
		const molderNumberToSave = data.relayNumber || data.molderNumber;

		if (data.relay && !data.relayNumber) {
			toast.error("Debe ingresar el número del relevo");
			return;
		}

		if (data.relay) {
			if (!data.start_time) {
				toast.error("El relevo debe tener una hora de inicio");
				return;
			}
		}

		if (!data.partNumber && machineData?.part_number === "----") {
			toast.error("Debe ingresar un numero de parte");
			return;
		}

		const updatedMachine: MachineData = {
			...machineData,
			employee_number: data.employeeNumber || machineData.employee_number,
			pieces_ok: Number(data.piecesOK),
			pieces_rework: Number(data.piecesRework) ?? machineData.pieces_rework,
			part_number: data.partNumber || machineData.part_number,
			work_order: data.workOrder || machineData.work_order,
			pieces_order: Number(data.piecesOrder) || machineData.pieces_order,
			caliber: data.caliber || machineData.caliber,
			molder_number: molderNumberToSave,
			start_time: data.start_time || machineData.start_time,
			end_time: data.end_time,
			worked_hours_id: machineData.worked_hours_id,
			is_relay: isRelay,
			previous_molder_number: previousMolderNumber,
		};
		if (!data.start_time && !machineData.start_time) {
			toast.error("No se puede guardar la producción sin la hora de inicio.");
			return;
		}

		try {
			console.log("Enviando datos actualizados:", updatedMachine);
			const response = await api.post(
				"/register_data_production/",
				updatedMachine,
				{
					headers: { "Content-Type": "application/json" },
				},
			);
			console.log(response.data);
			toast.success("Producción guardada con éxito!");
			navigate("/presses_production");
		} catch (error: unknown) {
			console.error("Error al guardar producción:", error);
			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message || "Error desconocido del servidor";
				toast.error(errorMessage);
			} else {
				toast.error("Error al guardar producción");
			}
		}
	};

	const handleSave = async (data: FormMachineData) => {
		if (
			(machineData?.pieces_ok || machineData?.pieces_ok === 0) &&
			machineData?.worked_hours_id !== null
		)
			if (Number(data.piecesOK) + machineData?.pieces_ok > data.piecesOrder) {
				setPendingData(data);
				setIsModalOpen(true);
				return;
			}
		await submitData(data);
	};

	const handleConfirmSubmit = async () => {
		if (pendingData) {
			await submitData(pendingData);
			setPendingData(null);
			setIsModalOpen(false);
		}
	};

	if (!machineData) {
		toast.error("No se encontró información de la máquina.");
		navigate("/presses_production");
		return null;
	}

	return (
		<div className="flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-screen overflow-y-auto overflow-x-hidden">
			<ToastContainer position="top-center" theme="colored" />
			<section className="bg-white rounded-lg shadow-md p-2 mb-2 flex justify-between items-center">
				<Header
					title={`Producción - ${machineName}`}
					goto="/presses_production"
				/>
				<h1 className="text-3xl font-bold text-gray-800">{machineData.name}</h1>
				<div className="bg-blue-50 p-4 rounded-lg">
					<p className="text-lg font-semibold text-blue-800">
						Piezas producidas
					</p>
					<p className="text-2xl font-bold text-blue-600">
						{machineData.pieces_ok}
					</p>
				</div>
			</section>
			<form
				onSubmit={handleSubmit(handleSave)}
				className="bg-white rounded-lg shadow-md p-6 space-y-6"
			>
				<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
						<span className="text-lg font-medium text-gray-700">Relevo</span>
						<label className="inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								className="sr-only peer"
								{...register("relay")}
							/>
							<div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600" />
						</label>
					</div>

					<div className="flex items-center justify-between bg-orange-50 p-4 rounded-lg">
						<span className="text-lg font-medium text-gray-700">
							Finalizar{" "}
						</span>
						<label className="inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								className="sr-only peer"
								checked={!!isEndTime}
								onChange={() => setIsEndTime(!isEndTime)}
							/>
							<div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600" />
						</label>
					</div>
				</section>
				<article className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<label
							htmlFor="employeeNumberInput"
							className="block text-sm font-medium text-gray-700"
						>
							Empacador
						</label>
						<input
							id="employeeNumberInput"
							type="number"
							{...register("employeeNumber" as keyof FormMachineData)}
							className="w-full h-12 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
							min={0}
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="molderNumberInput"
							className="block text-sm font-medium text-gray-700"
						>
							Moldeador
						</label>
						<input
							id="molderNumberInput"
							type="number"
							{...register("molderNumber" as keyof FormMachineData)}
							className={`w-full h-12 px-4 border rounded-lg ${
								isFormLocked
									? "bg-gray-100 cursor-not-allowed"
									: "focus:ring-2 focus:ring-blue-500"
							}`}
							disabled={isFormLocked}
							min={0}
						/>
					</div>
					<div className="space-y-2">
						<label
							htmlFor="workOrder"
							className="block text-sm font-medium text-gray-700"
						>
							Orden de Trabajo
						</label>
						<div className="flex items-center gap-3">
							<input
								id="workOrder"
								type="text"
								{...register("workOrder")}
								className={`w-full h-12 px-4 border rounded-lg ${
									isStock || isFormLocked
										? "bg-gray-100 text-gray-500 cursor-not-allowed"
										: "focus:ring-2 focus:ring-blue-500"
								}`}
								value={isStock ? "Stock" : undefined}
								readOnly={isFormLocked || isStock}
							/>
							<label className="inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									tabIndex={-1}
									className="sr-only peer"
									checked={isStock}
									disabled={isFormLocked}
									onChange={() => setIsStock(!isStock)}
								/>
								<div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all" />
							</label>
						</div>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="partNumberInput"
							className="block text-sm font-medium text-gray-700"
						>
							Número de Parte
						</label>
						<input
							id="partNumberInput"
							type="text"
							{...register("partNumber" as keyof FormMachineData)}
							className={`w-full h-12 px-4 border rounded-lg ${
								// isFormLocked
								// ? "bg-gray-100 cursor-not-allowed"
								/* : */ "focus:ring-2 focus:ring-blue-500"
							}`}
							// disabled={isFormLocked}
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="caliberInput"
							className="block text-sm font-medium text-gray-700"
						>
							Calibre
						</label>
						<input
							id="caliberInput"
							type="number"
							step={0.001}
							min={0}
							{...register("caliber" as keyof FormMachineData)}
							className="w-full h-12 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="piecesOrder"
							className="block text-sm font-medium text-gray-700"
						>
							Piezas por Orden
						</label>
						<input
							type="number"
							{...register("piecesOrder")}
							className="w-full h-12 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
							min={0}
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="start_time"
							className="block text-sm font-medium text-gray-700"
						>
							Hora de inicio
						</label>
						<input
							type="datetime-local"
							{...register("start_time")}
							className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="piecesOK"
							className="block text-sm font-medium text-gray-700"
						>
							Piezas producidas
						</label>
						<input
							type="number"
							{...register("piecesOK")}
							className="w-full h-16 px-6 border-2 border-blue-500 bg-blue-50 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-700 shadow-md text-xl font-bold text-blue-900"
							min={0}
						/>
					</div>

					{(isEndTime || relay) && (
						<div className="space-y-2">
							<label
								htmlFor="end_time"
								className="block text-sm font-medium text-gray-700"
							>
								Hora de finalización
							</label>
							<input
								id="end_time"
								type="datetime-local"
								{...register("end_time")}
								className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					)}
					{relay && (
						<div className="space-y-2">
							<label
								htmlFor="relayNumberInput"
								className="block text-sm font-medium text-gray-700"
							>
								Número del Relevo
							</label>
							<input
								id="relayNumberInput"
								type="number"
								{...register("relayNumber")}
								className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Ingrese número del relevo"
								min="0"
							/>
						</div>
					)}

					{isModalOpen && (
						<PiecesPerOrderModal
							onClose={() => setIsModalOpen(false)}
							onAccept={handleConfirmSubmit}
						/>
					)}
				</article>

				<ProductionPerDayTable data={production_per_day} />

				<button
					type="submit"
					className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
				>
					Guardar
				</button>
			</form>
		</div>
	);
};

export default ProductionPage;
