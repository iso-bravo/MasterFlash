import useFormStore from '../../stores/ParamsRegisterStore';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { ThirdParamsRegister } from '../../types/ParamsRegisterTypes';

const ThirdFormStep = () => {
    const { initParams, secondParams, thirdParams, setSteps, setThirdParams } = useFormStore();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<ThirdParamsRegister>({
        mode: 'onChange',
        defaultValues: {
            batch: thirdParams?.batch || '',
            julian: initParams.icc ? thirdParams.julian : undefined,
            ts2: !initParams.icc ? thirdParams.ts2 : undefined,
            cavities_arr:
                thirdParams.cavities_arr.length > 0
                    ? thirdParams.cavities_arr
                    : Array(secondParams.cavities).fill([0, 0, 0, 0]),
        },
    });

    const cavities_arr = useWatch({ control, name: 'cavities_arr' });

    const handleCavityChange = (cavityIndex: number, valueIndex: number, value: number) => {
        const updatedCavitiesArr = cavities_arr.map((cavity, index) =>
            index === cavityIndex ? cavity.map((val, idx) => (idx === valueIndex ? value : val)) : cavity,
        );
        setValue('cavities_arr', updatedCavitiesArr);
    };

    useEffect(() => {
        setValue(
            'cavities_arr',
            thirdParams.cavities_arr.length > 0
                ? thirdParams.cavities_arr
                : Array(secondParams.cavities).fill([0, 0, 0, 0]),
        );
    }, [thirdParams.cavities_arr, secondParams.cavities]);

    useEffect(() => {
        setThirdParams({ ...thirdParams, cavities_arr });
    }, [cavities_arr]);

    const onSubmit: SubmitHandler<ThirdParamsRegister> = data => {
        if (!data.batch) {
            toast.error('Por favor, completa el campo Batch.');
            return;
        }

        if (initParams.icc && !data.julian) {
            toast.error('Por favor, completa el campo Julian.');
            return;
        }

        if (!initParams.icc && !data.ts2) {
            toast.error('Por favor, completa el campo TS2.');
            return;
        }

        const areCavitiesValid = data.cavities_arr.every(cavity => cavity.every(value => value !== 0));

        if (!areCavitiesValid) {
            toast.error('Por favor, completa todos los valores de las cavidades.');
            return;
        }

        try {
            setThirdParams(data);
            setSteps(4);
        } catch (error) {
            console.error('Error setting params: ', error);
            toast.error('Ocurrió un error al procesar los datos.');
        }
    };

    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <h5 className='text-xl font-medium text-gray-900'>
                    {initParams.icc ? 'Registro ICC' : 'Registro de paredes'}
                </h5>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label htmlFor='batch' className='block mb-2 text-sm font-medium text-gray-900'>
                            Batch
                        </label>
                        <input
                            type='text'
                            id='batch'
                            {...register('batch', { required: true })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        />
                        {errors.batch && <span className='text-red-500 text-sm'>Campo requerido</span>}
                    </div>
                    <div>
                        {initParams.icc ? (
                            <>
                                <label htmlFor='julian' className='block mb-2 text-sm font-medium text-gray-900'>
                                    Julian
                                </label>
                                <input
                                    type='number'
                                    step='0.01'
                                    id='julian'
                                    {...register('julian', { required: true })}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                                {errors.julian && <span className='text-red-500 text-sm'>Campo requerido</span>}
                            </>
                        ) : (
                            <>
                                <label htmlFor='ts2' className='block mb-2 text-sm font-medium text-gray-900'>
                                    TS2
                                </label>
                                <input
                                    type='number'
                                    step='0.01'
                                    id='ts2'
                                    {...register('ts2', { required: true })}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                                {errors.ts2 && <span className='text-red-500 text-sm'>Campo requerido</span>}
                            </>
                        )}
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4'>
                    {cavities_arr.map((cavity, cavityIndex) => (
                        <div key={cavityIndex} className='p-2 border border-gray-300 rounded-lg'>
                            <h5 className='mb-2 text-lg font-medium text-gray-900'>Cavity {cavityIndex + 1}</h5>
                            <div className='grid grid-cols-4 gap-2'>
                                {cavity.map((value, valueIndex) => (
                                    <input
                                        key={valueIndex}
                                        type='number'
                                        step='0.01'
                                        min={0}
                                        value={value}
                                        onChange={e =>
                                            handleCavityChange(cavityIndex, valueIndex, Number(e.target.value))
                                        }
                                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    type='submit'
                    className='w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
                >
                    Continuar
                </button>
            </form>
        </div>
    );
};

export default ThirdFormStep;
