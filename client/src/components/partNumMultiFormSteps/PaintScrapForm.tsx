import { useForm } from 'react-hook-form';
import { PaintScrapFormValues } from '../../types/PartNumsRegisterTypes';
import { usePartNumForm } from '../../stores/PartNumsRegisterStore';

const PaintScrapForm: React.FC = () => {
    const { paintScrap, updatePaintScrap, setSteps } = usePartNumForm();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PaintScrapFormValues>({
        defaultValues: paintScrap,
    });

    const onSubmit = (data: PaintScrapFormValues) => {
        updatePaintScrap(data);
        setSteps(4); 
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Caliber</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.caliber ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('caliber')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Paint</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.paint ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('paint')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Standard Paint</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.std_paint ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('std_paint')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Painter</label>
                <input
                    type='number'
                    step='0.000000001'
                    className={`bg-gray-50 border ${
                        errors.painter ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('painter')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Scrap</label>
                <input
                    type='number'
                    step='0.000000001'
                    className={`bg-gray-50 border ${
                        errors.scrap ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('scrap')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Box Logo</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.box_logo ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('box_logo')}
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

export default PaintScrapForm;
