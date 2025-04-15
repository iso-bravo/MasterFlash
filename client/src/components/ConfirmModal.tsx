import Modal from "./Modal";

interface ConfirmModalProps {
	title: string;
	message: string;
	onConfirm: () => void;
	onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	title,
	message,
	onConfirm,
	onClose,
}) => {
	return (
		<Modal title={title} onClose={onClose}>
			<div className="flex flex-col gap-4 w-full items-center">
				<h3 className="text-xl font-bold text-center">{message}</h3>
				<div className="flex gap-4 w-full">
					<button
						type="button"
						onClick={onConfirm}
						className="flex-1 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
					>
						Aceptar
					</button>
					<button
						type="button"
						onClick={onClose}
						className="flex-1 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
					>
						Cancelar
					</button>
				</div>
			</div>
		</Modal>
	);
};
