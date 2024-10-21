import { useForm } from 'react-hook-form';
import { LabelsCavitiesFormValues } from '../../types/PartNumsRegisterTypes';
import { usePartNumForm } from '../../stores/PartNumsRegisterStore';

const LabelsCavitiesForm: React.FC = () => {
    const { labelsCavities, updateLabelsCavities, setSteps } = usePartNumForm();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LabelsCavitiesFormValues>({
        defaultValues: labelsCavities,
    });

    const onSubmit = (data: LabelsCavitiesFormValues) => {
        updateLabelsCavities(data);
        setSteps(5); // Ajusta este valor según el flujo de pasos de tu formulario
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Cavities</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.cavities ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('cavities')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Category</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('category')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Type</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.type2 ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('type2')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Measurement</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.measurement ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('measurement')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Special</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.special ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('special')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Piece Label</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.piece_label ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('piece_label')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Quantity of Piece Labels</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.qty_piece_labels ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('qty_piece_labels')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Box Label 1</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.box_label ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('box_label')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Quantity of Box Labels 1</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.qty_box_labels ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('qty_box_labels')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Box Label 2</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.box_label_2 ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('box_label_2')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Quantity of Box Labels 2</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.qty_box_labels_2 ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('qty_box_labels_2')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Box Label 3</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.box_label_3 ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('box_label_3')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Quantity of Box Labels 3</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.qty_box_labels_3 ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('qty_box_labels_3')}
                />
            </div>

            <button
                className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center'
                type='submit'
            >
                Next
            </button>
        </form>
    );
};

export default LabelsCavitiesForm;
