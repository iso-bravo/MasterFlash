import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IoClose } from 'react-icons/io5';

interface Insert {
    id: number;
    insert: string;
    weight: number;
    caliber: number;
    chemlok: number;
}

interface EditModalProps {
    onClose: () => void;
    insertObj: Insert;
    onSubmit: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ onClose, insertObj, onSubmit }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Insert>();

    useEffect(() => {
        reset(insertObj);
    }, [reset, insertObj]);

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
            <main className='bg-white p-6 rounded-md shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden'>
                <header className='flex justify-between items-center'>
                    <h2 className='text-xl font-bold'>Editar Inserto</h2>
                    <IoClose size={30} className='cursor-pointer' onClick={onClose} />
                </header>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
                    <div className='overflow-y-auto max-h-[70vh] pr-4'>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                            <div className='col-span-1'>
                                <label className='block mb-1 capitalize'>Inserto</label>
                                <input
                                    type='text'
                                    {...register('insert')}
                                    className='w-full p-2 border rounded'
                                    placeholder='Inserto'
                                />
                                {errors.insert && <p className='text-red-500 text-sm'>Error en inserto</p>}
                            </div>
                            <div className='col-span-1'>
                                <label className='block mb-1 capitalize'>Peso</label>
                                <input
                                    type='number'
                                    {...register('weight')}
                                    className='w-full p-2 border rounded'
                                    placeholder='Peso'
                                />
                                {errors.weight && <p className='text-red-500 text-sm'>Error en peso</p>}
                            </div>
                            <div className='col-span-1'>
                                <label className='block mb-1 capitalize'>Calibre</label>
                                <input
                                    type='number'
                                    {...register('caliber')}
                                    className='w-full p-2 border rounded'
                                    placeholder='Calibre'
                                />
                                {errors.caliber && <p className='text-red-500 text-sm'>Error en calibre</p>}
                            </div>
                            <div className='col-span-1'>
                                <label className='block mb-1 capitalize'>Chemlok</label>
                                <input
                                    type='number'
                                    {...register('chemlok')}
                                    className='w-full p-2 border rounded'
                                    placeholder='Chemlok'
                                />
                                {errors.chemlok && <p className='text-red-500 text-sm'>Error en chemlok</p>}
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className='col-span-2 flex justify-end space-x-4 mt-6'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
                        >
                            Cancelar
                        </button>
                        <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
                            Guardar
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditModal;
