import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IoClose } from 'react-icons/io5';
import api from '../config/axiosConfig';

interface PartNum {
    id: number;
    part_number: string;
    client: string;
    box: string;
    pieces_x_box: number;
    rubber_compound: string;
    price?: number;
    standard: number;
    pallet: string;
    box_x_pallet: number;
    pieces_x_pallet?: number;
    assembly?: string;
    accessories?: string;
    mold: string;
    instructive?: string;
    insert: string;
    gripper: string;
    caliber: string;
    paint?: string;
    std_paint?: number;
    painter?: number;
    scrap?: number;
    box_logo?: string;
    cavities?: number;
    category?: string;
    type2?: string;
    measurement?: string;
    special?: string;
    piece_label?: string;
    qty_piece_labels?: number;
    box_label?: string;
    qty_box_labels?: number;
    box_label_2?: string;
    qty_box_labels_2?: number;
    box_label_3?: string;
    qty_box_labels_3?: number;
    made_in_mexico?: string;
    staples?: string;
    image_piece_label?: File | null;
    image_box_label?: File | null;
    image_box_label_2?: File | null;
    image_box_label_3?: File | null;
}

interface EditPartNumModalProps {
    partNumId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedPartNum: PartNum) => Promise<void>;
}

const EditPartNumModal: React.FC<EditPartNumModalProps> = ({ partNumId, isOpen, onClose, onSave }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PartNum>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [partNumData, setPartNumData] = useState<PartNum | null>(null);

    useEffect(() => {
        if (isOpen && partNumId) {
            setLoading(true);

            api.get(`/part_numbers/${partNumId}/`)
                .then(response => {
                    setPartNumData(response.data);
                    reset(response.data);
                    setError(null);
                })
                .catch(err => {
                    console.error(err);
                    setError('Error al cargar los datos del número de parte.');
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, partNumId, reset]);

    if (!isOpen) return null;

    const onSubmit: SubmitHandler<PartNum> = data => {
        onSave(data);
        onClose();
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
            <div className='bg-white p-6 rounded-md shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden'>
                <div className='flex justify-between items-center'>
                    <h2 className='text-xl font-bold'>Editar Número de Parte</h2>
                    <IoClose size={30} className='cursor-pointer' onClick={onClose} />
                </div>

                {loading && <p className='text-gray-500'>Cargando datos...</p>}
                {error && <p className='text-red-500'>{error}</p>}

                {!loading && (
                    <form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
                        <div className='overflow-y-auto max-h-[70vh] pr-4'>
                            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                {partNumData &&
                                    Object.keys(partNumData).map(key => (
                                        <div key={key} className='col-span-1'>
                                            <label className='block mb-1 capitalize'>{key.replace(/_/g, ' ')}</label>
                                            {key.startsWith('image_') ? (
                                                <input
                                                    type='file'
                                                    {...register(key as keyof PartNum)}
                                                    className='w-full p-2 border rounded'
                                                />
                                            ) : (
                                                <input
                                                    type='text'
                                                    {...register(key as keyof PartNum)}
                                                    className='w-full p-2 border rounded'
                                                    placeholder={key.replace(/_/g, ' ')}
                                                />
                                            )}
                                            {errors[key as keyof PartNum] && (
                                                <p className='text-red-500 text-sm'>
                                                    Error en {key.replace(/_/g, ' ')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
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
                            <button
                                type='submit'
                                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditPartNumModal;
