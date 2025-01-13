import { useForm } from 'react-hook-form';
import Modal from '../Modal';

interface Insert {
    insert: string;
    weight: number;
    caliber: number;
    chemlok: number;
}

type NewInsert = Omit<Insert, 'id'>;

interface AddNewInsertProps {
    onClose: () => void;
    onSubmit: (newInsert: NewInsert) => Promise<void>;
}

const AddNewInsert: React.FC<AddNewInsertProps> = ({ onClose, onSubmit }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewInsert>();

    // Opciones válidas para el campo "caliber"
    const caliberOptions = [0.025, 0.032, 0.04];

    return (
        <Modal onClose={onClose} title='Nuevo inserto'>
            <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-2 gap-4'>
                <div className='col-span-1'>
                    <label className='block mb-1 capitalize'>Nombre del Inserto</label>
                    <input
                        type='text'
                        {...register('insert', { required: true })}
                        className='w-full p-2 border rounded'
                        placeholder='Inserto'
                    />
                    {errors.insert && <p className='text-red-500 text-sm'>Error en inserto</p>}
                </div>
                <div className='col-span-1'>
                    <label className='block mb-1 capitalize'>Calibre</label>
                    <select {...register('caliber', { required: true })} className='w-full p-2 border rounded'>
                        <option value=''>Selecciona un calibre</option>
                        {caliberOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {errors.caliber && <p className='text-red-500 text-sm'>Selecciona un calibre</p>}
                </div>
                <div className='col-span-1'>
                    <label className='block mb-1 capitalize'>Peso</label>
                    <input
                        type='number'
                        min={0}
                        step={0.001}
                        {...register('weight', { required: true })}
                        className='w-full p-2 border rounded'
                        placeholder='Peso'
                    />
                    {errors.weight && <p className='text-red-500 text-sm'>Error en peso</p>}
                </div>
                <div className='col-span-1'>
                    <label className='block mb-1 capitalize'>Chemlok</label>
                    <input
                        type='number'
                        min={0}
                        step={0.001}
                        {...register('chemlok', { required: true })}
                        className='w-full p-2 border rounded'
                        placeholder='Chemlok'
                    />
                    {errors.chemlok && <p className='text-red-500 text-sm'>Error en Chemlok</p>}
                </div>
                <div className='col-span-2 flex justify-end space-x-4 mt-6'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100'
                    >
                        Cancelar
                    </button>
                    <button
                        type='submit'
                        className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddNewInsert;
