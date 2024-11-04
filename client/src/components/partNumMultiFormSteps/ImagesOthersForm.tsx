import { useForm } from 'react-hook-form';
import { ImagesOthersFormValues } from '../../types/PartNumsRegisterTypes';
import { usePartNumForm } from '../../stores/PartNumsRegisterStore';

const ImagesOthersForm: React.FC = () => {
    const { imagesOthers, updateImagesOthers, setSteps } = usePartNumForm();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ImagesOthersFormValues>({
        defaultValues: imagesOthers,
    });

    const onSubmit = (data: ImagesOthersFormValues) => {
        updateImagesOthers(data);
        setSteps(6); 
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 grid grid-cols-1'>
            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Made in Mexico</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.made_in_mexico ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('made_in_mexico')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Staples</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.staples ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('staples')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Image Piece Label</label>
                <input
                    type='file'
                    className={`bg-gray-50 border ${
                        errors.image_piece_label ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('image_piece_label')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Image Box Label 1</label>
                <input
                    type='file'
                    className={`bg-gray-50 border ${
                        errors.image_box_label ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('image_box_label')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Image Box Label 2</label>
                <input
                    type='file'
                    className={`bg-gray-50 border ${
                        errors.image_box_label_2 ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('image_box_label_2')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Image Box Label 3</label>
                <input
                    type='file'
                    className={`bg-gray-50 border ${
                        errors.image_box_label_3 ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('image_box_label_3')}
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

export default ImagesOthersForm;
