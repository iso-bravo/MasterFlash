import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IoClose } from 'react-icons/io5';

interface PartNum {
    id: number;
    part_number: string | null;
    box: string | null;
    client: string | null;
    pieces_x_box: number | null;
    rubber_compound: string | null;
    standard: number | null;
    pallet: string | null;
    box_x_pallet: number | null;
    pieces_x_pallet: number | null;
    mold: string | null;
    insert: string | null;
    caliber: string | null;
    gripper: string | null;
}

interface EditPartNumModalProps {
    partNum: PartNum | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedPartNum: PartNum) => void;
}

const EditPartNumModal: React.FC<EditPartNumModalProps> = ({ partNum, isOpen, onClose, onSave }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PartNum>({
        defaultValues: partNum || {},
    });

    useEffect(() => {
        if (partNum) {
            reset(partNum);
        } else {
            reset({});
        }
    }, [partNum, reset]);

    if (!isOpen) return null;

    const onSubmit: SubmitHandler<PartNum> = data => {
        onSave(data);
        onClose();
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
            <div className='bg-white p-6 rounded-md shadow-lg w-1/2'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-xl font-bold'>Editar Número de Parte</h2>
                    <IoClose size={30} className='cursor-pointer' onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 mt-4'>
                    {/* Campos */}
                    <div>
                        <label className='block mb-1'>Número de Parte</label>
                        <input
                            {...register('part_number', { required: 'Este campo es obligatorio' })}
                            className={`w-full p-2 border rounded ${errors.part_number ? 'border-red-500' : ''}`}
                            placeholder='Número de Parte'
                        />
                        {errors.part_number && <p className='text-red-500 text-sm'>{errors.part_number.message}</p>}
                    </div>
                    <div>
                        <label className='block mb-1'>Box</label>
                        <input {...register('box')} className='w-full p-2 border rounded' placeholder='Box' />
                    </div>
                    <div>
                        <label className='block mb-1'>Cliente</label>
                        <input {...register('client')} className='w-full p-2 border rounded' placeholder='Cliente' />
                    </div>
                    <div>
                        <label className='block mb-1'>Piezas por Caja</label>
                        <input
                            type='number'
                            {...register('pieces_x_box')}
                            className='w-full p-2 border rounded'
                            placeholder='Piezas por Caja'
                        />
                    </div>
                    <div>
                        <label className='block mb-1'>Compuesto de Goma</label>
                        <input
                            {...register('rubber_compound')}
                            className='w-full p-2 border rounded'
                            placeholder='Compuesto de Goma'
                        />
                    </div>
                    <div>
                        <label className='block mb-1'>Estándar</label>
                        <input
                            type='number'
                            {...register('standard')}
                            className='w-full p-2 border rounded'
                            placeholder='Estándar'
                        />
                    </div>
                    <div>
                        <label className='block mb-1'>Pallet</label>
                        <input
                            type='number'
                            {...register('pallet')}
                            className='w-full p-2 border rounded'
                            placeholder='Estándar'
                        />
                    </div>
                    <div>
                        <label className='block mb-1'>Box X Pallet</label>
                        <input
                            type='number'
                            {...register('box_x_pallet')}
                            className='w-full p-2 border rounded'
                            placeholder='Estándar'
                        />
                    </div>
                    <div>
                        <label className='block mb-1'>Piezas X Pallet</label>
                        <input
                            type='number'
                            {...register('pieces_x_pallet')}
                            className='w-full p-2 border rounded'
                            placeholder='Estándar'
                        />
                    </div>
                    <div>
                        <label className='block mb-1'>Molde</label>
                        <input {...register('mold')} className='w-full p-2 border rounded' placeholder='Mold' />
                    </div>
                    <div>
                        <label className='block mb-1'>Inserto</label>
                        <input {...register('insert')} className='w-full p-2 border rounded' placeholder='Mold' />
                    </div>
                    <div>
                        <label className='block mb-1'>Calibre</label>
                        <input {...register('caliber')} className='w-full p-2 border rounded' placeholder='Mold' />
                    </div>
                    <div>
                        <label className='block mb-1'>Gripper</label>
                        <input {...register('gripper')} className='w-full p-2 border rounded' placeholder='Mold' />
                    </div>
                    <div className='flex justify-end space-x-2 mt-6'>
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
            </div>
        </div>
    );
};

export default EditPartNumModal;
