import { IoClose } from 'react-icons/io5';
import { PiWarningCircleLight } from 'react-icons/pi';

interface ConfirmPopUpProps {
    show: boolean;
    onClose: () => void;
    onAccept: () => void;
}

const ConfirmPopUp: React.FC<ConfirmPopUpProps> = ({ show, onClose, onAccept }) => {
    if (!show) return null;

    return (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'>
                <div className='relative'>
                    <button className='absolute top-2 right-2 text-gray-400 hover:text-gray-600' onClick={onClose}>
                        <IoClose size={24} />
                    </button>
                    <div className='flex flex-col items-center'>
                        <PiWarningCircleLight size={48} className='text-red-600 mb-4' />
                        <h3 className='mb-4 text-lg font-medium text-gray-700'>
                            ¿Estás seguro que quieres borrar este registro?
                        </h3>
                        <div className='flex space-x-4'>
                            <button
                                className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition'
                                onClick={onAccept}
                            >
                                Sí, estoy seguro
                            </button>
                            <button
                                className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition'
                                onClick={onClose}
                            >
                                No, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopUp;
