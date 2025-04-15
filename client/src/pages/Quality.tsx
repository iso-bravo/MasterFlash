import Scrap from "../assets/scrap.png";
import { BsFillFileEarmarkCheckFill } from "react-icons/bs";
import { MdBolt } from "react-icons/md";
import { VscGitPullRequestCreate } from "react-icons/vsc";
import { FaFileAlt } from "react-icons/fa";
import Barwell from "../assets/conveyor.png";
import Troquelado from "../assets/worker.png";
import { BiSolidDashboard } from "react-icons/bi";
import { GiFactoryArm, GiNuclearWaste } from "react-icons/gi";
import { IoSettingsSharp } from "react-icons/io5";
import { FaFileInvoice } from "react-icons/fa";
import { MdNumbers } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import "../App.css";
import "../index.css";
import "../output.css";
import { TbClockPause } from "react-icons/tb";
import api from "../config/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";
import { ConfirmModal } from "../components/ConfirmModal";

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

const Quality: React.FC = () => {
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const navigate = useNavigate();

	return (
		<div className="flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-screen overflow-y-auto overflow-x-hidden">
			<ToastContainer />
			<div className="flex flex-col items-center px-10 pt-7">
				<h1 className="w-3/4 text-xl text-start m-3">Producción</h1>
				<div className="w-3/4 grid grid-cols-1 280:grid-cols-2 400:grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-4 justify-items-center">
					<button
						type="button"
						className="flex flex-col w-14 items-center cursor-pointer"
						onClick={() => navigate("/presses_production")}
					>
						<div className=" bg-[#C67C38] p-2 rounded-sm">
							<VscGitPullRequestCreate color="white" size={40} className="" />
						</div>
						<h2 className=" text-center">Prod. Prensas</h2>
					</button>
					<button
						type="button"
						className="flex flex-col w-14 items-center cursor-pointer"
						onClick={() => setShowConfirmModal(true)}
					>
						<div className=" bg-[#8F2C2C] p-2 rounded-sm">
							<TbClockPause color="white" size={40} className="" />
						</div>
						<h2 className=" text-center">Cerrar horas </h2>
					</button>
					<button
						type="button"
						className="flex flex-col w-14 items-center cursor-pointer"
						onClick={() => navigate("/presses_states")}
					>
						<div className=" bg-[#78A5B4] p-2 rounded-sm">
							<MdBolt color="white" size={40} />
						</div>
						<h2 className=" text-center">Estados Prensas</h2>
					</button>
					<button
						type="button"
						className="flex flex-col w-14 items-center cursor-pointer"
						onClick={() => navigate("/production_records")}
					>
						<div className=" bg-[#B75182] p-3 rounded-sm">
							<FaFileAlt color="white" size={35} />
						</div>
						<h2 className=" text-center ">Registros Producción</h2>
					</button>
					<div className="flex flex-col items-center cursor-pointer">
						<div className=" bg-[#6A3A90] p-2 rounded-sm">
							<img src={Barwell} className=" w-10" alt="Barwell" />
						</div>
						<h2 className=" text-center">Barwell</h2>
					</div>
					<div className="flex flex-col items-center cursor-pointer">
						<div className=" bg-[#8F2C2C] p-2 rounded-sm">
							<img src={Troquelado} className=" w-10" alt="Troquelado" />
						</div>
						<h2 className=" text-center">Troquelado</h2>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center py-5 px-10">
				<h1 className="w-3/4 text-xl m-3">Calidad</h1>
				<div className="w-3/4 grid grid-cols-1 280:grid-cols-2 400:grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-4 justify-items-center">
					<button
						type="button"
						className="flex flex-col w-14 items-center cursor-pointer"
						onClick={() => navigate("/params")}
					>
						<div className=" bg-[#538D4A] p-3 rounded-sm">
							<BsFillFileEarmarkCheckFill
								color="white"
								size={35}
								className=""
							/>
						</div>
						<h2 className=" text-center">Reg. Params.</h2>
					</button>
					<button
						type="button"
						className="flex flex-col items-center cursor-pointer"
						onClick={() => navigate("/scrap_summary")}
					>
						<div className=" bg-[#6A3A90] p-2 rounded-sm">
							<img src={Scrap} className=" w-10" alt="Scrap" />
						</div>
						<h2 className=" text-center">Reg. Scrap</h2>
					</button>
					<div className="flex flex-col w-14 items-center cursor-pointer">
						<div className="p-3 rounded-sm bg-[#2459A9]">
							<GiNuclearWaste color="white" size={35} />
						</div>
						<h2 className="text-center"> Reg. Waste</h2>
					</div>
					<button
						type="button"
						className="flex flex-col w-14 items-center cursor-pointer"
						onClick={() => navigate("/reports_menu")}
					>
						<div className=" bg-[#C67C38] p-3 rounded-sm">
							<FaFileAlt color="white" size={35} />
						</div>
						<h2 className=" text-center">Reportes</h2>
					</button>
					<div className="flex flex-col items-center 300:invisible cursor-pointer">
						<div className=" bg-[#8F2C2C] p-2 rounded-sm">
							<img src={Troquelado} className=" w-10" alt="Troquelado" />
						</div>
						<h2 className=" text-center">Troquelado</h2>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center px-10">
				<h1 className="w-3/4 text-xl m-3">Planeación</h1>
				<div className="w-3/4 grid grid-cols-1 280:grid-cols-2 400:grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-4 justify-items-center">
					<button
						type="button"
						className="flex flex-col w-14 items-center cursor-pointer"
						onClick={() => navigate("/dashboard")}
					>
						<div className=" bg-[#8F2C2C] p-2 rounded-sm">
							<BiSolidDashboard color="white" size={40} className="" />
						</div>
						<h2 className=" text-center">Dash.</h2>
					</button>
					<div className="flex flex-col w-14 items-center cursor-pointer">
						<div className=" bg-[#538D4A] p-3 rounded-sm">
							<FaFileInvoice color="white" size={35} />
						</div>
						<h2 className=" text-center">OT</h2>
					</div>
					<div className="flex flex-col items-center cursor-pointer">
						<div className=" bg-[#78A5B4] p-2 rounded-sm">
							<FaFileInvoice color="white" size={35} />
						</div>
						<h2 className=" text-center">Prog. Prod.</h2>
					</div>
				</div>
			</div>
			<div className="flex flex-col items-center px-10">
				<h1 className="w-3/4 text-xl m-3">Configuración</h1>
				<div className="w-3/4 grid grid-cols-1 280:grid-cols-2 400:grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-4 justify-items-center">
					<button
						type="button"
						className="flex flex-col w-14 items-center cursor-pointer"
						onClick={() => navigate("/config")}
					>
						<div className=" bg-[#2459A9] p-2 rounded-sm">
							<IoSettingsSharp color="white" size={40} />
						</div>
						<h2 className=" text-center">Config.</h2>
					</button>
					<button
						type="button"
						className="flex flex-col items-center cursor-pointer"
						onClick={() => navigate("/part_num")}
					>
						<div className=" bg-[#B75182] p-2 rounded-sm">
							<MdNumbers color="white" size={35} />
						</div>
						<h2 className=" text-center">No. Parte</h2>
					</button>
					<button
						type="button"
						className="flex flex-col items-center cursor-pointer"
						onClick={() => navigate("/inserts")}
					>
						<div className=" bg-[#C67C38] p-2 rounded-sm">
							<GiFactoryArm color="white" size={35} />
						</div>
						<h2 className=" text-center">Insertos</h2>
					</button>
				</div>
				{showConfirmModal && (
					<ConfirmModal
						title="Cerrar horas trabajadas"
						message="¿Estás seguro de que quieres cerrar todas las horas trabajadas?"
						onConfirm={handleCloseAllWorkedHours}
						onClose={() => setShowConfirmModal(false)}
					/>
				)}
			</div>
		</div>
	);
};

export default Quality;
