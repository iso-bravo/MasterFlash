import { useForm } from 'react-hook-form';
import { PalletAssemblyFormValues } from '../../types/PartNumsRegisterTypes';
import { usePartNumForm } from '../../stores/PartNumsRegisterStore';

const PalletAssemblyForm: React.FC = () => {
    const { palletAssembly, updatePalletAssembly, setSteps } = usePartNumForm();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PalletAssemblyFormValues>({
        defaultValues: palletAssembly,
    });

    const onSubmit = (data: PalletAssemblyFormValues) => {
        updatePalletAssembly(data);
        setSteps(3);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 grid grid-cols-1'>
            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Pallet</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.pallet ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('pallet')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Box per Pallet</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.box_x_pallet ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('box_x_pallet')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Pieces per Pallet</label>
                <input
                    type='number'
                    className={`bg-gray-50 border ${
                        errors.pieces_x_pallet ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('pieces_x_pallet')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Assembly</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.assembly ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('assembly')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Accessories</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.accessories ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('accessories')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Mold</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.mold ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('mold')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Instructive</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.instructive ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('instructive')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Insert</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.insert ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('insert')}
                />
            </div>

            <div>
                <label className='block mb-2 text-sm font-medium text-gray-900'>Gripper</label>
                <input
                    className={`bg-gray-50 border ${
                        errors.gripper ? 'border-red-500' : 'border-gray-300'
                    } text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    {...register('gripper')}
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

export default PalletAssemblyForm;
