import Modal from "./Modal";

interface PiecesPerOrderModalProps {
	onAccept: () => void;
	onClose: () => void;
}

const PiecesPerOrderModal: React.FC<PiecesPerOrderModalProps> = ({
	onAccept,
	onClose,
}) => {
	return (
		<Modal
			title="Las piezas introducidas son más que las que necesita la orden"
			onClose={onClose}
		>
			<p className="text-lg font-medium text-gray-700 flex items-center justify-center">
				¿Desea continuar con la orden?
			</p>
			<div className="mt-4 flex justify-evenly">
				<button
					type="button"
					onClick={onAccept}
					className=" w-full focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
				>
					Continuar
				</button>
				<button
					type="button"
					onClick={onClose}
					className="w-full focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
				>
					Cancelar
				</button>
			</div>
		</Modal>
	);
};

export default PiecesPerOrderModal;
