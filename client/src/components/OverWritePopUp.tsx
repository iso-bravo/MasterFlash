import { IoClose } from 'react-icons/io5';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

const OverWritePopUp: React.FC<ModalProps> = ({ show, onClose, onConfirm, message }) => {
    if (!show) return null;

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10'>
            <div className='bg-white p-6 rounded shadow-lg'>
                <div className='flex justify-end mb-5'>
                    <IoClose size={40} className='cursor-pointer' onClick={onClose} />
                </div>
                <p className='font-medium text-gray-900 text-center'>{message}</p>
                <div className='flex flex-row justify-between mt-10'>
                <button onClick={onClose} className='px-4 py-2 bg-[#e74c3c] text-white rounded'>
                    Cancelar
                </button>
                <button onClick={onConfirm} className='px-4 py-2 bg-[#07bc0c] text-white rounded'>
                    Confirmar
                </button>
                </div>
            </div>
        </div>
    );
};

export default OverWritePopUp;
