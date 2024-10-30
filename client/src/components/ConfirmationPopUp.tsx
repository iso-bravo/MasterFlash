import { IoClose } from 'react-icons/io5';

interface Summary {
    date: string;
    shift: string;
    line: string;
    auditor: string;
    molder: string;
    inputs: {
        partNumber: string;
        compound: string;
        insert: string;
        gripper: string;
        metal: string;
        insertWithoutRubber: string;
        gripperWithoutRubber: string;
        rubberWeight: string;
        insertWithRubber: string;
        gripperWithRubber: string;
        recycledInserts: string;
        totalInserts: string;
        totalGrippers: string;
    };
    codes: { [key: string]: string };
}

interface ModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    summary: Summary;
}

const ConfirmationPopUp: React.FC<ModalProps> = ({ show, onClose, onConfirm, summary }) => {
    if (!show) return null;

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10'>
            <div className='bg-white p-6 rounded shadow-lg'>
                <div className='flex justify-end mb-5'>
                    <IoClose size={40} className='cursor-pointer' onClick={onClose} />
                </div>
                <h2 className='text-gray-900 text-3xl font-extrabold mb-2'>Confirmación de Registro</h2>
                <div className='flex flex-col justify-center p-5 text-lg'>
                    <p className='tracking-tight text-gray-600 md:text-lg'>
                        <strong>Fecha:</strong> {summary.date}
                    </p>
                    <p className='tracking-tight text-gray-600 md:text-lg'>
                        <strong>Línea:</strong> {summary.line}
                    </p>
                    <p className='text-3xl text-gray-900 font-medium'>Inputs</p>
                    <p>-------------------</p>
                    {Object.keys(summary.inputs).map(key => (
                        <p key={key} className='tracking-tighter text-gray-700 md:text-lg'>
                            <strong>{key}: </strong>
                            {summary.inputs[key as keyof typeof summary.inputs]}
                        </p>
                    ))}
                    <div className='flex flex-row justify-between pt-8'>
                        <button
                            className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                            onClick={onConfirm}
                        >
                            Confirmar
                        </button>
                        <button
                            className='focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopUp;
