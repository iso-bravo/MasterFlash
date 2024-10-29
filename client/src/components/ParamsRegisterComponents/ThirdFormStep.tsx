import useFormStore from '../../stores/ParamsRegisterStore';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IccParamsRegister, ThirdParamsRegister } from '../../types/ParamsRegisterTypes';

type ParamsRegister = IccParamsRegister | ThirdParamsRegister;

const ThirdFormStep = () => {
    const { initParams, secondParams, iccParams, thirdParams, setSteps, setThirdParams, setIccParams } = useFormStore();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm<ParamsRegister>({
        mode: 'onChange',
        defaultValues: {
            batch: initParams.icc ? iccParams?.batch || '' : thirdParams?.batch || '',
            julian: initParams.icc ? iccParams?.julian : undefined,
            ts2: initParams.icc ? undefined : thirdParams?.ts2,
            cavities_arr: Array(secondParams.cavities || 1).fill([0, 0, 0, 0]),
        },
    });

    const cavitiesData = watch('cavities_arr');

    useEffect(() => {
        if (initParams.icc && iccParams) {
            setIccParams({ ...iccParams, cavities_arr: cavitiesData });
        } else if (thirdParams) {
            setThirdParams({ ...thirdParams, cavities_arr: cavitiesData });
        }
    }, [cavitiesData]);

    const onSubmit: SubmitHandler<ParamsRegister> = data => {
        if (!data.batch) {
            toast.error('Por favor, completa el campo Batch.');
            return;
        }

        if (initParams.icc) {
            if (!(data as IccParamsRegister).julian) {
                toast.error('Por favor, completa el campo Julian.');
                return;
            }
        } else {
            if (!(data as ThirdParamsRegister).ts2) {
                toast.error('Por favor, completa el campo TS2.');
                return;
            }
        }

        const areCavitiesValid = data.cavities_arr.every((cavity: number[]) =>
            cavity.every((value: number) => value !== 0),
        );

        if (!areCavitiesValid) {
            toast.error('Por favor, completa todos los valores de las cavidades.');
            return;
        }

        // Actualización de estado global
        try {
            if (initParams.icc) {
                setIccParams(data as IccParamsRegister);
            } else {
                setThirdParams(data as ThirdParamsRegister);
            }
            setSteps(4); // Sólo cambia el paso si no hay errores
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
                                    {...register('julian', { required: initParams.icc })}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                                {(errors as { julian?: number | undefined })?.julian && (
                                    <span className='text-red-500 text-sm'>Campo requerido</span>
                                )}
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
                                    {...register('ts2', { required: !initParams.icc })}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                                {(errors as { ts2?: number | undefined })?.ts2 && (
                                    <span className='text-red-500 text-sm'>Campo requerido</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4'>
                    {cavitiesData.map((cavity: number[], cavityIndex: number) => (
                        <div key={cavityIndex} className='p-2 border border-gray-300 rounded-lg'>
                            <h5 className='mb-2 text-lg font-medium text-gray-900'>Cavity {cavityIndex + 1}</h5>
                            <div className='grid grid-cols-4 gap-2'>
                                {cavity.map((value: number, valueIndex: number) => (
                                    <div key={valueIndex}>
                                        <label className='block mb-1 text-sm font-medium text-gray-900'>
                                            Value {valueIndex + 1}
                                        </label>
                                        <input
                                            type='number'
                                            step='0.01'
                                            min={0}
                                            value={value}
                                            onChange={e =>
                                                setValue(
                                                    `cavities_arr.${cavityIndex}.${valueIndex}`,
                                                    Number(e.target.value),
                                                )
                                            }
                                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    type='submit'
                    className={`w-full text-white ${
                        isValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-300 cursor-not-allowed'
                    } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                    disabled={!isValid}
                >
                    Siguiente
                </button>
            </form>
        </div>
    );
};

export default ThirdFormStep;
