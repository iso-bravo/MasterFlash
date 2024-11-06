import React, {  useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Toaster } from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';

interface PopupProps {
    machineData: {
        name: string;
        state: string;
        employee_number: string;
        pieces_ok: string;
        pieces_rework: string;
        part_number: string;
        work_order: string;
        total_ok: string;
        molder_number: string;
    };
    onClose: () => void;
    onSave: (
        newEmployeeNumber: string,
        newPiecesOK: string,
        newPiecesRework: string,
        newPartNumber: string,
        newWork_order: string,
        newMolderNumber: string,
    ) => Promise<void>;
}

const Popup: React.FC<PopupProps> = ({ machineData, onClose, onSave }) => {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            employeeNumber: '',
            partNumber: '',
            piecesOK: '',
            piecesRework: '',
            workOrder: '',
            molderNumber: '',
            relay: false,
        },
    });

    const relay = watch('relay');
    const workOrder = watch('workOrder');
    const partNumber = watch('partNumber');

    useEffect(() => {
        if (workOrder || partNumber) {
            setValue('piecesOK', '0');
            setValue('piecesRework', '0');
        }
    }, [workOrder, partNumber, setValue]);

    useEffect(() => {
        if (!relay) setValue('molderNumber', '');
    }, [relay, setValue]);

    const onSubmit = async (data: any) => {
        try {
            await onSave(
                data.employeeNumber,
                data.piecesOK,
                data.piecesRework,
                data.partNumber,
                data.workOrder,
                data.molderNumber,
            );
            onClose();
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };

    return (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40'>
            <Toaster />
            <div className='bg-[#E4E3E3] px-7 py-5 pb-14 rounded-md h-auto flex flex-col sm:w-3/4 md:w-2/3 lg:w-2/4'>
                <div className='flex justify-end'>
                    <IoClose size={40} className='cursor-pointer' onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-y-4 text-center sm:text-start'>
                    {[
                        { label: 'Orden de Trabajo', name: 'workOrder', placeholder: machineData.work_order },
                        { label: 'Número de Parte', name: 'partNumber', placeholder: machineData.part_number },
                        {
                            label: 'Empacador',
                            name: 'employeeNumber',
                            placeholder: machineData.employee_number,
                            type: 'number',
                        },
                        {
                            label: 'Moldeador',
                            name: 'molderNumber',
                            placeholder: machineData.molder_number,
                            type: 'number',
                        },
                        { label: 'Piezas Producidas', name: 'piecesOK', placeholder: '0', type: 'number' },
                        { label: 'Piezas Retrabajo', name: 'piecesRework', placeholder: '0', type: 'number' },
                    ].map(({ label, name, placeholder, type = 'text' }, idx) => (
                        <div key={idx} className='flex flex-col sm:flex-row md:flex-row gap-y-4 md:gap-x-5'>
                            <label htmlFor={`${name}Input`} className='text-xl w-11/12 md:w-1/2'>
                                {label}
                            </label>
                            <input
                                id={`${name}Input`}
                                type={type}
                                {...register(name)}
                                className='bg-white rounded-md w-full md:w-64 px-2'
                                placeholder={placeholder}
                                min={type === 'number' ? '0' : undefined}
                            />
                        </div>
                    ))}
                    <div>
                        <label className='inline-flex items-center cursor-pointer'>
                            <input type='checkbox' className='sr-only peer' {...register('relay')} />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className='ms-3 text-sm font-medium text-gray-900'>Relevo</span>
                        </label>
                    </div>
                    <button
                        type='submit'
                        className='bg-[#73e33c] px-6 py-2 text-xl rounded-md hover:bg-[#78e741] focus:outline-none focus:ring focus:ring-[#3fd555]'
                    >
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Popup;
