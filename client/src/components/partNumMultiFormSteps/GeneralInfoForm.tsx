import { useForm } from 'react-hook-form';
import { GeneralInfoFormValues } from '../../types/PartNumsRegisterTypes';
import { usePartNumForm } from '../../stores/PartNumsRegisterStore';

const GeneralInfoForm: React.FC = () => {
    const { generalInfo, updateGeneralInfo, setSteps } = usePartNumForm();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GeneralInfoFormValues>({
        defaultValues: generalInfo,
    });

    const onSubmit = (data: GeneralInfoFormValues) => {
        updateGeneralInfo(data);
        setSteps(2);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Part Number</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.part_number ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('part_number', { required: 'Part number is required' })}
                />
                {errors.part_number && <p className='mt-2 text-sm text-red-600'>{errors.part_number.message}</p>}
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Client</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.client ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('client', { required: 'Client is required' })}
                />
                {errors.client && <p className='mt-2 text-sm text-red-600'>{errors.client.message}</p>}
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Box</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.box ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('box')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Pieces per Box</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.pieces_x_box ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('pieces_x_box')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Rubber Compound</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.rubber_compound ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('rubber_compound')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Price</label>
                <input
                    type='number'
                    step='0.001'
                    className={`bg-gray-50 border ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('price')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Standard</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.standard ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('standard')}
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

export default GeneralInfoForm;
